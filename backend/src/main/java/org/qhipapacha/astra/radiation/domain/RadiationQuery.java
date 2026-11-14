package org.qhipapacha.astra.radiation.domain;

import java.time.Duration;
import java.time.Instant;
import java.util.Set;

public record RadiationQuery(String instrumentId, Instant from, Instant to) {
  public static final Set<String> INSTRUMENTS = Set.of("DosTel1", "DosTel2");

  public RadiationQuery {
    if (!INSTRUMENTS.contains(instrumentId == null ? "" : instrumentId))
      throw new IllegalArgumentException("instrumentId debe ser DosTel1 o DosTel2.");
    if (from == null
        || to == null
        || !from.isBefore(to)
        || Duration.between(from, to).compareTo(Duration.ofHours(24)) > 0)
      throw new IllegalArgumentException("El periodo debe ser positivo y no superar 24 horas.");
  }
}
