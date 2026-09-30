import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowDownToLine, LucideArrowRight, LucideBell, LucideChevronDown, LucideChevronRight, LucideMenu, LucideReceiptText, LucideSearch, LucideShoppingBag, LucideShoppingCart, LucideUtensils, LucideX, LucideZap } from '@lucide/angular';
import { LucideEye, LucideEyeOff } from '@lucide/angular';
import { LucideCreditCard, LucideWallet } from '@lucide/angular';
import { Account, Transaction } from '../../../../core/domain/banking.models';

@Component({
  selector: 'app-portal-header',
  imports: [RouterLink, LucideBell, LucideChevronDown, LucideMenu, LucideSearch, LucideX],
  template: `
    <header class="portal-header">
      <a class="portal-brand" routerLink="/portal/inicio" aria-label="Azzu, inicio"><img src="/azzu-logo.svg" alt="Azzu"></a>
      <button class="mobile-menu" type="button" (click)="menuRequested.emit()" [attr.aria-expanded]="menuOpen()" aria-label="Abrir navegación">
        @if (menuOpen()) { <svg lucideX [size]="20"></svg> } @else { <svg lucideMenu [size]="20"></svg> }
      </button>
      <nav [class.open]="menuOpen()" aria-label="Navegación de banca">
        @for (item of items; track item.route) {
          <button type="button" [class.active]="activeRoute() === item.route" [attr.aria-current]="activeRoute() === item.route ? 'page' : null" (click)="navigate.emit(item.route)">{{ item.label }}</button>
        }
      </nav>
      <div class="portal-header__tools">
        <button type="button" aria-label="Buscar" (click)="searchRequested.emit()"><svg lucideSearch [size]="18"></svg></button>
        <button type="button" class="bell" aria-label="Notificaciones" (click)="notificationRequested.emit()"><svg lucideBell [size]="18"></svg>@if(unreadNotifications()){<span></span>}</button>
        <i aria-hidden="true"></i>
        <button class="profile" type="button" (click)="profileRequested.emit()" [attr.aria-expanded]="profileOpen()">
          <span class="avatar" aria-hidden="true">M</span><b>{{ customerName() }}</b><svg lucideChevronDown [size]="16"></svg>
        </button>
      </div>
    </header>
  `,
  styles: [`
    :host{display:block}.portal-header{align-items:center;background:#fff;border-bottom:1px solid #e6e9ee;display:flex;height:68px;padding:0 max(22px,calc((100% - 1420px)/2));position:relative;z-index:4}.portal-brand{display:flex;flex:0 0 auto;margin-right:38px}.portal-brand img{display:block;height:24px;width:auto}nav{display:flex;gap:8px}nav button{background:transparent;border:0;border-radius:9px;color:#11183f;cursor:pointer;font-size:14px;font-weight:600;padding:9px 13px}nav button:hover,nav button.active{background:#eaf6ad}.portal-header__tools{align-items:center;display:flex;gap:10px;margin-left:auto}.portal-header__tools>button{align-items:center;background:transparent;border:0;color:#11183f;cursor:pointer;display:inline-flex;justify-content:center;padding:7px;position:relative}.portal-header__tools>i{background:#e2e6ec;height:22px;margin:0 2px;width:1px}.bell span{background:#6338ee;border:2px solid #fff;border-radius:50%;height:7px;position:absolute;right:5px;top:4px;width:7px}.profile{gap:8px;padding-right:0!important}.profile b{font-size:14px;font-weight:650}.avatar{align-items:center;background:#eaf6ad;border-radius:50%;color:#11183f;display:inline-flex;font-size:13px;font-weight:700;height:32px;justify-content:center;width:32px}.mobile-menu{display:none}@media(max-width:880px){.portal-brand{margin-right:22px}nav{background:#fff;border:1px solid #e5e8ee;border-radius:12px;box-shadow:0 8px 22px rgba(16,24,40,.06);display:none;left:18px;padding:8px;position:absolute;right:18px;top:58px}nav.open{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}nav button{text-align:left}.mobile-menu{align-items:center;background:transparent;border:0;color:#11183f;cursor:pointer;display:inline-flex;margin-left:auto;padding:8px}.portal-header__tools{margin-left:12px}.portal-header__tools>button:first-child,.portal-header__tools>i{display:none}}@media(max-width:520px){.portal-header{height:62px;padding:0 18px}.portal-brand img{height:21px}.portal-header__tools{gap:2px}.profile b,.profile svg{display:none}.portal-header__tools .bell{display:inline-flex}.avatar{height:29px;width:29px}}
  `],
})
export class HeaderComponent {
  readonly customerName = input.required<string>();
  readonly activeRoute = input('inicio');
  readonly menuOpen = input(false);
  readonly profileOpen = input(false);
  readonly unreadNotifications = input(true);
  readonly navigate = output<string>();
  readonly menuRequested = output<void>();
  readonly profileRequested = output<void>();
  readonly notificationRequested = output<void>();
  readonly searchRequested = output<void>();
  protected readonly items = [
    { label: 'Inicio', route: 'inicio' },
    { label: 'Operaciones', route: 'operaciones' },
    { label: 'Productos', route: 'productos' },
    { label: 'Finanzas', route: 'finanzas' },
    { label: 'Beneficios', route: 'beneficios' },
  ];
}

