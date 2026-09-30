import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { BankingFacade } from '../../../../core/application/banking.facade';
import { PORTAL_PAGE_STYLES } from '../../shared/portal-page.styles';

@Component({
  selector: 'app-notification-settings-page',
  imports: [ReactiveFormsModule],
  template: `<main class="page"><p class="eyebrow">NOTIFICACIONES</p><h1>Alertas y preferencias.</h1><p class="intro">Las alertas críticas de seguridad siempre permanecerán activas. Tú eliges los demás avisos y el canal.</p><div class="form-layout"><form class="surface form-card" [formGroup]="form" (ngSubmit)="save()"><h2>Qué quieres recibir</h2><label class="switch-row"><input type="checkbox" formControlName="transfers">Transferencias enviadas y recibidas</label><label class="switch-row"><input type="checkbox" formControlName="cardPurchases">Compras, pagos y retiros con tarjeta</label><label class="switch-row"><input type="checkbox" formControlName="security">Accesos y cambios de seguridad</label><label class="switch-row"><input type="checkbox" formControlName="marketing">Beneficios y novedades de Azzu</label><label>Canal preferido<select formControlName="channel"><option value="push">Notificación en la app</option><option value="email">Correo electrónico</option><option value="both">Ambos canales</option></select></label><button class="primary" type="submit">Guardar preferencias</button>@if(message()){<p class="status">{{ message() }}</p>}</form><aside class="side-note"><b>Alertas obligatorias</b><p>Por seguridad, los accesos no reconocidos, cambios de clave y operaciones de riesgo no pueden desactivarse por completo.</p></aside></div></main>`,
  styles: [PORTAL_PAGE_STYLES],
})
export class NotificationSettingsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly banking = inject(BankingFacade);
  protected readonly message = signal('');
  protected readonly form = this.fb.nonNullable.group({ transfers: [true], cardPurchases: [true], security: [true], marketing: [false], channel: this.fb.nonNullable.control<'email' | 'push' | 'both'>('push', Validators.required) });
  protected save() { if (this.form.invalid) return; this.banking.updateNotificationPreferences(this.form.getRawValue()).pipe(take(1)).subscribe((result) => this.message.set(result.message)); }
}
