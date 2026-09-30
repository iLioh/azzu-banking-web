# Despliegue del portal web de AZZU

## Arquitectura objetivo

El portal es una SPA Angular y debe publicarse como contenido estático en `banca.azzu.tech`. En el diseño objetivo, Azure Front Door Premium con WAF sirve el frontend y enruta `/api/*` hacia API Management y el Web BFF. El Web BFF es un proyecto ASP.NET Core separado y se ejecutará como servicio privado en AKS.

```text
Navegador
  -> banca.azzu.tech / Azure Front Door + WAF
     -> /*      Angular estático
     -> /api/*  API Management -> Web BFF (.NET) -> servicios bancarios
```

Angular no se conecta a PostgreSQL ni a Tailscale. El acceso a `postgres-onprem:5432` permanece dentro de la capa backend autorizada y conserva el proxy Tailscale existente.

## Estado

La configuración de hosting y edge se mantiene en el repositorio independiente `azzu-cloud-infra`. El pipeline de este repositorio construirá y publicará el artefacto Angular. No se debe inferir que Azure está listo para producción solo porque el build local funcione.

Los manifiestos bajo `deploy/aks` se conservan para pruebas de contenedor en desarrollo. No son el destino productivo acordado para servir la SPA.

## Verificación local

```powershell
npm ci
npm run build
npm test -- --watch=false
```

El artefacto de producción se genera en `dist/bancocloud-web/browser/`.

Para probar la imagen de Nginx de desarrollo, si Docker está disponible:

```powershell
docker build -t azzu-banking-web:local .
docker run --rm -p 8080:8080 azzu-banking-web:local
```

## Integración con el Web BFF

- Producción usa el adaptador HTTP con base same-origin `/api/v1`.
- El navegador no almacena tokens OAuth ni secretos.
- La sesión productiva debe usar cookies `HttpOnly; Secure; SameSite` y protección CSRF implementadas por el BFF.
- Las respuestas autenticadas con datos bancarios deben indicar `Cache-Control: no-store`.
- La API bancaria y PostgreSQL no deben exponerse directamente al navegador.

## CI/CD

El workflow de GitHub Actions de este repositorio debe validar pull requests con instalación reproducible (`npm ci`), pruebas y build. El despliegue a Azure debe usar GitHub OIDC, ambientes separados y aprobación para producción. Los identificadores no sensibles de Azure se configuran en el Environment correspondiente; no se guardan secretos en el repositorio.