@Component({
  selector: 'app-section-header',
  imports: [LucideChevronRight],
  template: `<div class="section-header"><h2>{{ title() }}</h2><button type="button" (click)="requested.emit()">{{ actionLabel() }} <svg lucideChevronRight [size]="15"></svg></button></div>`,
  styles: [`.section-header{align-items:center;display:flex;justify-content:space-between;margin-bottom:11px}.section-header h2{color:#11183f;font-size:18px;font-weight:700;letter-spacing:-.2px;margin:0}.section-header button{align-items:center;background:transparent;border:0;color:#6338ee;cursor:pointer;display:inline-flex;font-size:13px;font-weight:650;gap:2px;padding:2px 0}`],
})
export class SectionHeaderComponent {
  readonly title = input.required<string>();
  readonly actionLabel = input('Ver todos');
  readonly requested = output<void>();
}

@Component({
  selector: 'app-monthly-summary',
  imports: [LucideChevronRight],
  template: `
    <section class="monthly-summary" aria-label="Gasto del mes">
      <div><small>Gasto del mes</small><strong>S/ 1,240.50</strong><span>↓ 8% <em>vs. mes anterior</em></span></div>
      <i aria-hidden="true"></i><div class="illustration-space" aria-hidden="true"><img [src]="imageSrc()" alt=""></div>
      <button type="button" (click)="analysisRequested.emit()">Ver análisis <svg lucideChevronRight [size]="16"></svg></button>
    </section>
  `,
  styles: [`.monthly-summary{align-items:center;background:#6338ee;border-radius:12px;display:grid;gap:17px;grid-template-columns:auto 1px minmax(120px,1fr) auto;justify-self:end;min-height:100px;overflow:hidden;padding:12px 18px 12px 28px;position:relative;width:92%}.monthly-summary>div:first-child{display:grid;gap:5px;position:relative;z-index:1}.monthly-summary small{color:rgba(255,255,255,.8);font-size:13px}.monthly-summary strong{color:#fff;font-size:25px;letter-spacing:-.75px}.monthly-summary span{color:#fff;font-size:13px;font-weight:700}.monthly-summary em{color:rgba(255,255,255,.72);font-style:normal;font-weight:500}.monthly-summary>i{background:rgba(255,255,255,.42);height:72px;position:relative;width:1px;z-index:1}.monthly-summary .illustration-space{align-self:center;display:flex;grid-column:3;grid-row:1;height:142px;justify-content:center;position:absolute;transform:translateX(-64px);width:100%;z-index:0}.monthly-summary .illustration-space img{height:100%;max-width:220px;object-fit:contain;width:100%}.monthly-summary button{align-items:center;background:#b6db00;border:0;border-radius:10px;color:#11183f;cursor:pointer;display:inline-flex;font-size:14px;font-weight:700;gap:4px;grid-column:4;justify-content:center;padding:12px 15px;position:relative;white-space:nowrap;z-index:1}@media(max-width:1050px){.monthly-summary{justify-self:stretch;width:100%}}@media(max-width:700px){.monthly-summary{grid-template-columns:auto 1fr auto}.monthly-summary>i{display:none}.monthly-summary .illustration-space{display:none}.monthly-summary button{grid-column:auto}}@media(max-width:440px){.monthly-summary{padding:17px}.monthly-summary strong{font-size:21px}.monthly-summary button{font-size:13px;padding:10px}}`],
})
export class MonthlySummaryComponent {
  readonly imageSrc = input.required<string>();
  readonly analysisRequested = output<void>();
}

