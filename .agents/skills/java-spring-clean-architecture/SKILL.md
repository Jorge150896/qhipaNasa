---
name: java-spring-clean-architecture
description: Desarrolla y revisa el backend NASA con Java y Spring Boot, Clean Architecture y SOLID, coordinado con el frontend Next.js y React inspirado en scotia. Aplicar a módulos, casos de uso, API, persistencia e integración de este proyecto.
---

# Java + Spring Boot: backend NASA

## Acuerdos y contexto

El usuario confirmó Java con Spring Boot para el backend y Next.js + React para frontend. Usar Clean Architecture y SOLID, con límites equivalentes a los patrones de scotia. Implementar la funcionalidad solicitada y sus dependencias necesarias. Las decisiones rutinarias dentro de ese alcance no requieren una aprobación adicional.

Antes de editar:
- Leer AGENTS.md, CONTRIBUTING.md, README y, si ya existen, build Maven/Gradle, wrapper y toolchain del backend. Si no existe implementación, explicitarlo; no describir el diseño como código existente.
- Leer `docs/architecture/system.md` en la raíz del proyecto NASA. Es la fuente compartida de decisiones, responsabilidades y contratos con el frontend. Si cambia la ubicación, localizar ese documento desde la raíz actual; no escribir en el repositorio scotia.
- Leer [frontend-integration.md](references/frontend-integration.md) al tocar APIs, eventos o contratos y [spring-boundaries.md](references/spring-boundaries.md) al diseñar módulos, DI, persistencia o transacciones.
- Revisar código vecino y consumidores reales antes de introducir patrones. Usar versiones compatibles con el JDK y Spring Boot elegidos, consultando documentación oficial cuando se requieran APIs actuales. No imponer un número de versión desde esta skill.

## Estado real y portabilidad

Esta skill acompaña al proyecto en `.agents/skills/`; no necesita instalación global ni rutas de otro equipo. Preferirla frente a una copia personal con el mismo nombre. No existe backend en la base inicial; comprobar el árbol actual antes de asumirlo. La guía `docs/development/feature-template.md` sirve para delimitar la entrega y la fuente `docs/architecture/system.md` describe el frontend implementado. Crear solo el módulo necesario para la funcionalidad autorizada y actualizar esa fuente al materializar Java.

## Organización incremental

Preferir un monolito modular por funcionalidad. Un módulo no requiere un artefacto Maven/Gradle independiente. Elegir el package raíz según el proyecto, con la clase Spring Boot encima de sus módulos; no usar default package.

```text
<basepackage>/
  Application.java
  <feature>/
    domain/             entidades, value objects, políticas e invariantes
    application/
      usecase/          operaciones de la aplicación
      port/out/         contratos de persistencia, reloj, fuentes externas
    adapter/
      in/web/           controllers, requests, responses, errores de HTTP
      out/persistence/  entidades ORM, mappers, adapters, Spring Data
      out/external/     clientes externos autorizados
    configuration/      composición Spring y límites transaccionales
```

Crear solo piezas usadas por la feature solicitada. Puertos de entrada son opcionales si hay una necesidad de inversión real; una clase de caso de uso basta cuando no hace falta otra interfaz. No crear BaseController/BaseService/BaseRepository ni capas pass-through sin responsabilidad.

Dependencias:
- `domain` depende solo de Java; no importa Spring, JPA, Jackson, servlet, application ni adapters.
- `application` depende de domain y sus propios puertos; no importa controllers, repositorios Spring Data, HTTP ni clases concretas de infraestructura.
- Adapters de entrada llaman casos de uso, validan transporte y mapean resultados. No llaman directamente repositorios de salida.
- Adapters de salida implementan puertos y mapean modelos externos/persistencia a dominio.
- `configuration` compone implementaciones por constructor con beans explícitos; dominio y casos de uso permanecen testeables sin arrancar Spring.
- Módulos se comunican por operaciones públicas o puertos definidos, sin acceder a tablas, ORM ni packages internos de otro módulo. No crear un módulo shared convertido en depósito de todo.

## SOLID concreto

