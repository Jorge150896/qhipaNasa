package org.qhipapacha.astra.radiation.application.usecase;

public class RadiationFailure extends RuntimeException {
  public enum Kind {
    UPSTREAM_UNAVAILABLE,
    UPSTREAM_INVALID,
    ARCHIVE_UNAVAILABLE
  }

  private final Kind kind;

  public RadiationFailure(Kind kind) {
    super(kind.name());
    this.kind = kind;
  }

  public Kind kind() {
    return kind;
  }
}