@Component({
  selector: 'app-quick-action-card',
  imports: [LucideArrowRight],
  template: `<button class="quick-action" type="button" [class.service-action]="title() === 'Pagar servicios'" (click)="requested.emit()"><span><b>{{ title() }}</b><small>{{ description() }}</small><i><svg lucideArrowRight [size]="20" aria-hidden="true"></svg></i></span><div class="illustration-space" aria-hidden="true"><img [src]="imageSrc()" alt=""></div></button>`,
  styles: [`.quick-action{align-items:center;background:#fff;border:1px solid #e5e8ee;border-radius:12px;color:#11183f;cursor:pointer;display:flex;gap:10px;height:120px;justify-content:space-between;overflow:hidden;padding:16px;position:relative;text-align:left;transition:border-color .16s ease;width:100%}.quick-action:hover{border-color:#c9d3a1}.quick-action:focus-visible{outline:3px solid rgba(99,56,238,.22);outline-offset:2px}.quick-action span{align-self:stretch;display:grid;flex:1;grid-template-rows:22px 1fr 18px;margin-right:168px;min-width:0;position:relative;z-index:1}.quick-action b{align-self:start;font-size:15px;font-weight:700;line-height:1.3}.quick-action small{align-self:start;color:#687291;font-size:14px;line-height:1.4;padding-top:4px}.quick-action i{align-items:center;color:#6338ee;display:flex;font-style:normal;line-height:1}.quick-action i svg{stroke-width:2.75}.quick-action .illustration-space{align-items:center;bottom:6px;display:flex;justify-content:center;position:absolute;right:4px;top:6px;width:158px}.quick-action .illustration-space img{height:100%;object-fit:contain;transform:scale(1.1);width:100%}.quick-action:not(.service-action) .illustration-space img{transform:translateY(3px) scale(1.1)}@media(max-width:560px){.quick-action{height:120px;padding:16px}.quick-action span{grid-template-rows:22px 1fr 18px;margin-right:148px}.quick-action .illustration-space{bottom:6px;top:6px;width:138px}}`],
})
export class QuickActionCardComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly imageSrc = input.required<string>();
  readonly requested = output<void>();
}

@Component({
  selector: 'app-goal-card',
  template: `
    <article class="goal-card"><div class="goal-progress" role="img" aria-label="68 por ciento completado"><svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="29"/><circle class="filled" cx="36" cy="36" r="29"/></svg><b>68%</b></div><div><strong>Viaje a Europa</strong><p><b>S/ 6,800</b> de S/ 10,000</p><span><i></i></span><small>Faltan S/ 3,200</small></div></article>
  `,
  styles: [`.goal-card{align-items:center;background:#fff;border:1px solid #e5e8ee;border-radius:11px;display:grid;gap:15px;grid-template-columns:78px 1fr;min-height:120px;padding:16px}.goal-progress{height:72px;position:relative;width:72px}.goal-progress svg{height:72px;transform:rotate(-90deg);width:72px}.goal-progress circle{fill:none;stroke:#edf0f3;stroke-width:7}.goal-progress .filled{stroke:#b6db00;stroke-dasharray:182.2;stroke-dashoffset:58.3;stroke-linecap:round}.goal-progress b{color:#11183f;font-size:16px;left:50%;position:absolute;top:50%;transform:translate(-50%,-50%)}.goal-card>div:last-child{display:grid;gap:7px;min-width:0}.goal-card strong{font-size:14px}.goal-card p{color:#687291;font-size:13px;margin:0}.goal-card p b{color:#687291;font-weight:650}.goal-card span{background:#edf0f3;border-radius:99px;height:8px;overflow:hidden}.goal-card span i{background:#b6db00;border-radius:inherit;display:block;height:100%;width:68%}.goal-card small{color:#687291;font-size:13px}`],
})
export class GoalCardComponent {}

