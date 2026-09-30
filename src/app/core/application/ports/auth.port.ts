import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export type LoginDocumentType = 'DNI' | 'CE' | 'PASSPORT';

export interface LoginCredentials {
  documentType: LoginDocumentType;
  documentNumber: string;
  digitalKey: string;
}

export interface AuthenticatedSession {
  customerId: string;
  displayName: string;
  expiresAtUtc?: string;
  idleTimeoutSeconds?: number;
  authenticationMethods?: string[];
}

export interface AuthPort {
  beginLogin(returnUrl: string): void;
  beginStepUp(returnUrl: string): void;
  login(credentials: LoginCredentials): Observable<AuthenticatedSession>;
  getSession(): Observable<AuthenticatedSession | null>;
  logout(): Observable<void>;
}

export const AUTH_PORT = new InjectionToken<AuthPort>('AUTH_PORT');
