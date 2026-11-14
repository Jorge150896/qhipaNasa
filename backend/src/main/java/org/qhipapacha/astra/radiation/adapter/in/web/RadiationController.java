package org.qhipapacha.astra.radiation.adapter.in.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import org.qhipapacha.astra.radiation.application.usecase.GetRadiationSeries;
import org.qhipapacha.astra.radiation.domain.RadiationQuery;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/radiation")
public class RadiationController {
  private final GetRadiationSeries getSeries;

  public RadiationController(GetRadiationSeries getSeries) {
    this.getSeries = getSeries;
  }

  @GetMapping("/instruments")
  public List<Instrument> instruments() {
    return List.of(
        new Instrument("DosTel1", "ISS", "Columbus"), new Instrument("DosTel2", "ISS", "Columbus"));
  }

  @GetMapping("/readings")
  public ResponseEntity<SeriesResponse> readings(
      @RequestParam String instrumentId, @RequestParam String from, @RequestParam String to) {
    var query =
        new RadiationQuery(
            instrumentId,
            OffsetDateTime.parse(from).toInstant(),
            OffsetDateTime.parse(to).toInstant());
    var result = getSeries.execute(query);
    var series = result.series();
    var provenance = series.source();
    var response =
        new SeriesResponse(
            new QueryResponse(query.instrumentId(), query.from(), query.to()),
            new SourceResponse(
                provenance.name(),
                provenance.requestUrl(),
                provenance.fetchedAt(),
                provenance.sha256(),
                true,
                provenance.sourceTimeZone(),
                provenance.timeZoneBasis()),
            result.cacheHit(),
            series.readings().size(),
            series.readings().stream()
                .map(
                    row ->
                        new ReadingResponse(
                            row.id(),
                            row.instrumentId(),
                            row.spacecraft(),
                            row.module(),
                            row.sourceTimestamp(),
                            row.observedAt(),
                            "absorbedDoseRate",
                            row.value(),
                            "µGy/h",
                            row.quality()))
                .toList());
    return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(response);
  }

  public record Instrument(String id, String spacecraft, String module) {}

  public record QueryResponse(String instrumentId, Instant from, Instant to) {}

  public record SourceResponse(
      String name,
      String requestUrl,
      Instant fetchedAt,
      String sha256,
      boolean historical,
      String sourceTimeZone,
      String timeZoneBasis) {}

  public record ReadingResponse(
      String id,
      String instrumentId,
      String spacecraft,
      String module,
      String sourceTimestamp,
      Instant observedAt,
      String indicator,
      BigDecimal value,
      String unit,
      String quality) {}

  public record SeriesResponse(
      QueryResponse query,
      SourceResponse source,
      boolean cacheHit,
      int count,
      List<ReadingResponse> readings) {}
}
