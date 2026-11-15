package org.qhipapacha.astra.tumi.application.usecase;

import org.qhipapacha.astra.tumi.application.port.out.TumiModel;

import org.qhipapacha.astra.tumi.domain.TumiReply;
import org.qhipapacha.astra.tumi.domain.TumiScreenContext;

public final class AskTumi {
  public static final int MAX_MESSAGE_LENGTH = 600;
  private final TumiModel model;

  public AskTumi(TumiModel model) {
    this.model = model;
  }

  public TumiReply execute(String message, TumiScreenContext context) {
    if (message == null || message.isBlank() || message.length() > MAX_MESSAGE_LENGTH) {
      throw new InvalidMessage();
    }
    if (context != null && (context.view() == null || context.view().isBlank()
        || context.view().length() > 100 || context.details() == null
        || context.details().length() > 6000)) {
      throw new InvalidMessage();
    }
    return model.reply(message.strip(), context);
  }

  public static final class InvalidMessage extends RuntimeException {}

  public static final class Unavailable extends RuntimeException {}

  public static final class QuotaExceeded extends RuntimeException {}
}
