import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, take } from 'rxjs';
import { BankingFacade } from '../../../../core/application/banking.facade';
import { LoanSimulation } from '../../../../core/application/ports/banking-command.port';
import { asMoney, positiveMoneyValidator } from '../../shared/banking-form.utils';
import { PORTAL_PAGE_STYLES } from '../../shared/portal-page.styles';

@Component({
  selector: 'app-loans-page',
  imports: [ReactiveFormsModule, CurrencyPipe],
  template: `<main class="page"><p class="eyebrow">PRÉSTAMOS</p><h1>Simula un préstamo personal.</h1><p class="intro">La simulación es informativa y no constituye una aprobación u oferta de crédito.</p><div class="form-layout"><form class="surface form-card" [formGroup]="form" (ngSubmit)="simulate()" novalidate><label>Monto solicitado (S/)<input formControlName="amount" inputmode="decimal" maxlength="12" [class.invalid]="invalid('amount')"></label>@if(invalid('amount')){<p class="field-error">Ingresa un monto válido mayor a cero.</p>}<label>Plazo<select formControlName="termMonths"><option [ngValue]="6">6 meses</option><option [ngValue]="12">12 meses</option><option [ngValue]="24">24 meses</option><option [ngValue]="36">36 meses</option><option [ngValue]="48">48 meses</option></select></label><label>Ingreso mensual estimado (S/)<input formControlName="monthlyIncome" inputmode="decimal" maxlength="12" [class.invalid]="invalid('monthlyIncome')"></label>@if(invalid('monthlyIncome')){<p class="field-error">Ingresa un monto válido mayor a cero.</p>}<button class="primary" type="submit">Calcular cuota</button>@if(simulation()){<div class="status"><b>Resultado estimado</b><br>Cuota mensual: {{ simulation()!.monthlyPayment | currency:'PEN':'S/ ':'1.2-2' }}<br>Total estimado: {{ simulation()!.totalPayment | currency:'PEN':'S/ ':'1.2-2' }}<br>Tasa anual referencial: {{ simulation()!.annualRate }}%</div><label class="switch-row"><input type="checkbox" formControlName="accepted">Entiendo que esta simulación no es una aprobación.</label><button class="primary" type="button" [disabled]="applying()" (click)="apply()">{{ applying() ? 'Enviando…' : 'Solicitar evaluación' }}</button>}@if(message()){<p class="status">{{ message() }}</p>}</form><aside class="side-note"><b>Transparencia</b><p>La API real debe devolver TCEA, seguros, comisiones, cronograma y documentos antes de aceptar una solicitud.</p></aside></div></main>`,
  styles: [PORTAL_PAGE_STYLES],
})
export class LoansPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly banking = inject(BankingFacade);
  protected readonly submitted = signal(false);
  protected readonly simulation = signal<LoanSimulation | null>(null);
  protected readonly applying = signal(false);
  protected readonly message = signal('');
  protected readonly form = this.fb.nonNullable.group({ amount: ['', [Validators.required, positiveMoneyValidator]], termMonths: [24, Validators.required], monthlyIncome: ['', [Validators.required, positiveMoneyValidator]], accepted: [false] });
  protected invalid(name: 'amount' | 'monthlyIncome') { const field = this.form.controls[name]; return field.invalid && (field.touched || this.submitted()); }
  protected simulate() { this.submitted.set(true); if (this.form.invalid) { this.form.markAllAsTouched(); return; } this.banking.simulateLoan({ amount: asMoney(this.form.controls.amount.value), termMonths: this.form.controls.termMonths.value, monthlyIncome: asMoney(this.form.controls.monthlyIncome.value) }).pipe(take(1)).subscribe((simulation) => this.simulation.set(simulation)); }
  protected apply() {
    if (!this.form.controls.accepted.value) { this.message.set('Debes confirmar que entiendes el carácter referencial de la simulación.'); return; }
    if (this.applying()) return;
    this.applying.set(true);
    this.message.set('');
    this.banking.applyForLoan({ amount: asMoney(this.form.controls.amount.value), termMonths: this.form.controls.termMonths.value, monthlyIncome: asMoney(this.form.controls.monthlyIncome.value), simulationAccepted: true, idempotencyKey: crypto.randomUUID() }).pipe(
      take(1),
      finalize(() => this.applying.set(false)),
    ).subscribe({
      next: (operation) => this.message.set(`${operation.message} Código: ${operation.id}.`),
      error: () => this.message.set('No pudimos enviar la solicitud de evaluación. Inténtalo nuevamente.'),
    });
  }
}
