package org.qhipapacha.astra.tumi.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.time.Clock;
import java.time.Duration;
import org.qhipapacha.astra.tumi.adapter.out.external.OpenAiResponsesClient;
import org.qhipapacha.astra.tumi.application.usecase.AskTumi;
import org.qhipapacha.astra.tumi.application.usecase.TumiDailyQuota;
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
      @Value("${OPENAI_MODEL:gpt-5.4-mini}") String model,
      @Value("${astra.tumi.public-origin}") String publicOrigin,
      @Value("${astra.tumi.public-daily-limit}") int publicDailyLimit) {
    var client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    var provider = new OpenAiResponsesClient(
        client, mapper, URI.create("https://api.openai.com/v1/responses"), key.strip(), model);
    if (publicOrigin.isBlank()) return new AskTumi(provider);
    var quota = new TumiDailyQuota(Clock.systemUTC(), publicDailyLimit);
    return new AskTumi((message, context) -> {
      quota.take();
      return provider.reply(message, context);
    });
  }

  @Bean
  WebMvcConfigurer tumiCors(@Value("${astra.tumi.public-origin}") String publicOrigin) {
    String[] allowedOrigins;
    if (publicOrigin.isBlank()) {
      allowedOrigins = new String[] {"http://localhost:3000", "http://127.0.0.1:3000"};
    } else {
      var origin = URI.create(publicOrigin.strip());
      if (!"https".equals(origin.getScheme()) || origin.getHost() == null
          || origin.getUserInfo() != null || !origin.getRawPath().isEmpty()
          || origin.getQuery() != null || origin.getFragment() != null) {
        throw new IllegalArgumentException("TUMI_PUBLIC_ORIGIN must be an HTTPS origin without a path");
      }
      allowedOrigins = new String[] {origin.toString()};
    }
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/v1/tumi/replies")
            .allowedOrigins(allowedOrigins)
            .allowedMethods("POST")
            .allowedHeaders("Content-Type");
      }
    };
  }
}
