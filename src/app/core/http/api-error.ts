import { HttpErrorResponse } from '@angular/common/http';

interface PublicErrorBody {
  type?: string;
  title?: string;
  detail?: string;
  code?: string;
  message?: string;
  correlationId?: string;
  challengeId?: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly correlationId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function readPublicErrorBody(error: HttpErrorResponse): PublicErrorBody {
  if (!error.error || typeof error.error !== 'object') return {};
  const body = error.error as Record<string, unknown>;
  return {
    type: typeof body['type'] === 'string' ? body['type'] : undefined,
    title: typeof body['title'] === 'string' ? body['title'] : undefined,
    detail: typeof body['detail'] === 'string' ? body['detail'] : undefined,
    code: typeof body['code'] === 'string' ? body['code'] : undefined,
    message: typeof body['detail'] === 'string'
      ? body['detail']
      : typeof body['message'] === 'string'
        ? body['message']
        : typeof body['title'] === 'string'
          ? body['title']
          : undefined,
    correlationId: typeof body['correlationId'] === 'string' ? body['correlationId'] : undefined,
    challengeId: typeof body['challengeId'] === 'string' ? body['challengeId'] : undefined,
  };
}

export function normalizeApiError(error: HttpErrorResponse): ApiError {
  const body = readPublicErrorBody(error);
  const correlationId = error.headers.get('x-correlation-id') ?? body.correlationId;
  const code = body.code ?? `HTTP_${error.status || 0}`;
  const message = safeMessage(error.status, body.message);
  return new ApiError(error.status, code, message, correlationId);
}

function safeMessage(status: number, backendMessage?: string): string {
  if (backendMessage && status >= 400 && status < 500) return backendMessage;
  switch (status) {
    case 0: return 'No pudimos comunicarnos con Azzu. Revisa tu conexión e inténtalo nuevamente.';
    case 401: return 'Tu sesión venció. Ingresa nuevamente para continuar.';
    case 403: return 'No tienes autorización para realizar esta operación.';
    case 409: return 'La operación entra en conflicto con una solicitud anterior.';
    case 422: return 'Revisa los datos de la operación antes de continuar.';
    case 428: return 'Esta operación requiere una condición previa antes de continuar.';
    case 429: return 'Alcanzaste el límite temporal de intentos. Espera un momento.';
    default: return 'No pudimos completar la operación. Inténtalo nuevamente.';
  }
}
