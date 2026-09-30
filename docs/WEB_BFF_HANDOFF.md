# Handoff Web BFF — AZZU

Este documento delimita lo que Angular espera del backend Web y evita que el canal Web duplique lógica bancaria o consuma directamente la base de datos.

## Responsabilidades

### Angular

- Renderizar y validar forma de entrada para experiencia de usuario.
- Consumir únicamente rutas same-origin bajo `/api/v1`.
- Enviar cookies con `withCredentials`, XSRF e identificador de correlación.
- Presentar errores públicos normalizados.
- Generar `Idempotency-Key` para transferencias, pagos y solicitudes de préstamo.
- Responder a un `401` ordinario cerrando el estado local.
- Responder a `401 STEP_UP_REQUIRED` iniciando reautenticación sin borrar la sesión vigente.
- Presentar `403 CSRF_VALIDATION_FAILED` como fallo de seguridad sin utilizar códigos HTTP privados.

### Web BFF

- Ejecutar Authorization Code + PKCE con Entra External ID.
- Mantener tokens únicamente en servidor y entregar una cookie opaca segura.
- Implementar sesión, logout, rotación, expiración, CSRF y step-up.
- Agregar o adaptar respuestas para el navegador.
- Propagar identidad, correlación e idempotencia a Banking Services.
- Aplicar `Cache-Control: no-store` a datos autenticados.

### Banking Services

- Ejecutar autorización por propiedad del cliente y reglas bancarias.
- Gestionar límites, beneficiarios, transferencias, pagos, tarjetas y préstamos.
- No confiar en validaciones ni identificadores enviados por Angular.

### Integration API

- Ser la única frontera autorizada hacia Core Banking y `postgres-onprem:5432`.
- Preservar el egress administrado por Tailscale Operator.

## Criterios de aceptación para integrar

1. OpenAPI versionado y aprobado por Web y Backend.
2. Cookies probadas con `Secure`, `HttpOnly`, `SameSite` y dominio correcto.
3. CSRF probado en todos los métodos mutables.
4. `401`, `403`, `409`, `412`, `422`, `428`, `429` y `503` cubiertos por contract tests; step-up cubierto como challenge `401` y `428` reservado a precondiciones.
5. Idempotencia persistente, no solo en memoria del pod.
6. Auditoría sin información sensible.
7. Step-up funcional para operaciones de riesgo.
8. Pruebas E2E sobre un entorno dev con identidades de prueba.

## Estado del frontend

Los puertos, adaptadores, interceptor, guard, temporizador de inactividad y UI de step-up están preparados. Mientras el BFF no exista, desarrollo usa mocks; producción no debe publicarse apuntando a una API Mobile ni a PostgreSQL.
