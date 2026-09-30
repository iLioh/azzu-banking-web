import { Injectable } from '@angular/core';
import { delay, of } from 'rxjs';
import { ApiOperation, BankingCommandPort, CardControlUpdate, DigitalKeyChange, LoanApplicationRequest, LoanSimulation, LoanSimulationRequest, NotificationPreferencesUpdate, PaymentDraft, ProcedureRequest, ProfileUpdate, TransferDraft } from '../../application/ports/banking-command.port';

@Injectable()
export class MockBankingCommandAdapter implements BankingCommandPort {
  createTransfer(_: TransferDraft) { return this.operation('Transferencia validada. No se ha enviado dinero.'); }
  createPayment(_: PaymentDraft) { return this.operation('Pago validado. No se ha enviado dinero.'); }
  submitProcedure(_: ProcedureRequest) { return this.operation('Solicitud registrada para demostración.'); }
  updateProfile(_: ProfileUpdate) { return this.operation('Datos validados. Aún no se guardaron en producción.'); }
  changeDigitalKey(_: DigitalKeyChange) { return this.operation('Clave digital validada. El cambio real requiere el servicio de identidad.'); }
  updateNotificationPreferences(_: NotificationPreferencesUpdate) { return this.operation('Preferencias validadas. Aún no se guardaron en producción.'); }
  revokeOtherSessions() { return this.operation('Solicitud validada. El cierre real requiere el servicio de sesiones.'); }
  markNotificationsRead() { return this.operation('Notificaciones marcadas como leídas para esta sesión.'); }
  updateCardControls(_: CardControlUpdate) { return this.operation('Configuración validada. Aún no se aplicó a una tarjeta real.'); }
  setCardTemporaryBlock(_: string, __: boolean) { return this.operation('Bloqueo temporal validado. Aún no se aplicó a una tarjeta real.'); }
  applyForLoan(_: LoanApplicationRequest) { return this.operation('Solicitud de evaluación validada. Aún no se envió a producción.'); }
  simulateLoan(request: LoanSimulationRequest) {
    const monthlyRate = 0.019;
    const monthlyPayment = request.amount * (monthlyRate * Math.pow(1 + monthlyRate, request.termMonths)) / (Math.pow(1 + monthlyRate, request.termMonths) - 1);
    const result: LoanSimulation = { monthlyPayment, totalPayment: monthlyPayment * request.termMonths, annualRate: 26.8 };
    return of(result).pipe(delay(250));
  }
  private operation(message: string) {
    const result: ApiOperation = { id: `demo-${Date.now()}`, status: 'accepted', message };
    return of(result).pipe(delay(280));
  }
}
