package org.qhipapacha.astra.radiation.adapter.out.persistence;

import static org.qhipapacha.astra.radiation.adapter.out.ContentDigest.sha256;
import static org.qhipapacha.astra.radiation.application.usecase.RadiationFailure.Kind.ARCHIVE_UNAVAILABLE;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import org.qhipapacha.astra.radiation.application.port.out.RadiationArchive;
import org.qhipapacha.astra.radiation.application.port.out.RadiationSource.Acquisition;
import org.qhipapacha.astra.radiation.application.usecase.RadiationFailure;
import org.qhipapacha.astra.radiation.domain.RadiationQuery;

/** Versioned archive of public environmental data. No personal health records. */
public class FileRadiationArchive implements RadiationArchive {
  private final Path directory;
  private final ObjectMapper mapper;

  public FileRadiationArchive(Path directory, ObjectMapper mapper) {
    this.directory = directory;
    this.mapper = mapper;
  }

  private String key(RadiationQuery query) {
    return sha256(query.instrumentId() + "|" + query.from() + "|" + query.to());
  }

  public synchronized Optional<Acquisition> find(RadiationQuery query) {
    var path = directory.resolve(key(query) + ".json");
    if (!Files.exists(path)) return Optional.empty();
    try {
      if (Files.size(path) > 16 * 1024 * 1024) throw new IllegalStateException();
      var stored = mapper.readValue(Files.readString(path), Stored.class);
      if (stored.version() != 1
          || !stored.acquisition().series().query().equals(query)
          || !sha256(stored.acquisition().originalCsv())
              .equals(stored.acquisition().series().source().sha256()))
        throw new IllegalStateException();
      return Optional.of(stored.acquisition());
    } catch (Exception exception) {
      throw new RadiationFailure(ARCHIVE_UNAVAILABLE);
    }
  }

  public synchronized void save(RadiationQuery query, Acquisition acquisition) {
    Path temporary = null;
    try {
      Files.createDirectories(directory);
      var content = mapper.writeValueAsString(new Stored(1, acquisition));
      var revision =
          directory.resolve(key(query) + "-" + acquisition.series().source().sha256() + ".json");
      if (!Files.exists(revision))
        Files.writeString(
            revision, content, StandardCharsets.UTF_8, java.nio.file.StandardOpenOption.CREATE_NEW);
      temporary = Files.createTempFile(directory, ".radlab-", ".tmp");
      Files.writeString(temporary, content, StandardCharsets.UTF_8);
      Files.move(
          temporary,
          directory.resolve(key(query) + ".json"),
          StandardCopyOption.ATOMIC_MOVE,
          StandardCopyOption.REPLACE_EXISTING);
    } catch (Exception exception) {
      throw new RadiationFailure(ARCHIVE_UNAVAILABLE);
    } finally {
      if (temporary != null)
        try {
          Files.deleteIfExists(temporary);
        } catch (Exception ignored) {
          /* Old snapshots remain intact. */
        }
    }
  }

  public record Stored(int version, Acquisition acquisition) {}
}
