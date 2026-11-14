package org.qhipapacha.astra.radiation.adapter.out.external;

import static org.qhipapacha.astra.radiation.adapter.out.ContentDigest.sha256;
import static org.qhipapacha.astra.radiation.application.usecase.RadiationFailure.Kind.*;

import java.io.StringReader;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.Set;
import org.apache.commons.csv.CSVFormat;
import org.qhipapacha.astra.radiation.application.port.out.RadiationSource;
import org.qhipapacha.astra.radiation.application.usecase.RadiationFailure;
import org.qhipapacha.astra.radiation.domain.*;

public class RadLabClient implements RadiationSource {
  public static final String ENDPOINT = "https://visualization.osdr.nasa.gov/radlab/api/";
  private static final int MAX_BYTES = 4 * 1024 * 1024;
  private static final Set<String> REQUIRED =
      Set.of("timestamp", "instrument_id", "absorbed_dose_rate", "spacecraft", "module");
  private final HttpClient http;
  private final URI endpoint;
  private final Clock clock;
  private final ZoneId sourceZone;

  public RadLabClient(HttpClient http, URI endpoint, Clock clock, ZoneId sourceZone) {
    this.http = http;
    this.endpoint = endpoint;
    this.clock = clock;
    this.sourceZone = sourceZone;
  }

  public Acquisition fetch(RadiationQuery query) {
    var uri = requestUri(query);
    try {
      var request =
          HttpRequest.newBuilder(uri)
              .timeout(java.time.Duration.ofSeconds(20))
              .header("Accept", "text/csv, text/plain")
              .header("User-Agent", "ASTRA-RadLab/0.1")
              .GET()
              .build();
      var pending = http.sendAsync(request, info -> new LimitedBodySubscriber(MAX_BYTES));
      HttpResponse<byte[]> response;
      try {
        response = pending.get(25, java.util.concurrent.TimeUnit.SECONDS);
      } catch (java.util.concurrent.TimeoutException exception) {
        pending.cancel(true);
        throw new RadiationFailure(UPSTREAM_UNAVAILABLE);
      } catch (InterruptedException exception) {
        pending.cancel(true);
        throw exception;
      } catch (java.util.concurrent.ExecutionException exception) {
        if (exception.getCause() instanceof RadiationFailure failure) throw failure;
        throw new RadiationFailure(UPSTREAM_UNAVAILABLE);
      }
      if (response.statusCode() != 200) throw new RadiationFailure(UPSTREAM_UNAVAILABLE);
      var csv = new String(response.body(), StandardCharsets.UTF_8);
      return parse(query, csv, uri.toASCIIString());
    } catch (RadiationFailure failure) {
      throw failure;
    } catch (InterruptedException exception) {
      Thread.currentThread().interrupt();
      throw new RadiationFailure(UPSTREAM_UNAVAILABLE);
    } catch (Exception exception) {
      throw new RadiationFailure(UPSTREAM_UNAVAILABLE);
    }
  }

  public URI requestUri(RadiationQuery query) {
    String from =
        LocalDateTime.ofInstant(query.from(), sourceZone)
            .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    String to =
        LocalDateTime.ofInstant(query.to(), sourceZone)
            .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    return URI.create(
        endpoint
            + "?spacecraft=ISS&instrument_id="
            + query.instrumentId()
            + "&timestamp%3E="
            + encode(from)
            + "&timestamp%3C"
            + encode(to)
            + "&absorbed_dose_rate&module&format=csv");
  }

  private static String encode(String value) {
    return URLEncoder.encode(value, StandardCharsets.UTF_8);
  }

  public Acquisition parse(RadiationQuery query, String originalCsv, String requestUrl) {
    var readings = new ArrayList<RadiationReading>();
    var identities = new HashSet<String>();
    try (var parser =
        CSVFormat.DEFAULT
            .builder()
            .setHeader()
            .setSkipHeaderRecord(true)
            .get()
            .parse(
                new StringReader(
                    originalCsv.startsWith("\uFEFF") ? originalCsv.substring(1) : originalCsv))) {
      if (!parser.getHeaderMap().keySet().containsAll(REQUIRED))
        throw new IllegalArgumentException();
      for (var row : parser) {
        if (readings.size() >= 10000 || !row.isConsistent()) throw new IllegalArgumentException();
        var instrument = row.get("instrument_id").trim();
        var rawTimestamp = row.get("timestamp").trim();
        var observed = LocalDateTime.parse(rawTimestamp).atZone(sourceZone).toInstant();
        var spacecraft = row.get("spacecraft").trim();
        var module = row.get("module").trim();
        if (!instrument.equals(query.instrumentId())
            || !spacecraft.equals("ISS")
            || !module.equals("Columbus")
            || observed.isBefore(query.from())
            || !observed.isBefore(query.to())) throw new IllegalArgumentException();
        var rawValue = row.get("absorbed_dose_rate").trim();
        BigDecimal value =
            Set.of("", "NA", "N/A").contains(rawValue) ? null : new BigDecimal(rawValue);
        // Decimal transport must remain finite when consumed as a JavaScript number.
        if (value != null && !Double.isFinite(value.doubleValue()))
          throw new IllegalArgumentException();
        var id = sha256(instrument + "|" + rawTimestamp);
        if (!identities.add(id)) throw new IllegalArgumentException();
        readings.add(
            new RadiationReading(
                id,
                instrument,
                spacecraft,
                module,
                rawTimestamp,
                observed,
                value,
                value == null ? "missing" : "reported"));
      }
      readings.sort(Comparator.comparing(RadiationReading::observedAt));
      var source =
          new RadiationSeries.Source(
              "NASA OSDR RadLab",
              requestUrl,
              clock.instant(),
              sha256(originalCsv),
              sourceZone.getId(),
              "configured-assumption");
      return new Acquisition(new RadiationSeries(query, source, readings), originalCsv);
    } catch (Exception exception) {
      throw new RadiationFailure(UPSTREAM_INVALID);
    }
  }
}
