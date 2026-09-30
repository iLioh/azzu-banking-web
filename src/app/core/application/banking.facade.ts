import { Injectable, inject } from '@angular/core';
import { BANKING_COMMAND_PORT, CardControlUpdate, DigitalKeyChange, LoanApplicationRequest, LoanSimulationRequest, NotificationPreferencesUpdate, PaymentDraft, ProcedureRequest, ProfileUpdate, TransferDraft } from './ports/banking-command.port';
import { BANKING_QUERY_PORT } from './ports/banking-query.port';

/** Application boundary used by the UI. It contains no HTTP, storage or framework adapter details. */
@Injectable({ providedIn: 'root' })
export class BankingFacade {
  private readonly queries = inject(BANKING_QUERY_PORT);
  private readonly commands = inject(BANKING_COMMAND_PORT);

  getCustomerName() { return this.queries.getCustomerName(); }
  getAccounts() { return this.queries.getAccounts(); }
  getRecentTransactions() { return this.queries.getRecentTransactions(); }
  getNotifications() { return this.queries.getNotifications(); }
  createTransfer(draft: TransferDraft) { return this.commands.createTransfer(draft); }
  createPayment(draft: PaymentDraft) { return this.commands.createPayment(draft); }
  simulateLoan(request: LoanSimulationRequest) { return this.commands.simulateLoan(request); }
  applyForLoan(request: LoanApplicationRequest) { return this.commands.applyForLoan(request); }
  submitProcedure(request: ProcedureRequest) { return this.commands.submitProcedure(request); }
  updateProfile(request: ProfileUpdate) { return this.commands.updateProfile(request); }
  changeDigitalKey(request: DigitalKeyChange) { return this.commands.changeDigitalKey(request); }
  updateNotificationPreferences(request: NotificationPreferencesUpdate) { return this.commands.updateNotificationPreferences(request); }
  revokeOtherSessions() { return this.commands.revokeOtherSessions(); }
  markNotificationsRead() { return this.commands.markNotificationsRead(); }
  updateCardControls(request: CardControlUpdate) { return this.commands.updateCardControls(request); }
  setCardTemporaryBlock(cardId: string, blocked: boolean) { return this.commands.setCardTemporaryBlock(cardId, blocked); }
}
