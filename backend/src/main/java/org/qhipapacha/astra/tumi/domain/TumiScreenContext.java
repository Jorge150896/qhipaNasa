package org.qhipapacha.astra.tumi.domain;

public record TumiScreenContext(String view, String details, String language) {
  public TumiScreenContext(String view, String details) {
    this(view, details, null);
  }
}
