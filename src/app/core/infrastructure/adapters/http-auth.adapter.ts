import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthenticatedSession, AuthPort, LoginCredentials } from '../../application/ports/auth.port';

@Injectable()
export class HttpAuthAdapter implements AuthPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  beginLogin(returnUrl: string): void {
    window.location.assign(`${this.baseUrl}/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  }

  beginStepUp(returnUrl: string): void {
    window.location.assign(`${this.baseUrl}/step-up?returnUrl=${encodeURIComponent(returnUrl)}`);
  }

  login(credentials: LoginCredentials): Observable<AuthenticatedSession> {
    return this.http.post<AuthenticatedSession>(`${this.baseUrl}/login`, credentials, { withCredentials: true });
  }

  getSession(): Observable<AuthenticatedSession | null> {
    return this.http.get<AuthenticatedSession | null>(`${this.baseUrl}/session`, { withCredentials: true });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {}, { withCredentials: true });
  }
}
