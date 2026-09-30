import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, take } from 'rxjs';
import { BankingFacade } from '../../../../core/application/banking.facade';
import { asMoney, positiveMoneyValidator } from '../../shared/banking-form.utils';
import { PORTAL_PAGE_STYLES } from '../../shared/portal-page.styles';

@Component({
  selector: 'app-cards-page',
  imports: [ReactiveFormsModule],
  template: `<main class="page"><p class="eyebrow">TARJETAS</p><h1>Configuración de tarjeta</h1><p class="intro">Los cambios sensibles deben requerir autenticación reforzada cuando exista el backend.</p><div class="form-layout"><form class="surface form-card" [formGroup]="form" (ngSubmit)="submit()" novalidate><h2>Tarjeta Azzu Visa · •••• 2048</h2><label>Límite diario de compras (S/)<input formControlName="purchaseLimit" inputmode="decimal" maxlength="12" placeholder="0.00" [class.invalid]="form.controls.purchaseLimit.invalid && submitted()"></label>@if(form.controls.purchaseLimit.invalid && submitted()){<p class="field-error">Ingresa un límite válido mayor a cero.</p>}<label class="switch-row"><input type="checkbox" formControlName="onlinePaymentsEnabled">Permitir compras por internet</label><div class="actions"><button class="secondary" type="button" [disabled]="blocking()" (click)="temporaryBlock()">{{ blocking() ? 'Bloqueando…' : 'Bloquear temporalmente' }}</button><button class="primary" type="submit">Guardar cambios</button></div>@if(message()){<p class="status">{{ message() }}</p>}</form><aside class="side-note"><b>Control de tarjeta</b><p>El bloqueo, el cambio de límites y la visualización de datos requieren una segunda validación del cliente.</p></aside></div></main>`,
  styles: [PORTAL_PAGE_STYLES],
})
export class CardsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly banking = inject(BankingFacade);
  protected readonly submitted = signal(false);
  protected readonly blocking = signal(false);
  protected readonly message = signal('');
  protected readonly form = this.fb.nonNullable.group({ purchaseLimit: ['2500', [Validators.required, positiveMoneyValidator]], onlinePaymentsEnabled: [true] });
  protected submit() { this.submitted.set(true); if (this.form.invalid) { this.form.markAllAsTouched(); return; } this.banking.updateCardControls({ cardId: 'card-1', purchaseLimit: asMoney(this.form.controls.purchaseLimit.value), onlinePaymentsEnabled: this.form.controls.onlinePaymentsEnabled.value }).pipe(take(1)).subscribe((result) => this.message.set(result.message)); }
  protected temporaryBlock() {
    if (this.blocking()) return;
    this.blocking.set(true);
    this.message.set('');
    this.banking.setCardTemporaryBlock('card-1', true).pipe(take(1), finalize(() => this.blocking.set(false))).subscribe({
      next: (result) => this.message.set(result.message),
      error: () => this.message.set('No pudimos bloquear la tarjeta. Comunícate con soporte si no la reconoces.'),
    });
  }
}
