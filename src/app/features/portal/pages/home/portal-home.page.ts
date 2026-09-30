import { afterNextRender, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { Account, Transaction } from '../../../../core/domain/banking.models';
import { BankingFacade } from '../../../../core/application/banking.facade';
import { BenefitsCardComponent, GoalCardComponent, MonthlySummaryComponent, ProductsCardComponent, QuickActionCardComponent, SectionHeaderComponent, TransactionsCardComponent } from '../../shared/components/portal-ui.components';

@Component({
  selector: 'app-portal-home',
  imports: [BenefitsCardComponent, GoalCardComponent, LucideChevronLeft, LucideChevronRight, MonthlySummaryComponent, ProductsCardComponent, QuickActionCardComponent, SectionHeaderComponent, TransactionsCardComponent],
  template: `
    <section class="portal-home">
      <div class="portal-home__hero">
        <div class="greeting"><p>Última sesión: hoy, 10:24 a. m.</p><h1>Hola, {{ customerName() }}</h1><span>Aquí tienes el resumen de tus finanzas.</span></div>
        <app-monthly-summary imageSrc="/assets/illustrations/resumen_figura.webp" (analysisRequested)="navigate('finanzas')" />
      </div>
      <section class="quick-section" aria-labelledby="quick-title" (pointerenter)="pauseCarousel()" (pointerleave)="resumeCarousel()" (focusin)="pauseCarousel()" (focusout)="resumeCarousel()">
        <div class="quick-section__header"><h2 id="quick-title">¿Qué quieres hacer hoy?</h2><div class="quick-carousel__controls"><button type="button" aria-label="Ver acciones anteriores" (click)="moveCarousel(-1)"><svg lucideChevronLeft [size]="18"></svg></button><button type="button" aria-label="Ver más acciones" (click)="moveCarousel(1)"><svg lucideChevronRight [size]="18"></svg></button></div></div>
        <div #quickCarousel class="quick-carousel" role="region" aria-label="Acciones rápidas" (pointerdown)="pauseCarousel()" (pointerup)="resumeCarousel()" (pointercancel)="resumeCarousel()">
          <div class="quick-track">
            <div class="quick-slide"><app-quick-action-card title="Transferir" description="Envía dinero a tus cuentas o terceros." imageSrc="/assets/illustrations/transfer_figura.webp" (requested)="navigate('operaciones/transferencias')" /></div>
            <div class="quick-slide"><app-quick-action-card title="Pagar servicios" description="Paga luz, agua, celular y más." imageSrc="/assets/illustrations/servicios_figura.webp" (requested)="navigate('operaciones/pagos')" /></div>
            <div class="quick-slide"><app-quick-action-card title="Mis tarjetas" description="Consulta saldo y movimientos." imageSrc="/assets/illustrations/tarjetas_figura.webp" (requested)="navigate('productos/tarjetas')" /></div>
            <div class="quick-slide"><app-quick-action-card title="Solicitar préstamo" description="Explora opciones de financiamiento." imageSrc="/assets/illustrations/prestamo_figura.webp" (requested)="navigate('productos/prestamos')" /></div>
          </div>
        </div>
      </section>
      <section class="portal-home__columns">
        <div class="side-column">
          <section><app-section-header title="Mi meta" actionLabel="Ver todas" (requested)="navigate('finanzas')" /><app-goal-card /></section>
          <section><app-section-header title="Beneficios para ti" actionLabel="Ver todos" (requested)="navigate('beneficios')" /><app-benefits-card imageSrc="/assets/illustrations/Beneficios_foto.webp" (requested)="navigate('beneficios')" /></section>
        </div>
        <section><app-section-header title="Cuentas y productos" actionLabel="Ver todos" (requested)="navigate('productos')" /><app-products-card [products]="accounts()" [balancesHidden]="balancesHidden()" (balanceVisibilityToggle)="toggleBalanceVisibility()" (requested)="openProduct($event)" /></section>
        <section><app-section-header title="Últimos movimientos" actionLabel="Ver todos" (requested)="navigate('operaciones/movimientos')" /><app-transactions-card [transactions]="transactions().slice(0, 4)" /></section>
      </section>
    </section>
  `,
  styles: [`
    :host{display:block}.portal-home{margin:0 auto;max-width:1420px;padding:28px 22px 56px}.portal-home__hero{align-items:center;display:grid;gap:30px;grid-template-columns:minmax(0,.96fr) minmax(420px,1.04fr);margin-bottom:26px}.greeting p{color:#687291;font-size:13px;margin:0 0 13px}.greeting h1{color:#11183f;font-size:34px;letter-spacing:-1px;line-height:1.05;margin:0 0 9px}.greeting span{color:#687291;font-size:16px}.quick-section__header{align-items:center;display:flex;justify-content:space-between;margin-bottom:13px}.quick-section__header h2{color:#11183f;font-size:20px;letter-spacing:-.35px;margin:0}.quick-carousel__controls{display:flex;gap:8px}.quick-carousel__controls button{align-items:center;background:#fff;border:1px solid #e5e8ee;border-radius:50%;color:#11183f;cursor:pointer;display:inline-flex;height:36px;justify-content:center;padding:0;width:36px}.quick-carousel__controls button:hover{background:#eaf6ad;border-color:#eaf6ad}.quick-carousel__controls button:focus-visible{outline:3px solid rgba(99,56,238,.22);outline-offset:2px}.quick-carousel__controls svg{stroke-width:2.75}.quick-carousel{overflow-x:auto;scrollbar-width:none;scroll-snap-type:x mandatory;scroll-behavior:smooth;width:100%}.quick-carousel::-webkit-scrollbar{display:none}.quick-track{display:flex;gap:19px}.quick-slide{flex:0 0 calc((100% - 38px)/3);min-width:0;scroll-snap-align:start;scroll-snap-stop:always}.quick-slide app-quick-action-card{display:block}.portal-home__columns{align-items:stretch;display:grid;gap:19px;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:24px}.side-column{display:grid;gap:18px}.portal-home__columns>section,.side-column>section{display:flex;flex-direction:column;min-width:0}.side-column>section{min-height:152px}app-products-card,app-transactions-card{display:block;flex:1;min-height:0}@media(max-width:1050px){.portal-home__hero{grid-template-columns:1fr}.quick-slide{flex-basis:calc((100% - 19px)/2)}.portal-home__columns{grid-template-columns:repeat(2,minmax(0,1fr))}.portal-home__columns>section:last-child{grid-column:span 2}}@media(max-width:620px){.portal-home{padding:23px 18px 40px}.portal-home__hero{gap:20px;margin-bottom:22px}.greeting h1{font-size:30px}.quick-track{gap:12px}.quick-slide{flex-basis:100%}.portal-home__columns{gap:20px;grid-template-columns:1fr;margin-top:22px}.portal-home__columns>section:last-child{grid-column:auto}.side-column{gap:20px}}`],
})
export class PortalHomePageComponent {
  private readonly banking = inject(BankingFacade);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly quickCarousel = viewChild<ElementRef<HTMLDivElement>>('quickCarousel');
  private autoplayTimer: ReturnType<typeof setInterval> | undefined;
  private carouselPaused = false;
  readonly customerName = toSignal(this.banking.getCustomerName(), { initialValue: '' });
  readonly accounts = toSignal(this.banking.getAccounts(), { initialValue: [] as readonly Account[] });
  readonly transactions = toSignal(this.banking.getRecentTransactions(), { initialValue: [] as readonly Transaction[] });
  readonly balancesHidden = signal(false);
  constructor() {
    afterNextRender(() => this.resumeCarousel());
    this.destroyRef.onDestroy(() => this.pauseCarousel());
  }
  protected pauseCarousel() {
    this.carouselPaused = true;
    this.clearCarouselTimer();
  }
  protected resumeCarousel() {
    this.carouselPaused = false;
    this.scheduleCarousel();
  }
  protected moveCarousel(direction: -1 | 1) {
    this.scrollCarousel(direction);
    this.scheduleCarousel();
  }
  private scheduleCarousel() {
    this.clearCarouselTimer();
    if (!this.carouselPaused) {
      this.autoplayTimer = setInterval(() => this.scrollCarousel(1), 5000);
    }
  }
  private clearCarouselTimer() {
    if (this.autoplayTimer !== undefined) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = undefined;
    }
  }
  private scrollCarousel(direction: -1 | 1) {
    const viewport = this.quickCarousel()?.nativeElement;
    const track = viewport?.firstElementChild as HTMLElement | null;
    const firstSlide = track?.firstElementChild as HTMLElement | null;
    if (!viewport || !track || !firstSlide) return;
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    const step = firstSlide.getBoundingClientRect().width + gap;
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const currentIndex = Math.round(viewport.scrollLeft / step);
    const lastIndex = Math.round(maxScroll / step);
    const targetIndex = direction > 0
      ? (currentIndex >= lastIndex ? 0 : currentIndex + 1)
      : (currentIndex <= 0 ? lastIndex : currentIndex - 1);
    viewport.scrollTo({ left: Math.min(targetIndex * step, maxScroll), behavior: 'smooth' });
  }
  protected navigate(route: string) { void this.router.navigateByUrl(`/portal/${route}`); }
  protected openProduct(productId: string) {
    this.navigate(productId === 'card-1' ? 'productos/tarjetas' : `productos/cuentas/${productId}`);
  }
  protected toggleBalanceVisibility() { this.balancesHidden.update((hidden) => !hidden); }
}
