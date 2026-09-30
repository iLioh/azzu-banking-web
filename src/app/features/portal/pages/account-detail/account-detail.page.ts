import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideArrowLeft, LucideDownload, LucideSend } from '@lucide/angular';
import { BankingFacade } from '../../../../core/application/banking.facade';
import { TransactionsCardComponent } from '../../shared/components/portal-ui.components';
import { PORTAL_PAGE_STYLES } from '../../shared/portal-page.styles';

@Component({
  selector: 'app-account-detail-page',
  imports: [CurrencyPipe, LucideArrowLeft, LucideDownload, LucideSend, TransactionsCardComponent],
  template: `<main class="page"><button class="back" type="button" (click)="goBack()"><svg lucideArrowLeft [size]="17"></svg> Volver a cuentas</button>@if(account(); as current){<p class="eyebrow">{{ current.type }}</p><h1>{{ current.name }}</h1><p class="intro">{{ current.lastDigits }}</p><section class="account-summary"><article><small>Saldo disponible</small><strong>{{ current.available | currency:'PEN':'S/ ':'1.2-2' }}</strong><span>Saldo contable: {{ current.balance | currency:'PEN':'S/ ':'1.2-2' }}</span></article><div><button class="primary" type="button" (click)="transfer()"><svg lucideSend [size]="17"></svg> Transferir</button><button class="secondary" type="button" (click)="requestStatement()"><svg lucideDownload [size]="17"></svg> Estado de cuenta</button></div></section>@if(statementMessage()){<p class="status">{{ statementMessage() }}</p>}<div class="section-title"><h2>Movimientos recientes</h2><button type="button" (click)="allMovements()">Ver todos</button></div><app-transactions-card [transactions]="transactions()"/>} @else {<section class="surface missing"><h1>Cuenta no encontrada</h1><p>La cuenta solicitada no está disponible para esta sesión.</p></section>}</main>`,
  styles: [PORTAL_PAGE_STYLES, `.back{align-items:center;background:transparent;border:0;color:#6338ee;cursor:pointer;display:flex;font-size:11px;font-weight:700;gap:5px;margin-bottom:20px;padding:0}.account-summary{align-items:center;background:#11183f;border-radius:14px;color:#fff;display:flex;justify-content:space-between;margin:20px 0 26px;padding:25px}.account-summary article{display:grid;gap:7px}.account-summary small,.account-summary span{color:#cbd0de;font-size:11px}.account-summary strong{font-size:30px}.account-summary>div{display:flex;gap:9px}.account-summary .primary,.account-summary .secondary{align-items:center;display:flex;gap:6px}.section-title{align-items:center;display:flex;justify-content:space-between;margin-bottom:10px}.section-title h2{font-size:17px;margin:0}.section-title button{background:transparent;border:0;color:#6338ee;cursor:pointer;font-size:11px;font-weight:700}.missing{padding:30px}.missing p{color:#687291}@media(max-width:680px){.account-summary{align-items:stretch;flex-direction:column;gap:20px}.account-summary>div{flex-direction:column}}`],
})
export class AccountDetailPageComponent {
  private readonly banking = inject(BankingFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly accounts = toSignal(this.banking.getAccounts(), { initialValue: [] });
  private readonly allTransactions = toSignal(this.banking.getRecentTransactions(), { initialValue: [] });
  protected readonly statementMessage = signal('');
  protected readonly account = computed(() => this.accounts().find((account) => account.id === this.route.snapshot.paramMap.get('accountId')));
  protected readonly transactions = computed(() => this.allTransactions().filter((transaction) => transaction.accountId === this.route.snapshot.paramMap.get('accountId')));
  protected goBack() { void this.router.navigateByUrl('/portal/productos/cuentas'); }
  protected transfer() { void this.router.navigateByUrl('/portal/operaciones/transferencias'); }
  protected allMovements() { void this.router.navigateByUrl('/portal/operaciones/movimientos'); }
  protected requestStatement() { this.statementMessage.set('La descarga quedará disponible cuando el servicio de estados de cuenta esté conectado.'); }
}
