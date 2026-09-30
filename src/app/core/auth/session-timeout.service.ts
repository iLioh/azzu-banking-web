import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, of, take } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly activityEvents = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
  private lastActivityAt = Date.now();
  private timerId?: number;
  private started = false;
  private expiring = false;

  readonly warningVisible = signal(false);
  readonly secondsRemaining = signal(0);

  constructor() {
    this.destroyRef.onDestroy(() => this.stop());
  }

  start(): void {
    if (this.started) return;
    this.started = true;
    this.lastActivityAt = Date.now();
    this.activityEvents.forEach((eventName) => this.document.addEventListener(eventName, this.recordActivity, { passive: true }));
    this.timerId = window.setInterval(() => this.tick(), 1_000);
  }

  stop(): void {
    if (!this.started) return;
    this.started = false;
    this.activityEvents.forEach((eventName) => this.document.removeEventListener(eventName, this.recordActivity));
    if (this.timerId !== undefined) window.clearInterval(this.timerId);
    this.timerId = undefined;
    this.warningVisible.set(false);
  }

  continueSession(): void {
    this.session.refreshSession().pipe(take(1)).subscribe((authenticated) => {
      if (!authenticated) {
        this.expire();
        return;
      }
      this.lastActivityAt = Date.now();
      this.warningVisible.set(false);
    });
  }

  closeSession(): void {
    this.expire();
  }

  private readonly recordActivity = (): void => {
    if (this.warningVisible()) return;
    this.lastActivityAt = Date.now();
  };

  private tick(): void {
    const idleTimeout = this.session.session()?.idleTimeoutSeconds ?? environment.defaultIdleTimeoutSeconds;
    const elapsedSeconds = Math.floor((Date.now() - this.lastActivityAt) / 1_000);
    const remaining = Math.max(0, idleTimeout - elapsedSeconds);
    this.secondsRemaining.set(remaining);
    this.warningVisible.set(remaining > 0 && remaining <= environment.idleWarningSeconds);
    if (remaining === 0) this.expire();
  }

  private expire(): void {
    if (this.expiring) return;
    this.expiring = true;
    this.session.endSession().pipe(
      take(1),
      catchError(() => of(undefined)),
      finalize(() => {
        this.stop();
        this.expiring = false;
        void this.router.navigate(['/auth'], { queryParams: { reason: 'expired' } });
      }),
    ).subscribe();
  }
}
