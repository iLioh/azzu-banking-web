import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthenticatedSession, AuthPort, LoginCredentials } from '../../application/ports/auth.port';

@Injectable()
export class MockAuthAdapter implements AuthPort {
  private session: AuthenticatedSession | null = null;

  beginLogin(_returnUrl: string): void {}

  beginStepUp(_returnUrl: string): void {}

  login(_credentials: LoginCredentials): Observable<AuthenticatedSession> {
    this.session = {
      customerId: 'demo-customer',
      displayName: 'Mariana',
      idleTimeoutSeconds: 15 * 60,
      authenticationMethods: ['mock'],
    };
    return of(this.session);
  }

  getSession(): Observable<AuthenticatedSession | null> {
    return of(this.session);
  }

  logout(): Observable<void> {
    this.session = null;
    return of(undefined);
  }
}