@Component({
  selector: 'app-benefits-card',
  template: `<button class="benefits-card" type="button" (click)="requested.emit()"><img class="benefits-card__background" [src]="imageSrc()" alt="" aria-hidden="true"><span><b>Disfruta más,<br>Ahorra más</b><small>Conoce más</small></span></button>`,
  styles: [`.benefits-card{background:#f4f7ef;border:0;border-radius:11px;color:#11183f;cursor:pointer;height:120px;isolation:isolate;overflow:hidden;padding:16px 20px;position:relative;text-align:left;width:100%}.benefits-card__background{height:100%;inset:0;object-fit:cover;position:absolute;width:100%;z-index:-1}.benefits-card:before{background:linear-gradient(to bottom right,rgba(255,255,255,.88),rgba(255,255,255,.5) 50%,rgba(255,255,255,.08) 88%);content:"";inset:0;position:absolute;z-index:0}.benefits-card span{display:grid;gap:8px;position:relative;z-index:1}.benefits-card b{font-size:18px;line-height:1.2}.benefits-card small{align-items:center;background:#b6db00;border-radius:99px;color:#11183f;display:inline-flex;font-size:12px;font-weight:700;padding:8px 14px;width:max-content}`],
})
export class BenefitsCardComponent {
  readonly imageSrc = input.required<string>();
  readonly requested = output<void>();
}

@Component({
  selector: 'app-product-row',
  imports: [CurrencyPipe, LucideChevronRight, LucideCreditCard, LucideWallet],
  template: `
    <button class="product-row" type="button" (click)="requested.emit(product().id)">
      <span class="product-icon-placeholder" aria-hidden="true">@if (product().type === 'Tarjeta') { <svg lucideCreditCard [size]="22"></svg> } @else if (product().type === 'Cuenta ahorros') { <i class="streamline-finance finance-alcancia"></i> } @else { <svg lucideWallet [size]="22"></svg> }</span>
      <span class="product-copy"><b>{{ product().name }}</b><small>{{ product().lastDigits }}</small></span>
      <span class="product-balance"><b>{{ balanceHidden() ? 'S/ ••••••' : (product().available | currency:'PEN':'S/ ':'1.2-2') }}</b><small>{{ product().id === 'card-1' ? 'Disponible' : 'Saldo disponible' }}</small></span>
      <svg lucideChevronRight [size]="17" aria-hidden="true"></svg>
    </button>
  `,
  styles: [`:host{display:block;flex:1 1 0;min-height:58px}.product-row{align-items:center;background:transparent;border:0;color:#11183f;cursor:pointer;display:grid;gap:10px;grid-template-columns:42px minmax(0,1fr) auto 18px;height:100%;padding:8px 0;text-align:left;width:100%}.product-row+.product-row{border-top:1px solid #edf0f3}.product-icon-placeholder{align-items:center;background:transparent;color:#11183f;display:flex;height:42px;justify-content:center;width:42px}.product-icon-placeholder .streamline-finance{height:22px;width:22px}.product-copy,.product-balance{display:grid;gap:4px;min-width:0}.product-copy b,.product-balance b{font-size:14px;font-weight:700}.product-copy small,.product-balance small{color:#687291;font-size:13px}.product-balance{text-align:right}.product-row>svg{color:#687291}@media(max-width:520px){.product-row{grid-template-columns:38px minmax(0,1fr) 16px}.product-icon-placeholder{height:38px;width:38px}.product-balance{grid-column:2;text-align:left}.product-row>svg{grid-column:3;grid-row:1 / span 2}}`],
})
export class ProductRowComponent {
  readonly product = input.required<Account>();
  readonly balanceHidden = input(false);
  readonly requested = output<string>();
}

