package org.qhipapacha.astra.radiation.domain;

import java.math.BigDecimal;
import java.time.Instant;

public record RadiationReading(
    String id,
    String instrumentId,
    String spacecraft,
    String module,
    String sourceTimestamp,
    Instant observedAt,
    BigDecimal value,
    String quality) {
  public RadiationReading {
    if (id == null
        || id.isBlank()
        || instrumentId == null
        || spacecraft == null
        || module == null
        || sourceTimestamp == null
        || observedAt == null
        || (value == null
            ? !"missing".equals(quality)
            : value.signum() < 0 || !"reported".equals(quality)))
      throw new IllegalArgumentException("Medición de radiación incompatible.");
  }
}
