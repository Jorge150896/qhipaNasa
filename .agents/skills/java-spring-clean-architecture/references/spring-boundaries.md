# Límites de Spring y persistencia

Fuentes oficiales consultadas:
- https://docs.spring.io/spring-boot/reference/using/structuring-your-code.html
- https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html

Spring Boot permite distintas estructuras; esta skill elige módulos por funcionalidad con límites internos como convención del proyecto. Spring favorece dependencias explícitas por constructor; la independencia estricta de application respecto de Spring es una decisión de esta arquitectura.

## Composición y transacciones

Registrar casos de uso Java puros mediante `@Bean`. Inyectar implementaciones por constructor en adapters. No inyectar EntityManager, HttpServletRequest, repositorios Spring Data o beans de configuración en dominio/casos de uso.

Si una operación necesita una transacción que abarque varios puertos, envolver el caso de uso mediante un decorator/facade externo o un executor transaccional con la implementación en infrastructure/configuration. Con `TransactionTemplate`, el wrapper puede ejecutar el caso de uso entero; con proxies `@Transactional`, verificar que la invocación atraviesa el proxy. No confiar en self-invocation. Documentar rollback y errores de negocio que deban provocar rollback.

Una transacción por método de repositorio no garantiza atomicidad de un caso de uso con varias escrituras. No publicar una confirmación de éxito o un evento externo antes del commit. Introducir outbox solo cuando una entrega durable sea requisito real.

## Persistencia cuando sea necesaria

El adapter implementa el puerto de application y delega a Spring Data/JDBC según la decisión adoptada. Mantener entidades ORM y consultas en adapter.out.persistence, con mapping explícito. Cargar y transformar relaciones dentro del límite adecuado para no filtrar lazy loading al controller ni producir N+1 ocultos.

Migraciones versionadas cuando se elija una base. No usar cambios automáticos destructivos de esquema como mecanismo de producción. Aplicar límites/paginación y control de concurrencia para operaciones que lo requieran. No introducir modelos de persistencia de features futuras.

## Modelo de ejecución

Partir del modelo convencional de Spring MVC cuando se implemente HTTP, salvo necesidad demostrada del stack reactivo. No combinar llamadas bloqueantes con event loops sin un diseño explícito. Elegir tiempo real según semántica requerida, no porque un dashboard obligue a usar WebFlux.

En streaming, administrar desconexión, backpressure o buffering acotado y limpieza de recursos. Autorización de HTTP y de una suscripción deben conservar las mismas fronteras cuando el producto incluya datos privados.
