import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { BankingFacade } from '../../../../core/application/banking.facade';
import { PORTAL_PAGE_STYLES } from '../../shared/portal-page.styles';

@Component({
  selector: 'app-profile-page',
  imports: [ReactiveFormsModule],
  template: `<main class="page"><p class="eyebrow">MIS DATOS</p><h1>Información personal y de contacto.</h1><p class="intro">Mantén actualizados tus canales de contacto. Los cambios sensibles deberán verificarse antes de aplicarse.</p><div class="form-layout"><form class="surface form-card" [formGroup]="form" (ngSubmit)="save()" novalidate><h2>Datos de contacto</h2><label>Correo electrónico<input formControlName="email" type="email" maxlength="120" autocomplete="email" [class.invalid]="invalid('email')"></label>@if(invalid('email')){<p class="field-error">Ingresa un correo válido.</p>}<label>Celular<input formControlName="phone" inputmode="tel" maxlength="9" autocomplete="tel" [class.invalid]="invalid('phone')"></label>@if(invalid('phone')){<p class="field-error">Ingresa un celular peruano de 9 dígitos.</p>}<label>Dirección<input formControlName="address" maxlength="160" autocomplete="street-address" [class.invalid]="invalid('address')"></label>@if(invalid('address')){<p class="field-error">Ingresa una dirección de al menos 8 caracteres.</p>}<button class="primary" type="submit">Guardar datos</button>@if(message()){<p class="status">{{ message() }}</p>}</form><aside class="side-note"><b>Protección de tus datos</b><p>La API deberá solicitar verificación adicional antes de cambiar el correo o celular usados para recuperar el acceso.</p></aside></div></main>`,
  styles: [PORTAL_PAGE_STYLES],
})
export class ProfilePageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly banking = inject(BankingFacade);
  protected readonly submitted = signal(false);
  protected readonly message = signal('');
  protected readonly form = this.fb.nonNullable.group({ email: ['mariana@azzu.tech', [Validators.required, Validators.email]], phone: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]], address: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(160)]] });
  protected invalid(name: keyof typeof this.form.controls) { const field = this.form.controls[name]; return field.invalid && (field.touched || this.submitted()); }
  protected save() { this.submitted.set(true); if (this.form.invalid) { this.form.markAllAsTouched(); return; } this.banking.updateProfile(this.form.getRawValue()).pipe(take(1)).subscribe((result) => this.message.set(result.message)); }
}
