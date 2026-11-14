# Adaptación a Next.js App Router

Consultar la documentación compatible con la versión instalada antes de usar APIs o supuestos sobre caché, params, cookies o rendering. No fijar versiones de React/Next por esta skill.

Fuentes oficiales consultadas al crear la skill:
- https://nextjs.org/docs/app/getting-started/server-and-client-components
- https://nextjs.org/docs/app/guides/data-security

## Dos recorridos válidos

**Render inicial de servidor**

```text
app/.../page.tsx (Server Component delgado)
 -> composición .server -> caso de uso -> contrato -> adapter autorizado
 -> mapper de presentación -> Screen/View de servidor
 -> isla cliente solo si requiere interacción
```

La orquestación real puede vivir en un loader de feature para que `page.tsx` siga delgado. No forzar un hook para contenido estático. Consumir únicamente operaciones acordadas con Java; la elección del stack no implica que ya existan endpoints.

**Interacción en navegador**

```text
page -> Screen cliente -> hook con dependencias cliente -> View
                         -> caso de uso -> contrato -> adapter cliente permitido
```

Si una interacción requiere una operación privilegiada en servidor, coordinar ese límite con el backend Java y el contrato compartido. No pasar el repositorio del servidor al cliente ni inventar un endpoint como sustituto.

## Frontera de ejecución

- Rutas y layouts son Server Components por defecto. Colocar `'use client'` en el punto más pequeño que necesite hooks, eventos o APIs del navegador; no marcar todo el layout raíz por conveniencia.
- Las props cruzando servidor/cliente deben ser serializables según React. No pasar instancias de casos de uso, repositorios, conexiones ni callbacks ordinarios desde servidor. Entregar datos mínimos y reconstruir composición cliente del lado cliente.
- Marcar módulos de secretos/acceso privilegiado con `server-only`. Las factories `.client` nunca importan factories `.server`; usar imports directos y evitar barrels mixtos.
- Client Components también participan en el render inicial: no acceder a window/storage al importar módulos ni durante render. Encapsular capacidades del navegador en adapters y activarlas con un ciclo de vida válido; impedir divergencias de hidratación.
- Crear servicios con sesión/credenciales en el ámbito de la solicitud, sin singletons mutables que mezclen usuarios. Instancias compartidas solo si son inmutables y no contienen datos de sesión.
- No exponer secretos mediante `NEXT_PUBLIC_*`, props, logs o fixtures. Autorización real vive en el backend Java y, si corresponde, en el límite de servidor Next; ocultar un botón no autoriza una operación.

## Estado, caché y rendimiento

- Documentar origen y propietario de datos, vigencia y estrategia de actualización. No asumir defaults de caché de una versión diferente.
- No mezclar snapshots SSR con otra carga cliente idéntica sin necesidad. Si se usa una biblioteca de server state, mantener claves/cache/invalidación en presentación y transporte detrás de adapters.
- Datos de sesión o salud no se comparten en caché global. Especificar política adecuada antes de integrar datos privados.
- Para gráficos y streams, limitar muestras y actualizaciones. Cargar bibliotecas pesadas de manera diferida cuando aporte valor; no añadir Redux, query libraries o WebSockets sin necesidad confirmada.
- `loading.tsx`, `error.tsx` y `not-found.tsx` cuando correspondan. No confundir error de ruta con error recuperable de un widget.
- Si posteriormente se autorizan Server Actions o Route Handlers, tratarlos como adapters de entrada delgados: validación, autorización del servidor y delegación al caso de uso. La regla de dominio sigue independiente de Next.
