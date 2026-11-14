package org.qhipapacha.astra.radiation.application.port.out;

import org.qhipapacha.astra.radiation.domain.RadiationQuery;
import org.qhipapacha.astra.radiation.domain.RadiationSeries;

public interface RadiationSource {
  Acquisition fetch(RadiationQuery query);

  record Acquisition(RadiationSeries series, String originalCsv) {}
}
