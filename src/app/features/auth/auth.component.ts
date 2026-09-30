import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowRight, LucideChevronRight, LucideDelete } from '@lucide/angular';
import { finalize, take } from 'rxjs';
import { LoginDocumentType } from '../../core/application/ports/auth.port';
import { SessionService } from '../../core/auth/session.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, RouterLink, LucideArrowRight, LucideChevronRight, LucideDelete],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(SessionService);

  readonly federatedLogin = environment.authStrategy === 'bff-oidc';
  readonly documentType = signal<LoginDocumentType>('DNI');
  readonly documentTypeName = computed(() => ({ DNI: 'DNI', CE: 'carnet de extranjería', PASSPORT: 'pasaporte' })[this.documentType()]);
  readonly documentMinLength = computed(() => this.documentType() === 'PASSPORT' ? 6 : this.documentType() === 'DNI' ? 8 : 9);
  readonly documentMaxLength = computed(() => this.documentType() === 'PASSPORT' ? 12 : this.documentType() === 'DNI' ? 8 : 9);
  readonly documentInputMode = computed(() => this.documentType() === 'PASSPORT' ? 'text' : 'numeric');
  readonly documentPlaceholder = computed(() => {
    if (this.documentType() === 'DNI') return 'Ingresa tus 8 dígitos';
    if (this.documentType() === 'CE') return 'Ingresa tus 9 dígitos';
    return 'Entre 6 y 12 letras o números';
  });
  readonly sessionMessage = this.route.snapshot.queryParamMap.get('reason') === 'expired'
    ? 'Tu sesión finalizó por seguridad. Ingresa nuevamente para continuar.'
    : '';
  readonly keypadOpen = signal(false);
  readonly keypadDigits = signal(this.shuffleDigits());
  readonly submitted = signal(false);
  readonly isSubmitting = signal(false);
  readonly loginError = signal('');
  readonly loginForm = this.formBuilder.nonNullable.group({
    documentNumber: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    digitalKey: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });
  readonly documentNumberInvalid = computed(() => this.loginForm.controls.documentNumber.invalid && (this.loginForm.controls.documentNumber.touched || this.submitted()));
  readonly digitalKeyInvalid = computed(() => this.loginForm.controls.digitalKey.invalid && (this.loginForm.controls.digitalKey.touched || this.submitted()));

  changeDocumentType(event: Event): void {
    const selected = (event.target as HTMLSelectElement).value as LoginDocumentType;
    if (selected !== 'DNI' && selected !== 'CE' && selected !== 'PASSPORT') return;
    this.documentType.set(selected);
    const documentControl = this.loginForm.controls.documentNumber;
    documentControl.reset('');
    documentControl.setValidators([Validators.required, Validators.pattern(this.documentPattern(selected))]);
    documentControl.updateValueAndValidity();
  }

  openKeypad(): void {
    if (this.keypadOpen()) return;
    this.keypadDigits.set(this.shuffleDigits());
    this.keypadOpen.set(true);
  }

  @HostListener('document:pointerdown', ['$event'])
  closeKeypadOutside(event: PointerEvent): void {
    if (!this.keypadOpen()) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('.password-field, .secure-keypad')) return;
    this.keypadOpen.set(false);
  }

  enterDigitalKeyDigit(digit: string): void {
    const control = this.loginForm.controls.digitalKey;
    if (control.value.length < 6) control.setValue(`${control.value}${digit}`);
  }

  deleteDigitalKeyDigit(): void {
    const control = this.loginForm.controls.digitalKey;
    control.setValue(control.value.slice(0, -1));
  }

  sanitizeDocumentNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    const maxLength = this.documentMaxLength();
    const documentNumber = this.documentType() === 'PASSPORT'
      ? input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, maxLength)
      : input.value.replace(/\D/g, '').slice(0, maxLength);
    input.value = documentNumber;
    this.loginForm.controls.documentNumber.setValue(documentNumber);
  }

  keepOnlyDigits(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 6);
    input.value = digits;
    this.loginForm.controls.digitalKey.setValue(digits);
  }

  submit(): void {
    this.submitted.set(true);
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    this.loginError.set('');
    const { documentNumber, digitalKey } = this.loginForm.getRawValue();
    this.session.authenticate({ documentType: this.documentType(), documentNumber, digitalKey }).pipe(
      take(1),
      finalize(() => this.isSubmitting.set(false)),
    ).subscribe({
      next: () => void this.router.navigateByUrl('/portal/inicio'),
      error: () => {
        this.loginForm.controls.digitalKey.setValue('');
        this.keypadDigits.set(this.shuffleDigits());
        this.loginError.set('No pudimos validar tus datos. Revisa tu documento y clave digital.');
      },
    });
  }

  startSecureLogin(): void {
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.session.beginSignIn('/portal/inicio');
  }

  private shuffleDigits(): string[] {
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    for (let index = digits.length - 1; index > 0; index -= 1) {
      const target = this.secureRandomIndex(index + 1);
      [digits[index], digits[target]] = [digits[target], digits[index]];
    }
    return digits;
  }

  private documentPattern(documentType: LoginDocumentType): RegExp {
    return documentType === 'DNI' ? /^\d{8}$/ : documentType === 'CE' ? /^\d{9}$/ : /^[A-Z0-9]{6,12}$/;
  }

  private secureRandomIndex(limit: number): number {
    const range = 0x1_0000_0000;
    const cutoff = Math.floor(range / limit) * limit;
    const randomValue = new Uint32Array(1);
    do {
      crypto.getRandomValues(randomValue);
    } while (randomValue[0] >= cutoff);
    return randomValue[0] % limit;
  }
}
