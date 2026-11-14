package org.qhipapacha.astra.radiation;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;
import org.qhipapacha.astra.radiation.adapter.in.web.*;
import org.qhipapacha.astra.radiation.adapter.out.external.RadLabClient;
import org.qhipapacha.astra.radiation.adapter.out.persistence.FileRadiationArchive;
import org.qhipapacha.astra.radiation.application.port.out.*;
import org.qhipapacha.astra.radiation.application.usecase.*;
import org.qhipapacha.astra.radiation.domain.*;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class RadiationTest {
  static final Clock CLOCK = Clock.fixed(Instant.parse("2026-11-14T12:00:00Z"), ZoneOffset.UTC);
  static final RadiationQuery QUERY =
      new RadiationQuery(
          "DosTel1", Instant.parse("2022-03-01T00:00:00Z"), Instant.parse("2022-03-01T01:00:00Z"));
  static final String HEADER =
      "timestamp,instrument_id,absorbed_dose_rate,instrument,module,spacecraft\n";
  static final String CSV =
      HEADER + "2022-03-01T00:00:00,DosTel1,6.35004766666667,DosTel1,Columbus,ISS\n";
  final RadLabClient client =
      new RadLabClient(
          HttpClient.newHttpClient(), URI.create(RadLabClient.ENDPOINT), CLOCK, ZoneOffset.UTC);
  @TempDir Path directory;

  @Test
  void validatesPeriodAndInstrument() {
    assertThatThrownBy(() -> new RadiationQuery("Other", QUERY.from(), QUERY.to()))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> new RadiationQuery("DosTel1", QUERY.to(), QUERY.from()))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(
            () -> new RadiationQuery("DosTel1", QUERY.from(), QUERY.from().plusSeconds(86401)))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void mapsOfficialSampleAndPreservesSourceTimeAndHash() {
    var parsed = client.parse(QUERY, CSV, "https://example.invalid");
    var row = parsed.series().readings().getFirst();
    assertThat(row.value()).isEqualByComparingTo("6.35004766666667");
    assertThat(row.sourceTimestamp()).isEqualTo("2022-03-01T00:00:00");
    assertThat(row.observedAt()).isEqualTo(QUERY.from());
    assertThat(parsed.series().source().timeZoneBasis()).isEqualTo("configured-assumption");
    assertThat(parsed.series().source().sha256()).hasSize(64);
  }

  @Test
  void distinguishesMissingFromZeroAndDoesNotInterpolate() {
    var parsed =
        client.parse(QUERY, CSV.replace("6.35004766666667", "0"), "https://example.invalid");
    assertThat(parsed.series().readings().getFirst().value()).isZero();
    var missing =
        client.parse(QUERY, CSV.replace("6.35004766666667", "NA"), "https://example.invalid");
    assertThat(missing.series().readings().getFirst().value()).isNull();
    assertThat(missing.series().readings().getFirst().quality()).isEqualTo("missing");
    assertThat(client.parse(QUERY, HEADER, "https://example.invalid").series().readings())
        .isEmpty();
  }

  @Test
  void rejectsWrongIdentityDuplicatesOutOfPeriodMalformedAndNonfinite() {
    for (var csv :
        List.of(
            "<html>error</html>",
            CSV.replace("DosTel1", "DosTel2"),
            CSV + CSV.substring(HEADER.length()),
            CSV.replace("6.35004766666667", "-1"),
            CSV.replace("6.35004766666667", "NaN"),
            CSV.replace("6.35004766666667", "1e999"),
            CSV.replace("00:00:00", "01:00:00"))) {
      assertThatThrownBy(() -> client.parse(QUERY, csv, "https://example.invalid"))
          .isInstanceOf(RadiationFailure.class)
          .extracting("kind")
          .isEqualTo(RadiationFailure.Kind.UPSTREAM_INVALID);
    }
  }

  @Test
  void archivesSurviveNewRepositoryInstanceAndPreserveCorruption() throws Exception {
    var mapper = JsonMapper.builder().addModule(new JavaTimeModule()).build();
    var archive = new FileRadiationArchive(directory, mapper);
    var calls = new AtomicInteger();
    RadiationSource source =
        query -> {
          calls.incrementAndGet();
          return client.parse(query, CSV, RadLabClient.ENDPOINT);
        };
    assertThat(new GetRadiationSeries(source, archive, CLOCK).execute(QUERY).cacheHit()).isFalse();
    assertThat(
            new GetRadiationSeries(source, new FileRadiationArchive(directory, mapper), CLOCK)
                .execute(QUERY)
                .cacheHit())
        .isTrue();
    assertThat(calls).hasValue(1);
    try (var files = Files.list(directory)) {
      for (var file : files.toList()) Files.writeString(file, "{broken}");
    }
    assertThatThrownBy(() -> archive.find(QUERY)).isInstanceOf(RadiationFailure.class);
    assertThat(calls).hasValue(1);
  }

  @Test
  void reportsStorageFailureInsteadOfClaimingSuccess() throws Exception {
    var file = directory.resolve("not-a-directory");
    Files.writeString(file, "preserve");
    var archive =
        new FileRadiationArchive(
            file, JsonMapper.builder().addModule(new JavaTimeModule()).build());
    assertThatThrownBy(() -> archive.save(QUERY, client.parse(QUERY, CSV, RadLabClient.ENDPOINT)))
        .isInstanceOf(RadiationFailure.class)
        .extracting("kind")
        .isEqualTo(RadiationFailure.Kind.ARCHIVE_UNAVAILABLE);
    assertThat(Files.readString(file)).isEqualTo("preserve");
  }

  @Test
  void httpAdapterUsesEncodedFiltersAndReportsRemoteErrors() throws Exception {
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    var calls = new AtomicInteger();
    server.createContext(
        "/api/",
        exchange -> {
          assertThat(exchange.getRequestURI().getRawQuery())
              .contains("timestamp%3E=", "timestamp%3C", "instrument_id=DosTel1");
          var bytes = CSV.getBytes(java.nio.charset.StandardCharsets.UTF_8);
          exchange.sendResponseHeaders(calls.incrementAndGet() == 1 ? 200 : 503, bytes.length);
          try (var output = exchange.getResponseBody()) {
            output.write(bytes);
          }
        });
    server.start();
    try {
      var remote =
          new RadLabClient(
              HttpClient.newHttpClient(),
              URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/api/"),
              CLOCK,
              ZoneOffset.UTC);
      assertThat(remote.fetch(QUERY).series().readings()).hasSize(1);
      assertThatThrownBy(() -> remote.fetch(QUERY))
          .isInstanceOf(RadiationFailure.class)
          .extracting("kind")
          .isEqualTo(RadiationFailure.Kind.UPSTREAM_UNAVAILABLE);
    } finally {
      server.stop(0);
    }
  }

  MockMvc mvc() {
    var archive =
        new FileRadiationArchive(
            directory, JsonMapper.builder().addModule(new JavaTimeModule()).build());
    var usecase =
        new GetRadiationSeries(q -> client.parse(q, CSV, RadLabClient.ENDPOINT), archive, CLOCK);
    return MockMvcBuilders.standaloneSetup(new RadiationController(usecase))
        .setControllerAdvice(new RadiationErrorHandler())
        .build();
  }

  @Test
  void apiReturnsDocumentedUnitsMetadataAndPersistentCache() throws Exception {
    var mvc = mvc();
    for (var hit : List.of(false, true)) {
      mvc.perform(
              get("/api/v1/radiation/readings")
                  .param("instrumentId", "DosTel1")
                  .param("from", QUERY.from().toString())
                  .param("to", QUERY.to().toString()))
          .andExpect(status().isOk())
          .andExpect(header().string("Cache-Control", "no-store"))
          .andExpect(jsonPath("$.count").value(1))
          .andExpect(jsonPath("$.cacheHit").value(hit))
          .andExpect(jsonPath("$.source.historical").value(true))
          .andExpect(jsonPath("$.readings[0].unit").value("µGy/h"));
    }
  }

  @Test
  void apiRejectsMissingParametersUnzonedTimeAndFutureDates() throws Exception {
    var mvc = mvc();
    mvc.perform(get("/api/v1/radiation/readings"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_QUERY"));
    for (var from : List.of("2022-03-01T00:00:00", "garbage", "2027-01-01T00:00:00Z")) {
      mvc.perform(
              get("/api/v1/radiation/readings")
                  .param("instrumentId", "DosTel1")
                  .param("from", from)
                  .param("to", "2027-01-01T01:00:00Z"))
          .andExpect(status().isBadRequest());
    }
  }
}
