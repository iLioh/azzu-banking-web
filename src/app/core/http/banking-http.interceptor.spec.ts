import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { StepUpService } from '../auth/step-up.service';
import { SessionStateService } from '../auth/session-state.service';
import { ApiError } from './api-error';
import { bankingHttpInterceptor } from './banking-http.interceptor';
import { HttpClient } from '@angular/common/http';

describe('bankingHttpInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let stepUp: StepUpService;
  let sessionState: SessionStateService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([bankingHttpInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    stepUp = TestBed.inject(StepUpService);
    sessionState = TestBed.inject(SessionStateService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => httpTesting.verify());

  it('adds credentials and a correlation id to BFF calls', () => {
    http.get('/api/v1/accounts').subscribe();
    const request = httpTesting.expectOne('/api/v1/accounts');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.get('Accept')).toBe('application/json');
    expect(request.request.headers.get('X-Correlation-ID')).toBeTruthy();
    request.flush([]);
  });

  it('publishes a step-up challenge and returns a normalized error', () => {
    sessionState.set({ customerId: 'customer-1', displayName: 'Mariana' });
    let receivedError: unknown;
    http.post('/api/v1/transfers', {}).subscribe({ error: (error: unknown) => { receivedError = error; } });
    const request = httpTesting.expectOne('/api/v1/transfers');
    request.flush(
      { code: 'STEP_UP_REQUIRED', message: 'Confirma tu identidad.', challengeId: 'challenge-1' },
      {
        status: 401,
        statusText: 'Unauthorized',
        headers: { 'WWW-Authenticate': 'Bearer error="insufficient_user_authentication", acr_values="mfa"' },
      },
    );

    expect(stepUp.challenge()?.challengeId).toBe('challenge-1');
    expect(sessionState.session()?.customerId).toBe('customer-1');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(receivedError).toBeInstanceOf(ApiError);
  });

  it('clears the local session for a regular 401 response', () => {
    sessionState.set({ customerId: 'customer-1', displayName: 'Mariana' });
    http.get('/api/v1/accounts').subscribe({ error: () => undefined });
    const request = httpTesting.expectOne('/api/v1/accounts');
    request.flush(
      { code: 'SESSION_EXPIRED', message: 'La sesión venció.' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(sessionState.session()).toBeNull();
    expect(stepUp.challenge()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/auth'], { queryParams: { reason: 'expired' } });
  });

  it('does not destroy the authenticated session after a CSRF rejection', () => {
    sessionState.set({ customerId: 'customer-1', displayName: 'Mariana' });
    http.post('/api/v1/transfers', {}).subscribe({ error: () => undefined });
    const request = httpTesting.expectOne('/api/v1/transfers');
    request.flush(
      {
        type: 'https://api.azzu.tech/problems/csrf-validation-failed',
        title: 'Validación de seguridad fallida',
        status: 403,
        detail: 'Actualiza la página e inténtalo nuevamente.',
        code: 'CSRF_VALIDATION_FAILED',
        correlationId: 'trace-456',
      },
      { status: 403, statusText: 'Forbidden' },
    );

    expect(sessionState.session()?.customerId).toBe('customer-1');
    expect(stepUp.challenge()).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
