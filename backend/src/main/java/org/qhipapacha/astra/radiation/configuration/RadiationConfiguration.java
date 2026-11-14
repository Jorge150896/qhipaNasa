package org.qhipapacha.astra.radiation.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.nio.file.Path;
import java.time.Clock;
import java.time.Duration;
import java.time.ZoneId;
import org.qhipapacha.astra.radiation.adapter.out.external.RadLabClient;
import org.qhipapacha.astra.radiation.adapter.out.persistence.FileRadiationArchive;
import org.qhipapacha.astra.radiation.application.usecase.GetRadiationSeries;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class RadiationConfiguration {
  @Bean
  GetRadiationSeries radiationSeries(
      ObjectMapper mapper,
      @Value("${astra.radiation.archive}") String archive,
      @Value("${astra.radiation.source-time-zone}") String sourceZone) {
    var clock = Clock.systemUTC();
    var http =
        HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();
    return new GetRadiationSeries(
        new RadLabClient(http, URI.create(RadLabClient.ENDPOINT), clock, ZoneId.of(sourceZone)),
        new FileRadiationArchive(
            Path.of(archive).resolve("v1-" + sourceZone.replaceAll("[^A-Za-z0-9_-]", "_")), mapper),
        clock);
  }

  @Bean
  WebMvcConfigurer radiationCors(@Value("${astra.cors.origins}") String origins) {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry
            .addMapping("/api/v1/radiation/**")
            .allowedOrigins(origins.split(","))
            .allowedMethods("GET")
            .allowedHeaders("Accept")
            .maxAge(3600);
      }
    };
  }
}
