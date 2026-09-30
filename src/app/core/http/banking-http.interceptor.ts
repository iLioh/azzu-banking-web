import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionStateService } from '../auth/session-state.service';
import { StepUpService } from '../auth/step-up.service';
import { normalizeApiError, readPublicErrorBody } from './api-error';

export const bankingHttpInterceptor: HttpInterceptorFn = (request, next) => {
  if (!isBankingApiRequest(request.url)) return next(request);

  const sessionState = inject(SessionStateService);
  const stepUp = inject(StepUpService);
  const router = inject(Router);
  const correlationId = request.headers.get('X-Correlation-ID') ?? crypto.randomUUID();
  const securedRequest = request.clone({
    withCredentials: true,
    setHeaders: {
      Accept: 'application/json',
      'X-Correlation-ID': correlationId,
    },
  });

  return next(securedRequest).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) return throwError(() => error);

      const body = readPublicErrorBody(error);
      const isStepUpRequired = error.status === 401 && body.code === 'STEP_UP_REQUIRED';
      if (isStepUpRequired) {
        stepUp.require({
          code: 'STEP_UP_REQUIRED',
          reason: body.message ?? 'Confirma tu identidad para continuar con esta operación.',
          challengeId: body.challengeId,
        });
      }

      if (error.status === 401 && !isStepUpRequired) {
        sessionState.clear();
        if (!router.url.startsWith('/auth')) void router.navigate(['/auth'], { queryParams: { reason: 'expired' } });
      }

      return throwError(() => normalizeApiError(error));
    }),
  );
};

function isBankingApiRequest(url: string): boolean {
  return url === environment.apiBaseUrl || url.startsWith(`${environment.apiBaseUrl}/`);
}
