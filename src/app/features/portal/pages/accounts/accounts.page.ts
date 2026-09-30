import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { BankingFacade } from '../../../../core/application/banking.facade';
import { PORTAL_PAGE_STYLES } from '../../shared/portal-page.styles';

@Component({
  selector: 'app-accounts-page',
  imports: [CurrencyPipe],
  template: `<main class="page"><p class="eyebrow">CUENTAS</p><h1>Cuentas y productos</h1><p class="intro">Consulta tus saldos. En producción, cada detalle y movimiento se autorizará por cuenta desde la API.</p><section class="surface list">@for (account of accounts(); track account.id) {<button type="button" (click)="open(account.id)"><span><b>{{ account.name }}</b><small>{{ account.lastDigits }} · {{ account.type }}</small></span><span><b>{{ account.available | currency:'PEN':'S/ ':'1.2-2' }}</b><small>{{ account.id === 'card-1' ? 'Disponible' : 'Saldo disponible' }}</small></span></button>}</section></main>`,
  styles: [PORTAL_PAGE_STYLES],
})
export class AccountsPageComponent {
  private readonly banking = inject(BankingFacade);
  private readonly router = inject(Router);
  protected readonly accounts = toSignal(this.banking.getAccounts(), { initialValue: [] });
  protected open(accountId: string) { void this.router.navigateByUrl(accountId === 'card-1' ? '/portal/productos/tarjetas' : `/portal/productos/cuentas/${accountId}`); }
}
