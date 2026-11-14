package org.qhipapacha.astra.radiation.domain;

import java.time.Instant;
import java.util.List;

public record RadiationSeries(
    RadiationQuery query, Source source, List<RadiationReading> readings) {
  public RadiationSeries {
    readings = List.copyOf(readings);
  }

  public record Source(
      String name,
      String requestUrl,
      Instant fetchedAt,
      String sha256,
      String sourceTimeZone,
      String timeZoneBasis) {}
}
