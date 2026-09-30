import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PORTAL_PAGE_STYLES } from '../../shared/portal-page.styles';

@Component({
  selector: 'app-operations-page',
  template: `
    <main class="page"><p class="eyebrow">OPERACIONES</p><h1>Todo lo que necesitas para mover tu dinero.</h1><p class="intro">Elige la operación que quieres realizar. Antes de confirmar, siempre podrás revisar los datos.</p><div class="grid">
      <button class="action-card" type="button" (click)="go('operaciones/transferencias')"><b>Transferir dinero</b><span>Envía dinero a cuentas propias o de terceros.</span><i>→</i></button>
      <button class="action-card" type="button" (click)="go('operaciones/pagos')"><b>Pagar servicios</b><span>Paga luz, agua, celular y más.</span><i>→</i></button>
      <button class="action-card" type="button" (click)="go('operaciones/movimientos')"><b>Ver movimientos</b><span>Consulta ingresos, compras y pagos por cuenta.</span><i>→</i></button>
      <button class="action-card" type="button" (click)="go('tramites')"><b>Hacer un trámite</b><span>Solicita constancias, actualiza datos o registra una consulta.</span><i>→</i></button>
    </div></main>`,
  styles: [PORTAL_PAGE_STYLES],
})
export class OperationsPageComponent {
  private readonly router = inject(Router);
  protected go(route: string) { void this.router.navigateByUrl(`/portal/${route}`); }
}
