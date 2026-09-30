import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { normalizeApiError } from './api-error';

describe('normalizeApiError', () => {
  it('keeps a safe public validation message and correlation id', () => {
    const result = normalizeApiError(new HttpErrorResponse({
      status: 422,
      error: { code: 'INVALID_AMOUNT', message: 'Revisa el monto ingresado.' },
      headers: new HttpHeaders({ 'x-correlation-id': 'trace-123' }),
    }));

    expect(result.status).toBe(422);
    expect(result.code).toBe('INVALID_AMOUNT');
    expect(result.message).toBe('Revisa el monto ingresado.');
    expect(result.correlationId).toBe('trace-123');
  });

  it('normalizes an RFC 9457 problem detail response', () => {
    const result = normalizeApiError(new HttpErrorResponse({
      status: 403,
      error: {
        type: 'https://api.azzu.tech/problems/csrf-validation-failed',
        title: 'Validación de seguridad fallida',
        status: 403,
        detail: 'Actualiza la página e inténtalo nuevamente.',
        code: 'CSRF_VALIDATION_FAILED',
        correlationId: 'trace-456',
      },
    }));

    expect(result.status).toBe(403);
    expect(result.code).toBe('CSRF_VALIDATION_FAILED');
    expect(result.message).toBe('Actualiza la página e inténtalo nuevamente.');
    expect(result.correlationId).toBe('trace-456');
  });

  it('does not expose backend messages for server failures', () => {
    const result = normalizeApiError(new HttpErrorResponse({
      status: 500,
      error: { code: 'DB_FAILURE', message: 'postgres password=secret' },
    }));

    expect(result.message).toBe('No pudimos completar la operación. Inténtalo nuevamente.');
  });
});
