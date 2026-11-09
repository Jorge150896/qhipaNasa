# Conocer el backend Java

Skill compañera: [java-spring-clean-architecture](../../java-spring-clean-architecture/SKILL.md). Leerla solo para cambios de arquitectura conjuntos; no cargar skills recursivamente. Fuente común: `docs/architecture/system.md` del proyecto NASA.

## Estructura acordada

Backend Spring Boot como monolito modular por funcionalidad:

```text
<feature>.adapter.in.web -> application.usecase -> domain
                               -> application.port.out
                                    ^ adapter.out.persistence/external
configuration -> compone casos de uso y adapters por constructor
```

Domain y application son Java puro sin Spring/JPA/HTTP. Controllers delgados traducen transporte, casos de uso coordinan operaciones, adapters implementan puertos. Entidades de persistencia, dominio Java y DTOs HTTP están separados. Es la estructura objetivo; consultar el documento común y el código antes de asumir que algún módulo existe.

## Reparto de responsabilidades

Frontend prepara formatos, navegación y estado de pantalla; Java aplica reglas persistidas, permisos e integridad. Los casos de uso TypeScript son coordinación cliente, no una copia autoritativa de los casos de uso Java. Next consume Java por API; no accede a su base de datos ni implementa un backend paralelo.

La carga inicial puede ocurrir en Server Components con composición `.server`; las interacciones usan composición cliente o el límite Next acordado. No pasar objetos Java, repositorios ni casos de uso de servidor a props cliente. No asumir conexión directa del navegador si autenticación/CORS todavía no se definieron.

## Contratos y cambios

Al integrar, consultar `docs/contracts/openapi.yaml` si ya existe; si falta, definir las operaciones solicitadas en coordinación con backend antes de inventar payloads. Tipos TypeScript generados pertenecen a data, no a dominio ni View. El ApiRepository valida y mapea; `FeatureData` conserva formatos presentables.

Antes de cambiar una unidad, nombre, enum, nulabilidad, fecha, precisión de ID o código de error, revisar sus consumidores Java. Actualizar contrato, fixtures sintéticos, mappers y pruebas de ambos lados implementados. Mantener simulación y errores de integración distinguibles de resultados reales. Tiempo real requiere acordar eventos y semántica de reconexión; no añadir WebSockets automáticamente.