- SRP: controller maneja HTTP, caso de uso coordina intención, dominio aplica invariantes y adapter resuelve tecnología.
- OCP: una nueva fuente implementa un puerto; no propagar condicionales de proveedor por aplicación o frontend.
- LSP: implementaciones conservan semántica de errores, ausencia, unidades, orden y consistencia; no inventar éxitos ni devolver null donde el contrato exige resultado.
- ISP: puertos mínimos por capacidad consumida. No obligar CRUD genérico o funciones futuras.
- DIP: dependencias finales por constructor, contratos en capas internas y composición en Spring; sin inyección de campos ni consultas a ApplicationContext desde negocio.

## Operaciones y datos

- Definir intención y reglas del caso de uso antes de endpoints y tablas. Diferenciar validación de formato en entrada y validación de invariantes en dominio; comprobar permisos reales en servidor cuando la funcionalidad los requiera.
- Requests, responses, entidades JPA y dominio son tipos distintos. No serializar entidades ORM ni filtrar detalles de base de datos al frontend. Records son apropiados para DTOs inmutables si la versión Java los permite.
- Representar ausencia explícitamente; clasificar errores de negocio y traducirlos en un handler HTTP central con status/código estable. No filtrar stacktraces, SQL, tokens ni datos privados.
- Usar `Clock` inyectable para reglas temporales, instantes con zona explícita en transporte y unidades documentadas para mediciones. Evitar valores aleatorios, IDs o tiempo global oculto en tests.
- Base de datos, autenticación, sensores, IA y despliegue siguen sin seleccionarse. Añadir tecnologías solo al implementar un requisito concreto; no introducir Kafka, Redis, microservicios, WebFlux o JPA por anticipado.
- Si se pide simulación, separar adapter sintético determinista y modo explícito de demo; no ocultar respuestas falsas en casos de uso ni presentarlas como NASA real.
- En operaciones de escritura definir atomicidad, concurrencia e idempotencia según riesgo. Aplicar transacciones en un límite externo que envuelva el caso de uso, preservando su independencia de Spring; ver referencia. No usar transacciones solo en controller ni envolver llamadas remotas lentas sin justificarlo.

## Coordinación frontend/backend

- Antes de cambiar contrato leer la fuente común y consumidores TypeScript afectados. Mantener un único contrato OpenAPI cuando se implemente integración; no inventar endpoints en paralelo a frontend.
- Backend devuelve datos y errores estables; frontend prepara textos, formatos y estados de pantalla. No introducir textos de UI o rutas Next en entidades Java.
- Next no accede directamente a la base de datos para eludir Java. El uso de un BFF o Server Actions debe justificarse y acordarse; no duplicar negocio.
- Al tocar contrato, actualizar documentación y ambos consumidores implementados dentro del alcance. Registrar dependencias pendientes si falta una app; no confundir un mock con integración real.

## Alineación con el reto

Al proponer mejoras del producto leer `docs/product/dashboard-proposal.md`. Priorizar autoevaluación comprensible, explicación de indicadores, seguimiento y evidencia. Las consideraciones opcionales del reto no son requisitos obligatorios. No convertir ejemplos, correlaciones ambientales o salidas de demo en diagnóstico, protocolo clínico o tratamiento validado.

## Validación y cierre

- Unit tests de dominio y casos de uso sin contexto Spring, con fakes controlados de puertos. Probar reglas y errores relevantes.
- Tests de adapters/mappers y HTTP para serialización, validación y errores. Integración con la base real de pruebas cuando exista persistencia; no asumir que una base en memoria reproduce el motor elegido.
- Verificar reglas entre packages con herramientas existentes; ArchUnit o Spring Modulith solo cuando justifiquen el alcance, sin dependencias nuevas por ceremonia.
- Usar wrapper existente: Maven `./mvnw verify` o tarea equivalente de Gradle, y checks configurados. No ejecutar ambos build systems ni sustituir versiones existentes.
- Para cambios de contrato, comprobar ejemplos y mappers de ambos lados; para tiempo real, cierre/reconexión y límites de recursos si se implementa.
- Informar cambios, validaciones ejecutadas, comprobaciones pendientes y efecto sobre frontend. Actualizar documentación de módulos y la fuente compartida cuando cambien responsabilidades.
