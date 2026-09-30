# Contrato Portal Azzu -> Web BFF

Este contrato es la frontera de integración preparada en los adaptadores HTTP. El navegador solo se comunica con el Web BFF por same-origin. Si un contrato cambia, se modifica `core/infrastructure/adapters`; las páginas no consumen `HttpClient` directamente.

```text
Angular -> Web BFF -> Banking Services -> Integration API -> Core Banking
```

El Web BFF no contiene lógica bancaria ni se conecta a PostgreSQL. La conexión `postgres-onprem:5432` pertenece exclusivamente a la capa de integración autorizada.

Base same-origin: `/api/v1`.

## Autenticación

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/auth/login?returnUrl=...` | Inicia Authorization Code + PKCE mediante Entra External ID |
| `GET` | `/auth/session` | Revalida la sesión al recargar una ruta protegida |
| `POST` | `/auth/logout` | Revoca la sesión actual |
| `GET` | `/auth/step-up?returnUrl=...` | Reautenticación para una operación sensible |
| `PUT` | `/auth/digital-key` | Cambio de clave con reautenticación |
| `POST` | `/auth/sessions/revoke-others` | Revoca otros dispositivos |

En desarrollo local existe un adaptador mock que conserva el formulario de documento/clave para demostrar la UI. El contrato admite `DNI`, `CE` y `PASSPORT` mediante `documentType`, `documentNumber` y `digitalKey`. Ese DTO no se usa en el build productivo. Producción redirige al BFF; Angular no recibe, persiste ni reenvía tokens OAuth.

Respuesta mínima de `GET /auth/session`:

```json
{
  "customerId": "uuid",
  "displayName": "Mariana",
  "expiresAtUtc": "2026-09-29T23:00:00Z",
  "idleTimeoutSeconds": 900,
  "authenticationMethods": ["pwd", "mfa"]
}
```

La sesión se transporta exclusivamente mediante cookie `HttpOnly; Secure; SameSite=Lax` o más restrictiva. El BFF entrega una cookie antifalsificación legible por Angular llamada `XSRF-TOKEN`; Angular la replica como `X-XSRF-TOKEN` en métodos mutables.

## Consultas

| Método | Ruta |
| --- | --- |
| `GET` | `/customers/me/display-name` |
| `GET` | `/accounts` |
| `GET` | `/transactions` |
| `GET` | `/notifications` |

## Comandos

| Método | Ruta |
| --- | --- |
| `POST` | `/transfers` |
| `POST` | `/payments` |
| `POST` | `/loans/simulations` |
| `POST` | `/loans/applications` |
| `POST` | `/procedures` |
| `PUT` | `/customers/me/profile` |
| `PUT` | `/notifications/preferences` |
| `POST` | `/notifications/read` |
| `PUT` | `/cards/{cardId}/controls` |
| `PUT` | `/cards/{cardId}/temporary-block` |

## Reglas obligatorias del backend

- Autorizar cada cuenta, tarjeta, préstamo y movimiento contra el cliente de la sesión; nunca confiar en un ID enviado por el navegador.
- Validar nuevamente tipo y número de documento, montos, moneda, límites, beneficiario y estado de producto.
- Usar `Idempotency-Key` en transferencias, pagos y desembolsos; una repetición no puede duplicar el movimiento.
- Aplicar rate limiting y bloqueo progresivo al login; respuesta genérica para usuario/clave incorrectos.
- Hash de clave con Argon2id y parámetros versionados; nunca cifrado reversible.
- MFA/step-up para operaciones de riesgo, cambios de clave, nuevos beneficiarios y dispositivos.
- Responder `401` con `WWW-Authenticate: Bearer error="insufficient_user_authentication"` y `code: STEP_UP_REQUIRED` cuando se necesite reautenticación; Angular abrirá el flujo `/auth/step-up` sin borrar la sesión vigente.
- Sesiones de cliente separadas de `seguridad_auditoria.sesiones_activas`, que actualmente referencia exclusivamente `usuarios_internos`.
- Consultas SQL parametrizadas, transacciones ACID y ledger/auditoría para operaciones monetarias.
- `Cache-Control: no-store` para datos autenticados; CORS cerrado al dominio definitivo si alguna llamada no es same-origin.
- Health endpoints separados: liveness sin dependencias y readiness verificando dependencias esenciales con timeout corto.
- Aceptar y devolver `X-Correlation-ID`; nunca incluir DNI, claves, tokens, números completos de cuenta o tarjeta en telemetría.

## Formato de error público

```json
{
  "type": "https://api.azzu.tech/problems/transfer-limit-exceeded",
  "title": "Límite de transferencia excedido",
  "status": 422,
  "detail": "El monto supera el límite permitido.",
  "code": "TRANSFER_LIMIT_EXCEEDED",
  "correlationId": "6ad808d2-42f5-4a8d-a025-f771dfec9863"
}
```

Los errores usan `application/problem+json` (RFC 9457). Para step-up se agrega `challengeId`. No se envían stack traces, SQL, nombres de pods, secretos ni detalles de Tailscale.

## Códigos esperados

- `400`: forma inválida.
- `401`: sesión ausente o vencida; también step-up cuando incluye el challenge y `code: STEP_UP_REQUIRED`.
- `403`: sesión válida sin permiso/propiedad o validación CSRF fallida con `code: CSRF_VALIDATION_FAILED`.
- `409`: conflicto o idempotency key reutilizada con otro payload.
- `412`: se recibió una precondición (`If-Match`) que ya no coincide con la versión actual.
- `422`: regla bancaria no satisfecha.
- `428`: falta una precondición obligatoria como `If-Match`; nunca se usa para step-up.
- `429`: límite de intentos/operaciones.
- `503`: dependencia temporalmente no disponible.

Los errores públicos deben usar un código estable y mensaje seguro; nunca stack trace, SQL, nombres internos, conexión a PostgreSQL ni detalles del proxy Tailscale.
