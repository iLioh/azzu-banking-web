import { Injectable, signal } from '@angular/core';
import { AuthenticatedSession } from '../application/ports/auth.port';

@Injectable({ providedIn: 'root' })
export class SessionStateService {
  readonly session = signal<AuthenticatedSession | null>(null);

  set(session: AuthenticatedSession | null): void {
    this.session.set(session);
  }

  clear(): void {
    this.session.set(null);
  }
}
