package org.qhipapacha.astra.tumi.application.port.out;

import org.qhipapacha.astra.tumi.domain.TumiReply;
import org.qhipapacha.astra.tumi.domain.TumiScreenContext;

@FunctionalInterface
public interface TumiModel {
  TumiReply reply(String message, TumiScreenContext context);
}
