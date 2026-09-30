import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PORTAL_PAGE_STYLES } from '../../shared/portal-page.styles';

@Component({
  selector: 'app-products-page',
  template: `<main class="page"><p class="eyebrow">PRODUCTOS</p><h1>Administra tus productos Azzu.</h1><p class="intro">Consulta tus cuentas, controla tus tarjetas y revisa alternativas de financiamiento.</p><div class="grid"><button class="action-card" type="button" (click)="go('productos/cuentas')"><b>Cuentas y saldos</b><span>Consulta información, movimientos y estados de cuenta.</span><i>→</i></button><button class="action-card" type="button" (click)="go('productos/tarjetas')"><b>Mis tarjetas</b><span>Configura límites, pagos online y bloqueos temporales.</span><i>→</i></button><button class="action-card" type="button" (click)="go('productos/prestamos')"><b>Préstamos</b><span>Simula cuotas y conoce las condiciones antes de solicitar.</span><i>→</i></button></div></main>`,
  styles: [PORTAL_PAGE_STYLES],
})
export class ProductsPageComponent {
  private readonly router = inject(Router);
  protected go(route: string) { void this.router.navigateByUrl(`/portal/${route}`); }
}
