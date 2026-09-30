import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, take } from 'rxjs';
import { BankingFacade } from '../../../../core/application/banking.facade';
import { asMoney, positiveMoneyValidator } from '../../shared/banking-form.utils';
import { PORTAL_PAGE_STYLES } from '../../shared/portal-page.styles';

@Component({
  selector: 'app-payments-page',
  imports: [ReactiveFormsModule, CurrencyPipe],
  template: `<main class="page"><p class="eyebrow">PAGOS</p><h1>Pagar servicios</h1><p class="intro">Elige el servicio e ingresa el código de suministro. Revisa el importe antes de confirmar.</p><div class="form-layout">
  @if(step()==='form'){<form class="surface form-card" [formGroup]="form" (ngSubmit)="review()" novalidate>
    <label>Cuenta de cargo<select formControlName="sourceAccountId"><option value="checking-1">Cuenta Sueldo · •••• 4821</option><option value="savings-1">Cuenta Ahorros · •••• 1763</option></select></label>
    <label>Servicio<select formControlName="service"><option value="Luz">Luz</option><option value="Agua">Agua</option><option value="Celular">Celular</option><option value="Internet">Internet</option></select></label>
    <label>Código de cliente<input formControlName="customerCode" inputmode="numeric" maxlength="20" placeholder="Código del recibo" [class.invalid]="invalid('customerCode')"></label>@if(invalid('customerCode')){<p class="field-error">Ingresa entre 6 y 20 dígitos.</p>}
    <label>Monto (S/)<input formControlName="amount" inputmode="decimal" maxlength="12" placeholder="0.00" [class.invalid]="invalid('amount')"></label>@if(invalid('amount')){<p class="field-error">Ingresa un monto válido mayor a cero.</p>}
    <button class="primary" type="submit">Revisar pago</button>
  </form>}@else if(step()==='review'){<section class="surface form-card"><h2>Revisa tu pago</h2><div class="review"><div><span>Servicio</span><b>{{ form.controls.service.value }}</b></div><div><span>Código</span><b>{{ form.controls.customerCode.value }}</b></div><div><span>Monto</span><b>{{ amount() | currency:'PEN':'S/ ':'1.2-2' }}</b></div></div>@if(message()){<p class="field-error" role="alert">{{ message() }}</p>}<div class="actions"><button class="secondary" type="button" [disabled]="processing()" (click)="step.set('form')">Editar</button><button class="primary" type="button" [disabled]="processing()" (click)="confirm()">{{ processing() ? 'Procesando…' : 'Confirmar pago' }}</button></div></section>}@else{<section class="surface form-card"><h2>Pago registrado</h2><p class="status">{{ message() }}</p><button class="primary" type="button" (click)="reset()">Pagar otro servicio</button></section>}
  <aside class="side-note"><b>Pago seguro</b><p>La API consulta el recibo, valida nuevamente la cuenta y procesa el pago con una clave de idempotencia.</p></aside></div></main>`,
  styles: [PORTAL_PAGE_STYLES],
})
export class PaymentsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly banking = inject(BankingFacade);
  protected readonly submitted = signal(false);
  protected readonly processing = signal(false);
  protected readonly step = signal<'form' | 'review' | 'success'>('form');
  protected readonly message = signal('');
  private readonly idempotencyKey = signal('');
  protected readonly form = this.fb.nonNullable.group({ sourceAccountId: ['checking-1', Validators.required], service: ['Luz' as const, Validators.required], customerCode: ['', [Validators.required, Validators.pattern(/^\d{6,20}$/)]], amount: ['', [Validators.required, positiveMoneyValidator]] });
  protected readonly amount = computed(() => asMoney(this.form.controls.amount.value || '0'));
  protected invalid(name: keyof typeof this.form.controls) { const field = this.form.controls[name]; return field.invalid && (field.touched || this.submitted()); }
  protected review() { this.submitted.set(true); if (this.form.invalid) { this.form.markAllAsTouched(); return; } if (!this.idempotencyKey()) this.idempotencyKey.set(crypto.randomUUID()); this.message.set(''); this.step.set('review'); }
  protected confirm() {
    if (this.processing()) return;
    this.processing.set(true);
    const value = this.form.getRawValue();
    this.banking.createPayment({ ...value, amount: this.amount(), idempotencyKey: this.idempotencyKey() }).pipe(take(1), finalize(() => this.processing.set(false))).subscribe({
      next: (operation) => { this.message.set(`${operation.message} Código: ${operation.id}.`); this.step.set('success'); },
      error: () => this.message.set('No pudimos procesar el pago. Vuelve a intentarlo sin cerrar esta pantalla.'),
    });
  }
  protected reset() { this.form.reset({ sourceAccountId: 'checking-1', service: 'Luz', customerCode: '', amount: '' }); this.submitted.set(false); this.idempotencyKey.set(''); this.message.set(''); this.step.set('form'); }
}
