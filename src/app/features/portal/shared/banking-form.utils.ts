import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const asMoney = (value: string) => Number(value.replace(',', '.'));

export const positiveMoneyValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const raw = String(control.value ?? '').trim();
  if (!raw) return null;
  if (!/^\d{1,9}(?:[.,]\d{1,2})?$/.test(raw)) return { moneyFormat: true };
  return asMoney(raw) > 0 ? null : { positiveMoney: true };
};
