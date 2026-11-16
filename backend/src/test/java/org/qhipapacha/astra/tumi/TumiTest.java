package org.qhipapacha.astra.tumi;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import org.qhipapacha.astra.tumi.adapter.in.web.TumiController;
import org.qhipapacha.astra.tumi.adapter.out.external.OpenAiResponsesClient;
import org.qhipapacha.astra.tumi.application.usecase.AskTumi;
import org.qhipapacha.astra.tumi.application.usecase.TumiDailyQuota;
import org.qhipapacha.astra.tumi.domain.TumiReply;
import org.qhipapacha.astra.tumi.domain.TumiScreenContext;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class TumiTest {
  @Test
  void sendsScreenContextAndDecodesTheReaction() throws Exception {
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    var mapper = new ObjectMapper();
    var requestBody = new AtomicReference<JsonNode>();
    var authorization = new AtomicReference<String>();
    server.createContext("/v1/responses", exchange -> {
      try (exchange) {
        requestBody.set(mapper.readTree(exchange.getRequestBody()));
        authorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
        byte[] answer = """
            {"status":"completed","output":[
              {"type":"reasoning"},
              {"type":"message","content":[{"type":"output_text","text":"{\\"text\\":\\"Nami conectada.\\",\\"reaction\\":\\"focused\\"}"}]}
            ]}
            """.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(200, answer.length);
        exchange.getResponseBody().write(answer);
      }
    });
    server.start();
    try {
      var endpoint = URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/v1/responses");
      var client = new OpenAiResponsesClient(HttpClient.newHttpClient(), mapper, endpoint, "test-key", "test-model");
      var context = new TumiScreenContext("Tripulación · Historial",
          "Persona en pantalla: Elena Torres, Comandante (también llamada Lena). SpO₂: 98 % a las 14:32 UTC");
      assertThat(new AskTumi(client).execute(" ¿Cómo está Lena? ", context))
          .isEqualTo(new TumiReply("Nami conectada.", "focused"));
      assertThat(authorization.get()).isEqualTo("Bearer test-key");
      var input = mapper.readTree(requestBody.get().path("input").asText());
      assertThat(input.path("mensaje").asText()).isEqualTo("¿Cómo está Elena?");
      assertThat(input.path("pantalla").path("details").asText()).isEqualTo(context.details());
      assertThat(requestBody.get().path("instructions").asText())
          .contains("Eres Nami, la asistente virtual y mascota de Qhipa Pacha")
          .contains("comienza por su nombre y su rol o actividad")
          .contains("«Lena» se refiere a Elena Torres")
          .contains("con el ritmo de una conversación de voz")
          .contains("con un paso pequeño y concreto")
          .contains("responde con una proyección de la simulación")
          .contains("sin usar registros posteriores")
          .contains("sugiere acordar un momento con el equipo de apoyo");
      assertThat(requestBody.get().at("/text/format/type").asText()).isEqualTo("json_schema");
      assertThat(requestBody.get().path("store").asBoolean(true)).isFalse();
      assertThatThrownBy(() -> new AskTumi(client).execute(" ".repeat(601), null))
          .isInstanceOf(AskTumi.InvalidMessage.class);
    } finally {
      server.stop(0);
    }
  }

  @Test
  void rewritesAScreenReportBeforeReturningIt() throws Exception {
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    var mapper = new ObjectMapper();
    var calls = new AtomicInteger();
    var revision = new AtomicReference<JsonNode>();
    var draft = "Veo la opción en Monitoreo diario > Contexto.";
    var friendly = "Puedes empezar por contar cómo te fue hoy. Al final, podrás revisar lo que anotaste.";
    server.createContext("/v1/responses", exchange -> {
      try (exchange) {
        var request = mapper.readTree(exchange.getRequestBody());
        int call = calls.incrementAndGet();
        if (call == 2) revision.set(request);
        var answer = mapper.createObjectNode()
            .put("text", call == 1 ? draft : friendly)
            .put("reaction", "understanding");
        var response = mapper.createObjectNode().put("status", "completed");
        response.putArray("output").addObject().put("type", "message").putArray("content")
            .addObject().put("type", "output_text").put("text", answer.toString());
        byte[] bytes = mapper.writeValueAsBytes(response);
        exchange.sendResponseHeaders(200, bytes.length);
        exchange.getResponseBody().write(bytes);
      }
    });
    server.start();
    try {
      var endpoint = URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/v1/responses");
      var client = new OpenAiResponsesClient(HttpClient.newHttpClient(), mapper, endpoint, "test-key", "test-model");
      assertThat(client.reply("¿Cómo empiezo?", new TumiScreenContext("Monitoreo diario", "Contexto")))
          .isEqualTo(new TumiReply(friendly, "understanding"));
      assertThat(calls.get()).isEqualTo(2);
      assertThat(mapper.readTree(revision.get().path("input").asText()).path("borrador").asText())
          .isEqualTo(draft);
      assertThat(revision.get().path("instructions").asText()).contains("Redacta de nuevo el borrador");
    } finally {
      server.stop(0);
    }
  }

  @Test
  void servesLocalRequestsAndRejectsNonLoopback() throws Exception {
    var mvc = MockMvcBuilders.standaloneSetup(new TumiController(new AskTumi((message, context) -> new TumiReply("Hola", "happy")), "")).build();
    var path = "/api/v1/tumi/replies";
    mvc.perform(post(path).contentType("application/json").content("{\"message\":\"Hola\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.text").value("Hola"))
        .andExpect(jsonPath("$.reaction").value("happy"));
    mvc.perform(post(path).contentType("application/json").content("{\"message\":\"\"}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("invalid_message"));
    mvc.perform(post(path).contentType("application/json").content("{\"message\":\"Hola\"}")
            .with(request -> {
              request.setRemoteAddr("192.0.2.1");
              return request;
            }))
        .andExpect(status().isForbidden());
    mvc.perform(post(path).contentType("application/json").content("{\"message\":\"Hola\"}")
            .with(request -> {
              request.setServerName("example.test");
              return request;
            }))
        .andExpect(status().isForbidden());
  }

  @Test
  void publicDemoRequiresItsOriginAndLimitsPaidRequests() throws Exception {
    var quota = new TumiDailyQuota(Clock.fixed(Instant.parse("2026-11-15T00:00:00Z"), ZoneOffset.UTC), 1);
    var ask = new AskTumi((message, context) -> {
      quota.take();
      return new TumiReply("Hola", "happy");
    });
    var origin = "https://example.github.io";
    var mvc = MockMvcBuilders.standaloneSetup(new TumiController(ask, origin)).build();
    var path = "/api/v1/tumi/replies";

    mvc.perform(post(path).contentType("application/json").content("{\"message\":\"Hola\"}"))
        .andExpect(status().isForbidden());
    mvc.perform(post(path).header("Origin", "https://other.example").contentType("application/json")
            .content("{\"message\":\"Hola\"}"))
        .andExpect(status().isForbidden());
    mvc.perform(post(path).header("Origin", origin).contentType("application/json")
            .content("{\"message\":\"\"}"))
        .andExpect(status().isBadRequest());
    mvc.perform(post(path).header("Origin", origin).contentType("application/json")
            .content("{\"message\":\"Hola\"}"))
        .andExpect(status().isOk());
    mvc.perform(post(path).header("Origin", origin).contentType("application/json")
            .content("{\"message\":\"Hola\"}"))
        .andExpect(status().isTooManyRequests())
        .andExpect(jsonPath("$.code").value("daily_limit"));
  }
}
