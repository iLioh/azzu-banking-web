import { Injectable, inject } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';
import { AUTH_PORT, AuthenticatedSession, LoginCredentials } from '../application/ports/auth.port';
import { SessionStateService } from './session-state.service';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly auth = inject(AUTH_PORT);
  private readonly state = inject(SessionStateService);
  private sessionCheck?: Observable<boolean>;
  readonly session = this.state.session;

  beginSignIn(returnUrl = '/portal/inicio'): void {
    this.auth.beginLogin(this.safeReturnUrl(returnUrl));
  }

  beginStepUp(returnUrl: string): void {
    this.auth.beginStepUp(this.safeReturnUrl(returnUrl));
  }

  authenticate(credentials: LoginCredentials): Observable<AuthenticatedSession> {
    return this.auth.login(credentials).pipe(tap((session) => this.state.set(session)));
  }

  ensureAuthenticated(): Observable<boolean> {
    if (this.session()) return of(true);
    return this.refreshSession();
  }

  refreshSession(): Observable<boolean> {
    if (this.sessionCheck) return this.sessionCheck;
    this.sessionCheck = this.auth.getSession().pipe(
      tap((session) => this.state.set(session)),
      map((session) => session !== null),
      catchError(() => {
        this.state.clear();
        return of(false);
      }),
      finalize(() => { this.sessionCheck = undefined; }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.sessionCheck;
  }

  endSession(): Observable<void> {
    return this.auth.logout().pipe(
      tap(() => this.state.clear()),
      finalize(() => this.state.clear()),
    );
  }

  invalidate(): void {
    this.state.clear();
  }

  private safeReturnUrl(returnUrl: string): string {
    return returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/portal/inicio';
  }
}
