import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, take } from 'rxjs';
import { BankingFacade } from '../../../../core/application/banking.facade';
import { asMoney, positiveMoneyValidator } from '../../shared/banking-form.utils';
import { PORTAL_PAGE_STYLES } from '../../shared/portal-page.styles';

@Component({
  selector: 'app-transfers-page',
  imports: [ReactiveFormsModule, CurrencyPipe],
  template: `
    <main class="page"><p class="eyebrow">TRANSFERENCIAS</p><h1>Nueva transferencia</h1><p class="intro">Verifica los datos del destinatario antes de continuar.</p><div class="form-layout">
    @if (step() === 'form') { <form class="surface form-card" [formGroup]="form" (ngSubmit)="continue()" novalidate>
      <label>Cuenta de origen<select formControlName="sourceAccountId"><option value="checking-1">Cuenta Sueldo · •••• 4821</option><option value="savings-1">Cuenta Ahorros · •••• 1763</option></select></label>
      <label>DNI del destinatario<input formControlName="recipientDocument" inputmode="numeric" maxlength="8" placeholder="8 dígitos" [class.invalid]="invalid('recipientDocument')"></label>@if(invalid('recipientDocument')){<p class="field-error">Ingresa un DNI de 8 dígitos.</p>}
      <label>Nombre completo<input formControlName="recipientName" maxlength="80" autocomplete="off" placeholder="Como aparece en su cuenta" [class.invalid]="invalid('recipientName')"></label>@if(invalid('recipientName')){<p class="field-error">Ingresa al menos 3 caracteres.</p>}
      <label>Monto (S/)<input formControlName="amount" inputmode="decimal" maxlength="12" placeholder="0.00" [class.invalid]="invalid('amount')"></label>@if(invalid('amount')){<p class="field-error">Ingresa un monto válido mayor a cero.</p>}
      <label>Descripción opcional<input formControlName="description" maxlength="80" placeholder="Ej. Pago compartido"></label><button class="primary" type="submit">Continuar</button>
    </form> } @else if (step() === 'review') { <section class="surface form-card"><h2>Revisa tu transferencia</h2><div class="review"><div><span>Destinatario</span><b>{{ form.controls.recipientName.value }}</b></div><div><span>DNI</span><b>{{ form.controls.recipientDocument.value }}</b></div><div><span>Monto</span><b>{{ amount() | currency:'PEN':'S/ ':'1.2-2' }}</b></div><div><span>Descripción</span><b>{{ form.controls.description.value || 'Sin descripción' }}</b></div></div>@if(result()){<p class="field-error" role="alert">{{ result() }}</p>}<div class="actions"><button class="secondary" type="button" [disabled]="confirming()" (click)="step.set('form')">Editar</button><button class="primary" type="button" [disabled]="confirming()" (click)="confirm()">{{ confirming() ? 'Procesando…' : 'Confirmar transferencia' }}</button></div></section> } @else { <section class="surface form-card"><h2>Solicitud registrada</h2><p class="status">{{ result() }}</p><button class="primary" type="button" (click)="reset()">Hacer otra transferencia</button></section> }
    <aside class="side-note"><b>Antes de confirmar</b><p>En producción, esta operación solicitará autenticación reforzada y se validará nuevamente en el servidor.</p></aside></div></main>`,
  styles: [PORTAL_PAGE_STYLES],
})
export class TransfersPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly banking = inject(BankingFacade);
  protected readonly step = signal<'form' | 'review' | 'success'>('form');
  protected readonly submitted = signal(false);
  protected readonly confirming = signal(false);
  private readonly idempotencyKey = signal('');
  protected readonly result = signal('');
  protected readonly form = this.fb.nonNullable.group({
    sourceAccountId: ['checking-1', Validators.required],
    recipientDocument: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    recipientName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    amount: ['', [Validators.required, positiveMoneyValidator]],
    description: ['', Validators.maxLength(80)],
  });
  protected readonly amount = computed(() => asMoney(this.form.controls.amount.value || '0'));
  protected invalid(name: keyof typeof this.form.controls) { const field = this.form.controls[name]; return field.invalid && (field.touched || this.submitted()); }
  protected continue() { this.submitted.set(true); if (this.form.invalid) { this.form.markAllAsTouched(); return; } if (!this.idempotencyKey()) this.idempotencyKey.set(crypto.randomUUID()); this.result.set(''); this.step.set('review'); }
  protected confirm() {
    if (this.confirming()) return;
    this.confirming.set(true);
    this.result.set('');
    this.banking.createTransfer({ ...this.form.getRawValue(), amount: this.amount(), idempotencyKey: this.idempotencyKey() }).pipe(
      take(1),
      finalize(() => this.confirming.set(false)),
    ).subscribe({
      next: (operation) => { this.result.set(`${operation.message} Código: ${operation.id}.`); this.step.set('success'); },
      error: () => this.result.set('No pudimos procesar la transferencia. Vuelve a intentarlo sin cerrar esta pantalla.'),
    });
  }
  protected reset() { this.form.reset({ sourceAccountId: 'checking-1', recipientDocument: '', recipientName: '', amount: '', description: '' }); this.submitted.set(false); this.idempotencyKey.set(''); this.result.set(''); this.step.set('form'); }
}
