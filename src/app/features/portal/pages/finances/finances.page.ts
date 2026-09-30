import { Component } from '@angular/core';
import { PORTAL_PAGE_STYLES } from '../../shared/portal-page.styles';

@Component({
  selector: 'app-finances-page',
  template: `<main class="page"><p class="eyebrow">FINANZAS</p><h1>Una mirada clara a tu dinero.</h1><p class="intro">Esta vista reunirá categorías, tendencias y metas una vez que los movimientos provengan de la API.</p><div class="metric-grid"><article class="surface metric"><small>Gasto del mes</small><strong>S/ 1,240.50</strong><span class="pill">↓ 8% vs. mes anterior</span></article><article class="surface metric"><small>Meta principal</small><strong>68%</strong><span class="pill">Viaje a Europa</span></article><article class="surface metric"><small>Próximo paso</small><strong>Revisar gastos</strong><span class="pill">Pronto</span></article></div></main>`,
  styles: [PORTAL_PAGE_STYLES],
})
export class FinancesPageComponent {}
