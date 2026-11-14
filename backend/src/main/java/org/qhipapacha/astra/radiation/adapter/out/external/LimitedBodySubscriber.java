package org.qhipapacha.astra.radiation.adapter.out.external;

import java.io.ByteArrayOutputStream;
import java.net.http.HttpResponse;
import java.nio.ByteBuffer;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.Flow;
import org.qhipapacha.astra.radiation.application.usecase.RadiationFailure;

/** Bounds memory even when the upstream omits Content-Length. */
final class LimitedBodySubscriber implements HttpResponse.BodySubscriber<byte[]> {
  private final int limit;
  private final ByteArrayOutputStream bytes = new ByteArrayOutputStream();
  private final CompletableFuture<byte[]> body = new CompletableFuture<>();
  private Flow.Subscription subscription;

  LimitedBodySubscriber(int limit) {
    this.limit = limit;
  }

  public CompletionStage<byte[]> getBody() {
    return body;
  }

  public void onSubscribe(Flow.Subscription subscription) {
    this.subscription = subscription;
    subscription.request(1);
  }

  public void onNext(List<ByteBuffer> items) {
    for (var item : items) {
      if ((long) bytes.size() + item.remaining() > limit) {
        subscription.cancel();
        body.completeExceptionally(new RadiationFailure(RadiationFailure.Kind.UPSTREAM_INVALID));
        return;
      }
      var part = new byte[item.remaining()];
      item.get(part);
      bytes.writeBytes(part);
    }
    subscription.request(1);
  }

  public void onError(Throwable error) {
    body.completeExceptionally(error);
  }

  public void onComplete() {
    body.complete(bytes.toByteArray());
  }
}
