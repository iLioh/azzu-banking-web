import { FormControl } from '@angular/forms';
import { asMoney, positiveMoneyValidator } from './banking-form.utils';

describe('banking form utilities', () => {
  it('normalizes comma decimals', () => {
    expect(asMoney('125,40')).toBe(125.4);
  });

  it('accepts a positive amount with two decimals', () => {
    expect(positiveMoneyValidator(new FormControl('250.75'))).toBeNull();
  });

  it('rejects zero, negative and malformed amounts', () => {
    expect(positiveMoneyValidator(new FormControl('0'))).toEqual({ positiveMoney: true });
    expect(positiveMoneyValidator(new FormControl('-10'))).toEqual({ moneyFormat: true });
    expect(positiveMoneyValidator(new FormControl('10.999'))).toEqual({ moneyFormat: true });
  });
});
