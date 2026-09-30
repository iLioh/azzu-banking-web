import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiOperation, BankingCommandPort, CardControlUpdate, DigitalKeyChange, LoanApplicationRequest, LoanSimulation, LoanSimulationRequest, NotificationPreferencesUpdate, PaymentDraft, ProcedureRequest, ProfileUpdate, TransferDraft } from '../../application/ports/banking-command.port';

@Injectable()
export class HttpBankingCommandAdapter implements BankingCommandPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  createTransfer(draft: TransferDraft): Observable<ApiOperation> {
    const { idempotencyKey, ...payload } = draft;
    return this.http.post<ApiOperation>(`${this.baseUrl}/transfers`, payload, {
      withCredentials: true,
      headers: { 'Idempotency-Key': idempotencyKey },
    });
  }

  createPayment(draft: PaymentDraft): Observable<ApiOperation> {
    const { idempotencyKey, ...payload } = draft;
    return this.http.post<ApiOperation>(`${this.baseUrl}/payments`, payload, {
      withCredentials: true,
      headers: { 'Idempotency-Key': idempotencyKey },
    });
  }

  simulateLoan(request: LoanSimulationRequest): Observable<LoanSimulation> {
    return this.http.post<LoanSimulation>(`${this.baseUrl}/loans/simulations`, request, { withCredentials: true });
  }

  applyForLoan(request: LoanApplicationRequest): Observable<ApiOperation> {
    const { idempotencyKey, ...payload } = request;
    return this.http.post<ApiOperation>(`${this.baseUrl}/loans/applications`, payload, {
      withCredentials: true,
      headers: { 'Idempotency-Key': idempotencyKey },
    });
  }

  submitProcedure(request: ProcedureRequest): Observable<ApiOperation> {
    return this.http.post<ApiOperation>(`${this.baseUrl}/procedures`, request, { withCredentials: true });
  }

  updateProfile(request: ProfileUpdate): Observable<ApiOperation> {
    return this.http.put<ApiOperation>(`${this.baseUrl}/customers/me/profile`, request, { withCredentials: true });
  }

  changeDigitalKey(request: DigitalKeyChange): Observable<ApiOperation> {
    return this.http.put<ApiOperation>(`${this.baseUrl}/auth/digital-key`, request, { withCredentials: true });
  }

  updateNotificationPreferences(request: NotificationPreferencesUpdate): Observable<ApiOperation> {
    return this.http.put<ApiOperation>(`${this.baseUrl}/notifications/preferences`, request, { withCredentials: true });
  }

  revokeOtherSessions(): Observable<ApiOperation> {
    return this.http.post<ApiOperation>(`${this.baseUrl}/auth/sessions/revoke-others`, {}, { withCredentials: true });
  }

  markNotificationsRead(): Observable<ApiOperation> {
    return this.http.post<ApiOperation>(`${this.baseUrl}/notifications/read`, {}, { withCredentials: true });
  }

  updateCardControls(request: CardControlUpdate): Observable<ApiOperation> {
    return this.http.put<ApiOperation>(`${this.baseUrl}/cards/${encodeURIComponent(request.cardId)}/controls`, request, { withCredentials: true });
  }

  setCardTemporaryBlock(cardId: string, blocked: boolean): Observable<ApiOperation> {
    return this.http.put<ApiOperation>(`${this.baseUrl}/cards/${encodeURIComponent(cardId)}/temporary-block`, { blocked }, { withCredentials: true });
  }
}
