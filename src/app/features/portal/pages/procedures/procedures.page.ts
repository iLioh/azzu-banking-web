import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { BankingFacade } from '../../../../core/application/banking.facade';
import { PORTAL_PAGE_STYLES } from '../../shared/portal-page.styles';

type ProcedureType = 'bank-certificate' | 'data-update' | 'claim';

@Component({
  selector: 'app-procedures-page',
  imports: [ReactiveFormsModule],
  template: `<main class="page"><p class="eyebrow">TRÁMITES</p><h1>Resuelve lo que necesitas sin ir a una oficina.</h1><p class="intro">Selecciona una solicitud y deja el detalle necesario para continuar.</p><div class="form-layout"><section class="surface form-card"><div class="grid procedure-grid"><button class="action-card" type="button" (click)="select('bank-certificate')"><b>Constancia bancaria</b><span>Solicita y descarga tu documento.</span><i>→</i></button><button class="action-card" type="button" (click)="select('data-update')"><b>Actualizar datos</b><span>Mantén tu información al día.</span><i>→</i></button><button class="action-card" type="button" (click)="select('claim')"><b>Reclamo o consulta</b><span>Registra y sigue una solicitud.</span><i>→</i></button></div>@if(selected()){<form [formGroup]="form" (ngSubmit)="submit()"><label>Detalle de la solicitud<textarea formControlName="detail" maxlength="1000" placeholder="Cuéntanos lo necesario para atenderte" [class.invalid]="form.controls.detail.invalid && submitted()"></textarea></label>@if(form.controls.detail.invalid && submitted()){<p class="field-error">Describe tu solicitud con al menos 10 caracteres.</p>}<div class="actions"><button class="secondary" type="button" (click)="cancel()">Cancelar</button><button class="primary" type="submit">Enviar solicitud</button></div>@if(message()){<p class="status">{{ message() }}</p>}</form>}</section><aside class="side-note"><b>Seguimiento</b><p>Las solicitudes reales tendrán número de caso, estado, evidencia y tiempos de atención definidos.</p></aside></div></main>`,
  styles: [PORTAL_PAGE_STYLES + `.procedure-grid{grid-template-columns:1fr}.procedure-grid .action-card{min-height:92px}.form-card form{display:grid;gap:14px}`],
})
export class ProceduresPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly banking = inject(BankingFacade);
  protected readonly selected = signal<ProcedureType | null>(null);
  protected readonly submitted = signal(false);
  protected readonly message = signal('');
  protected readonly form = this.fb.nonNullable.group({ detail: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]] });
  protected select(type: ProcedureType) { this.selected.set(type); this.message.set(''); this.submitted.set(false); }
  protected cancel() { this.selected.set(null); this.form.reset(); this.submitted.set(false); this.message.set(''); }
  protected submit() { this.submitted.set(true); const type = this.selected(); if (this.form.invalid || !type) { this.form.markAllAsTouched(); return; } this.banking.submitProcedure({ type, detail: this.form.controls.detail.value }).pipe(take(1)).subscribe((result) => this.message.set(`${result.message} Código: ${result.id}.`)); }
}