@Component({
  selector: 'app-products-card',
  imports: [LucideEye, LucideEyeOff, ProductRowComponent],
  template: `<article class="products-card"><div class="products-card__rows">@for (product of products().slice(0, 4); track product.id) { <app-product-row [product]="product" [balanceHidden]="balancesHidden()" (requested)="requested.emit($event)" /> }</div><button class="balance-toggle" type="button" [attr.aria-pressed]="balancesHidden()" [attr.aria-label]="balancesHidden() ? 'Mostrar saldos' : 'Ocultar saldos'" (click)="balanceVisibilityToggle.emit()">@if (balancesHidden()) { <svg lucideEye [size]="17" aria-hidden="true"></svg><span>Mostrar saldos</span> } @else { <svg lucideEyeOff [size]="17" aria-hidden="true"></svg><span>Ocultar saldos</span> }</button></article>`,
  styles: [`.products-card{background:#fff;border:1px solid #e5e8ee;border-radius:11px;display:flex;flex-direction:column;height:100%;min-height:0;padding:4px 15px 8px}.products-card__rows{display:flex;flex:1;flex-direction:column;min-height:0}.products-card__rows app-product-row{display:block;flex:1 1 0;min-height:58px}.balance-toggle{align-items:center;align-self:flex-end;background:transparent;border:0;color:#6338ee;cursor:pointer;display:inline-flex;font-size:12px;font-weight:650;gap:8px;padding:10px}.balance-toggle:focus-visible{outline:3px solid rgba(99,56,238,.22);outline-offset:2px}`],
})
export class ProductsCardComponent {
  readonly products = input.required<readonly Account[]>();
  readonly balancesHidden = input(false);
  readonly requested = output<string>();
  readonly balanceVisibilityToggle = output<void>();
}

@Component({
  selector: 'app-transaction-row',
  imports: [CurrencyPipe, LucideArrowDownToLine, LucideReceiptText, LucideShoppingBag, LucideShoppingCart, LucideUtensils, LucideZap],
  template: `<article class="transaction-row"><span class="transaction-icon" [class.income]="transaction().category === 'income'" aria-hidden="true">@if(transaction().category === 'income'){<svg lucideArrowDownToLine [size]="17"></svg>}@else if(transaction().counterparty === 'Mercado Norte'){<svg lucideShoppingCart [size]="17"></svg>}@else if(transaction().counterparty === 'La Trattoria'){<svg lucideUtensils [size]="17"></svg>}@else if(transaction().counterparty === 'Pago de luz'){<svg lucideZap [size]="17"></svg>}@else if(transaction().counterparty === 'Falabella'){<svg lucideShoppingBag [size]="17"></svg>}@else{<svg lucideReceiptText [size]="17"></svg>}</span><div><b>{{ transaction().counterparty }}</b><small>{{ transaction().detail }} · {{ transaction().date }}</small></div><strong [class.income]="transaction().category === 'income'">@if (transaction().category === 'income') { + {{ transaction().amount | currency:'PEN':'S/ ':'1.2-2' }} } @else { - {{ -transaction().amount | currency:'PEN':'S/ ':'1.2-2' }} }</strong></article>`,
  styles: [`:host{display:block}.transaction-row{align-items:center;display:grid;gap:10px;grid-template-columns:42px minmax(0,1fr) auto;height:100%;padding:8px 0}.transaction-row+.transaction-row{border-top:1px solid #edf0f3}.transaction-icon{align-items:center;background:transparent;border-radius:0;color:#11183f;display:flex;height:42px;justify-content:center;width:42px}.transaction-icon.income{background:transparent;color:#11183f}.transaction-icon svg{height:22px;width:22px;stroke-width:2}.transaction-row div{display:grid;gap:4px;min-width:0}.transaction-row b{font-size:13px}.transaction-row small{color:#687291;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.transaction-row strong{color:#11183f;font-size:14px;white-space:nowrap}.transaction-row strong.income{color:#11183f}`],
})
export class TransactionRowComponent { readonly transaction = input.required<Transaction>(); }

@Component({
  selector: 'app-transactions-card',
  imports: [TransactionRowComponent],
  template: `<article class="transactions-card">@for (transaction of transactions(); track transaction.id) { <app-transaction-row [transaction]="transaction" /> }</article>`,
  styles: [`:host{display:block;height:100%}.transactions-card{background:#fff;border:1px solid #e5e8ee;border-radius:11px;display:flex;flex-direction:column;height:100%;min-height:0;padding:4px 15px 8px}.transactions-card app-transaction-row{display:block;flex:1;min-height:60px}`],
})
export class TransactionsCardComponent { readonly transactions = input.required<readonly Transaction[]>(); }
