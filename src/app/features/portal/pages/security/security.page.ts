import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideLaptop, LucideSmartphone } from '@lucide/angular';
import { take } from 'rxjs';
import { BankingFacade } from '../../../../core/application/banking.facade';
import { PORTAL_PAGE_STYLES } from '../../shared/portal-page.styles';

@Component({
  selector: 'app-security-page',
  imports: [ReactiveFormsModule, LucideLaptop, LucideSmartphone],
  template: `<main class="page"><p class="eyebrow">SEGURIDAD</p><h1>Clave digital y dispositivos.</h1><p class="intro">Administra tu acceso. En producción, estas acciones requerirán verificación reforzada y serán auditadas.</p><div class="security-layout"><form class="surface form-card" [formGroup]="form" (ngSubmit)="changeKey()" novalidate><h2>Cambiar clave digital</h2><label>Clave actual<input type="password" inputmode="numeric" autocomplete="current-password" maxlength="6" formControlName="currentKey" [class.invalid]="invalid('currentKey')"></label>@if(invalid('currentKey')){<p class="field-error">Ingresa los 6 dígitos de tu clave actual.</p>}<label>Nueva clave<input type="password" inputmode="numeric" autocomplete="new-password" maxlength="6" formControlName="newKey" [class.invalid]="invalid('newKey') || sameKey()"></label>@if(invalid('newKey')){<p class="field-error">La nueva clave debe contener 6 dígitos.</p>}@if(sameKey()){<p class="field-error">La nueva clave debe ser diferente de la actual.</p>}<label>Confirma la nueva clave<input type="password" inputmode="numeric" autocomplete="new-password" maxlength="6" formControlName="confirmation" [class.invalid]="mismatch()"></label>@if(mismatch()){<p class="field-error">Las claves nuevas no coinciden.</p>}<button class="primary" type="submit">Actualizar clave</button>@if(message()){<p class="status">{{ message() }}</p>}</form><section class="surface devices"><h2>Dispositivos con sesión</h2><article><span><svg lucideLaptop [size]="20"></svg></span><div><b>Este equipo</b><small>Windows · Lima · Sesión actual</small></div><em>Activo</em></article><article><span><svg lucideSmartphone [size]="20"></svg></span><div><b>Teléfono personal</b><small>Android · Último acceso ayer</small></div></article><button class="secondary" type="button" (click)="revokeSessions()">Cerrar otras sesiones</button>@if(sessionMessage()){<p class="status">{{ sessionMessage() }}</p>}</section></div></main>`,
  styles: [PORTAL_PAGE_STYLES, `.security-layout{display:grid;gap:18px;grid-template-columns:minmax(0,1fr) minmax(320px,.8fr)}.devices{align-self:start;padding:22px}.devices h2{font-size:18px;margin:0 0 12px}.devices article{align-items:center;border-top:1px solid #edf0f3;display:grid;gap:11px;grid-template-columns:40px 1fr auto;padding:14px 0}.devices article>span{align-items:center;background:#eaf6ad;border-radius:9px;color:#526300;display:flex;height:40px;justify-content:center;width:40px}.devices article div{display:grid;gap:4px}.devices article b{font-size:12px}.devices article small{color:#687291;font-size:10px}.devices article em{color:#00a62a;font-size:10px;font-style:normal;font-weight:700}@media(max-width:820px){.security-layout{grid-template-columns:1fr}}`],
})
export class SecurityPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly banking = inject(BankingFacade);
  protected readonly submitted = signal(false);
  protected readonly message = signal('');
  protected readonly sessionMessage = signal('');
  protected readonly form = this.fb.nonNullable.group({ currentKey: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]], newKey: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]], confirmation: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]] });
  protected invalid(name: keyof typeof this.form.controls) { const field = this.form.controls[name]; return field.invalid && (field.touched || this.submitted()); }
  protected mismatch() { return this.submitted() && this.form.controls.confirmation.value !== this.form.controls.newKey.value; }
  protected sameKey() { return this.submitted() && !!this.form.controls.newKey.value && this.form.controls.currentKey.value === this.form.controls.newKey.value; }
  protected changeKey() { this.submitted.set(true); if (this.form.invalid || this.mismatch() || this.sameKey()) { this.form.markAllAsTouched(); return; } this.banking.changeDigitalKey({ currentKey: this.form.controls.currentKey.value, newKey: this.form.controls.newKey.value }).pipe(take(1)).subscribe((result) => this.message.set(result.message)); }
  protected revokeSessions() { this.banking.revokeOtherSessions().pipe(take(1)).subscribe((result) => this.sessionMessage.set(result.message)); }
}
