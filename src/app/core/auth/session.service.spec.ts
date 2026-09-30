import { TestBed } from '@angular/core/testing';
import { firstValueFrom, Observable, of } from 'rxjs';
import { AUTH_PORT, AuthenticatedSession, AuthPort, LoginCredentials } from '../application/ports/auth.port';
import { SessionService } from './session.service';

class AuthPortStub implements AuthPort {
  session: AuthenticatedSession | null = null;
  loginReturnUrl = '';
  stepUpReturnUrl = '';

  beginLogin(returnUrl: string): void { this.loginReturnUrl = returnUrl; }
  beginStepUp(returnUrl: string): void { this.stepUpReturnUrl = returnUrl; }
  login(_credentials: LoginCredentials): Observable<AuthenticatedSession> {
    this.session = { customerId: 'customer-1', displayName: 'Mariana' };
    return of(this.session);
  }
  getSession(): Observable<AuthenticatedSession | null> { return of(this.session); }
  logout(): Observable<void> { this.session = null; return of(undefined); }
}

describe('SessionService', () => {
  let service: SessionService;
  let auth: AuthPortStub;

  beforeEach(() => {
    auth = new AuthPortStub();
    TestBed.configureTestingModule({ providers: [SessionService, { provide: AUTH_PORT, useValue: auth }] });
    service = TestBed.inject(SessionService);
  });

  it('stores and clears an authenticated session', async () => {
    await firstValueFrom(service.authenticate({ documentType: 'DNI', documentNumber: '12345678', digitalKey: '123456' }));
    expect(service.session()?.customerId).toBe('customer-1');
    await firstValueFrom(service.endSession());
    expect(service.session()).toBeNull();
  });

  it('rejects an external return URL before starting authentication', () => {
    service.beginSignIn('https://evil.example/steal');
    expect(auth.loginReturnUrl).toBe('/portal/inicio');
  });

  it('accepts an internal return URL for step-up', () => {
    service.beginStepUp('/portal/operaciones/transferencias');
    expect(auth.stepUpReturnUrl).toBe('/portal/operaciones/transferencias');
  });
});
