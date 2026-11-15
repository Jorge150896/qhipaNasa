package org.qhipapacha.astra.tumi.application.usecase;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneOffset;

public final class TumiDailyQuota {
  private final Clock clock;
  private final int limit;
  private LocalDate day;
  private int used;

  public TumiDailyQuota(Clock clock, int limit) {
    if (limit < 1) throw new IllegalArgumentException("Tumi's daily request limit must be positive");
    this.clock = clock;
    this.limit = limit;
  }

  public synchronized void take() {
    var today = LocalDate.ofInstant(clock.instant(), ZoneOffset.UTC);
    if (!today.equals(day)) {
      day = today;
      used = 0;
    }
    if (used >= limit) throw new AskTumi.QuotaExceeded();
    used++;
  }
}
