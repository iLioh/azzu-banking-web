# Arquitectura del portal bancario Azzu

## Objetivo

El frontend usa una arquitectura hexagonal ligera. La presentación no conoce si los datos vienen de mocks, HTTP o cualquier otra infraestructura. Esto permite sustituir los adaptadores de demostración por clientes de la API sin reescribir páginas ni componentes.

```text
features (presentación)
        │
        ▼
BankingFacade (aplicación / casos de uso)
        │
        ▼
puertos de consulta y comandos
        ▲
        │
adaptadores mock en desarrollo / adaptadores HTTP en producción
```

La dependencia siempre apunta hacia el núcleo. Los adaptadores implementan los puertos; el núcleo nunca importa los adaptadores.

## Capas

- `src/app/core/domain`: modelos bancarios sin conocimiento de componentes, HTTP ni almacenamiento.
- `src/app/core/application`: fachada consumida por la interfaz y puertos que describen las operaciones admitidas.
- `src/app/core/infrastructure/adapters`: mocks de desarrollo y clientes HTTP productivos.
- `src/environments`: selecciona mocks en desarrollo y HTTP same-origin `/api/v1` en producción.
- `src/app/features`: presentación Angular organizada por capacidad.
- `src/app/features/portal/layout`: shell autenticado, encabezado, menú y `router-outlet`.
- `src/app/features/portal/pages`: una carpeta y un componente lazy por página navegable.
- `src/app/features/portal/shared`: únicamente componentes, estilos y validadores reutilizados por dos o más vistas.

## Rutas canónicas

| Ruta | Página |
| --- | --- |
| `/portal/inicio` | Resumen principal |
| `/portal/operaciones` | Catálogo de operaciones |
| `/portal/operaciones/transferencias` | Flujo de transferencia |
| `/portal/operaciones/pagos` | Pago de servicios |
| `/portal/operaciones/movimientos` | Historial y filtros de movimientos |
| `/portal/tramites` | Trámites y solicitudes |
| `/portal/productos` | Catálogo de productos |
| `/portal/productos/cuentas` | Cuentas y saldos |
| `/portal/productos/cuentas/:accountId` | Detalle de una cuenta |
| `/portal/productos/tarjetas` | Controles de tarjetas |
| `/portal/productos/prestamos` | Simulación de préstamo |
| `/portal/finanzas` | Salud financiera |
| `/portal/beneficios` | Beneficios Azzu |
| `/portal/configuracion` | Perfil y preferencias |
| `/portal/configuracion/perfil` | Datos personales y contacto |
| `/portal/configuracion/seguridad` | Clave digital y dispositivos |
| `/portal/configuracion/notificaciones` | Alertas y canales de notificación |

Las rutas cortas históricas (`/portal/transferencias`, `/portal/pagos`, `/portal/tarjetas` y `/portal/prestamos`) son solo redirecciones de compatibilidad. No deben utilizarse en enlaces nuevos.

## Sustitución por la API real

1. Contrastar [el contrato preparado](docs/API_CONTRACT.md) con el OpenAPI real.
2. Adaptar las rutas/DTO únicamente en los adaptadores HTTP cuando difieran.
3. Mantener `/api/v1` bajo el mismo host para evitar CORS y habilitar cookie HttpOnly + XSRF.
4. Mantener validación y autorización definitivas en el backend; la validación Angular solo mejora la experiencia.
5. La sesión productiva se revalida en servidor al entrar a cualquier ruta protegida; no depende de una bandera en memoria ni de tokens en Web Storage.

El navegador nunca debe conectarse a PostgreSQL. En Azure, el flujo permitido sigue siendo frontend → API en AKS → `postgres-onprem:5432` → proxy administrado por Tailscale Operator → PostgreSQL externo.

## Reglas de evolución

- Una URL nueva implica una página en `features/portal/pages` y una entrada en `portal.routes.ts`.
- Un componente se mueve a `shared` solo si existe reutilización real.
- Las páginas consumen `BankingFacade`, no puertos ni adaptadores directamente.
- Los adaptadores no deben contener reglas de presentación.
- Ninguna credencial, secreto o cadena de conexión se compila dentro del bundle Angular.
