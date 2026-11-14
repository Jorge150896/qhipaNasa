package org.qhipapacha.astra.radiation.adapter.in.web;

import java.time.format.DateTimeParseException;
import org.qhipapacha.astra.radiation.application.usecase.RadiationFailure;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice(assignableTypes = RadiationController.class)
public class RadiationErrorHandler {
  public record ApiError(String code, String message) {}

  @ExceptionHandler({
    IllegalArgumentException.class,
    DateTimeParseException.class,
    MissingServletRequestParameterException.class
  })
  public ResponseEntity<ApiError> invalid(Exception exception) {
    return ResponseEntity.badRequest()
        .body(
            new ApiError(
                "INVALID_QUERY",
                "Indica un instrumento admitido y fechas ISO 8601 con zona; periodo histórico"
                    + " positivo de hasta 24 horas."));
  }

  @ExceptionHandler(RadiationFailure.class)
  public ResponseEntity<ApiError> upstream(RadiationFailure exception) {
    return switch (exception.kind()) {
      case UPSTREAM_UNAVAILABLE ->
          ResponseEntity.status(503)
              .body(
                  new ApiError(
                      "RADLAB_UNAVAILABLE", "No se pudo consultar RadLab. Puedes reintentar."));
      case UPSTREAM_INVALID ->
          ResponseEntity.status(502)
              .body(
                  new ApiError(
                      "RADLAB_INVALID_RESPONSE",
                      "RadLab devolvió datos incompatibles; no se sustituyeron por una"
                          + " simulación."));
      case ARCHIVE_UNAVAILABLE ->
          ResponseEntity.status(503)
              .body(
                  new ApiError(
                      "ARCHIVE_UNAVAILABLE",
                      "No se pudo leer o conservar la consulta. Los registros previos no se han"
                          + " eliminado."));
    };
  }
}
