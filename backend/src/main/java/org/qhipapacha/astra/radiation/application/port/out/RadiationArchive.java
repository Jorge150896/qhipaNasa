package org.qhipapacha.astra.radiation.application.port.out;

import java.util.Optional;
import org.qhipapacha.astra.radiation.application.port.out.RadiationSource.Acquisition;
import org.qhipapacha.astra.radiation.domain.RadiationQuery;

public interface RadiationArchive {
  Optional<Acquisition> find(RadiationQuery query);

  void save(RadiationQuery query, Acquisition acquisition);
}
