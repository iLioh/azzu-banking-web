import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BankingFacade } from '../../../../core/application/banking.facade';
import { TransactionRowComponent } from '../../shared/components/portal-ui.components';
import { PORTAL_PAGE_STYLES } from '../../shared/portal-page.styles';

type MovementFilter = 'all' | 'income' | 'expense';

@Component({
  selector: 'app-movements-page',
  imports: [TransactionRowComponent],
  template: `<main class="page"><p class="eyebrow">MOVIMIENTOS</p><h1>Historial de movimientos.</h1><p class="intro">Revisa tus ingresos y consumos. Los filtros de fecha y descarga se conectarán al servicio de movimientos.</p><section class="surface movements"><header><div role="group" aria-label="Filtrar movimientos"><button type="button" [class.active]="filter() === 'all'" (click)="filter.set('all')">Todos</button><button type="button" [class.active]="filter() === 'income'" (click)="filter.set('income')">Ingresos</button><button type="button" [class.active]="filter() === 'expense'" (click)="filter.set('expense')">Gastos</button></div><label>Cuenta<select [value]="accountFilter()" (change)="setAccountFilter($event)"><option value="all">Todas mis cuentas</option><option value="checking-1">Cuenta Sueldo · 4821</option><option value="savings-1">Cuenta Ahorros · 1763</option></select></label></header><div class="movement-list">@for(transaction of filteredTransactions(); track transaction.id){<app-transaction-row [transaction]="transaction"/>}@empty{<p>No hay movimientos para este filtro.</p>}</div></section></main>`,
  styles: [PORTAL_PAGE_STYLES, `.movements{overflow:hidden}.movements>header{align-items:center;border-bottom:1px solid #edf0f3;display:flex;gap:16px;justify-content:space-between;padding:14px 17px}.movements header div{display:flex;gap:7px}.movements header button{background:transparent;border:1px solid #e1e5ea;border-radius:8px;color:#687291;cursor:pointer;font-size:11px;padding:8px 11px}.movements header button.active{background:#eaf6ad;border-color:#eaf6ad;color:#11183f;font-weight:700}.movements header label{align-items:center;color:#687291;display:flex;font-size:10px;gap:8px}.movements select{border:1px solid #e1e5ea;border-radius:8px;color:#11183f;padding:8px}.movement-list{padding:0 17px}.movement-list>p{color:#687291;font-size:12px;padding:25px;text-align:center}@media(max-width:620px){.movements>header{align-items:stretch;flex-direction:column}.movements header label{align-items:stretch;flex-direction:column}}`],
})
export class MovementsPageComponent {
  private readonly banking = inject(BankingFacade);
  protected readonly transactions = toSignal(this.banking.getRecentTransactions(), { initialValue: [] });
  protected readonly filter = signal<MovementFilter>('all');
  protected readonly accountFilter = signal('all');
  protected readonly filteredTransactions = computed(() => this.transactions().filter((transaction) => (this.filter() === 'all' || transaction.category === this.filter()) && (this.accountFilter() === 'all' || transaction.accountId === this.accountFilter())));
  protected setAccountFilter(event: Event) { this.accountFilter.set((event.target as HTMLSelectElement).value); }
}
