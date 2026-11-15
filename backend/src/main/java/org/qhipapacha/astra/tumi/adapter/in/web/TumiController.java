package org.qhipapacha.astra.tumi.adapter.in.web;

import jakarta.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.net.UnknownHostException;
import org.qhipapacha.astra.tumi.application.usecase.AskTumi;
import org.qhipapacha.astra.tumi.domain.TumiScreenContext;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class TumiController {
  private final AskTumi ask;

  public TumiController(AskTumi ask) {
    this.ask = ask;
  }

  @PostMapping(
      path = "/api/v1/tumi/replies",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  Reply reply(@RequestBody Question question, HttpServletRequest request) {
    requireLocalRequest(request);
    var context = question.context();
    var reply = ask.execute(question.message(),
        context == null ? null : new TumiScreenContext(context.view(), context.details()));
    return new Reply(reply.text(), reply.reaction());
  }

  private void requireLocalRequest(HttpServletRequest request) {
    String host = request.getServerName();
    if (!"localhost".equalsIgnoreCase(host) && !"127.0.0.1".equals(host)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    }
    try {
      if (InetAddress.getByName(request.getRemoteAddr()).isLoopbackAddress()) return;
    } catch (UnknownHostException ignored) {
      // Reject addresses that cannot be interpreted as loopback.
    }
    throw new ResponseStatusException(HttpStatus.FORBIDDEN);
  }

  @ExceptionHandler(AskTumi.InvalidMessage.class)
  ResponseEntity<ApiError> invalidMessage() {
    return ResponseEntity.badRequest().body(new ApiError("invalid_message"));
  }

  @ExceptionHandler(AskTumi.Unavailable.class)
  ResponseEntity<ApiError> unavailable() {
    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new ApiError("tumi_unavailable"));
  }

  record Question(String message, ScreenContext context) {}
  record ScreenContext(String view, String details) {}
  record Reply(String text, String reaction) {}
  record ApiError(String code) {}
}
