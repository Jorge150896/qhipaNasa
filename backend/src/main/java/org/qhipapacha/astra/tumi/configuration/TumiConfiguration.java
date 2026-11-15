package org.qhipapacha.astra.tumi.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.time.Duration;
import org.qhipapacha.astra.tumi.adapter.out.external.OpenAiResponsesClient;
import org.qhipapacha.astra.tumi.application.usecase.AskTumi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class TumiConfiguration {
  @Bean
  AskTumi askTumi(
      ObjectMapper mapper,
      @Value("${OPENAI_API_KEY:}") String key,
      @Value("${OPENAI_MODEL:gpt-5.4-mini}") String model) {
    var client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    return new AskTumi(new OpenAiResponsesClient(
        client, mapper, URI.create("https://api.openai.com/v1/responses"), key.strip(), model));
  }

  @Bean
  WebMvcConfigurer tumiCors() {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/v1/tumi/replies")
            .allowedOrigins("http://localhost:3000", "http://127.0.0.1:3000")
            .allowedMethods("POST")
            .allowedHeaders("Content-Type");
      }
    };
  }
}
