package org.qhipapacha.astra.radiation.application.usecase;

import java.time.Clock;
import org.qhipapacha.astra.radiation.application.port.out.RadiationArchive;
import org.qhipapacha.astra.radiation.application.port.out.RadiationSource;
import org.qhipapacha.astra.radiation.domain.RadiationQuery;
import org.qhipapacha.astra.radiation.domain.RadiationSeries;

public class GetRadiationSeries {
  private final RadiationSource source;
  private final RadiationArchive archive;
  private final Clock clock;

  public GetRadiationSeries(RadiationSource source, RadiationArchive archive, Clock clock) {
    this.source = source;
    this.archive = archive;
    this.clock = clock;
  }

  public Result execute(RadiationQuery query) {
    if (query.to().isAfter(clock.instant()))
      throw new IllegalArgumentException("El periodo debe ser histórico.");
    var saved = archive.find(query);
    if (saved.isPresent()) return new Result(saved.get().series(), true);
    var acquisition = source.fetch(query);
    archive.save(query, acquisition);
    return new Result(acquisition.series(), false);
  }

  public record Result(RadiationSeries series, boolean cacheHit) {}
}
