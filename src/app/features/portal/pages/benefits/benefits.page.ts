import { Component } from '@angular/core';
import { PORTAL_PAGE_STYLES } from '../../shared/portal-page.styles';

@Component({
  selector: 'app-benefits-page',
  template: `<main class="page"><p class="eyebrow">BENEFICIOS</p><h1>Experiencias seleccionadas para ti.</h1><p class="intro">Los beneficios disponibles dependerán de tus productos, campañas vigentes y condiciones aplicables.</p><div class="grid"><article class="surface metric"><small>Beneficio destacado</small><strong>Próximamente</strong><span class="pill">Personalizado</span></article><article class="surface metric"><small>Experiencias</small><strong>Próximamente</strong><span class="pill">Azzu</span></article><article class="surface metric"><small>Condiciones</small><strong>Ver detalle</strong><span class="pill">Antes de usar</span></article></div></main>`,
  styles: [PORTAL_PAGE_STYLES],
})
export class BenefitsPageComponent {}
