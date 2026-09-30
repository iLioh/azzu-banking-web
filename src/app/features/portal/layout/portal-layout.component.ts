import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideArrowDownToLine, LucideBellRing, LucideCheckCheck, LucideChevronRight, LucideCreditCard, LucideLogOut, LucideSearch, LucideShieldCheck, LucideUserRound } from '@lucide/angular';
import { take } from 'rxjs';
import { BankingFacade } from '../../../core/application/banking.facade';
import { SessionService } from '../../../core/auth/session.service';
import { SessionTimeoutService } from '../../../core/auth/session-timeout.service';
import { StepUpService } from '../../../core/auth/step-up.service';
import { HeaderComponent } from '../shared/components/portal-ui.components';

@Component({
  selector: 'app-portal-layout',
  imports: [HeaderComponent, RouterOutlet, LucideArrowDownToLine, LucideBellRing, LucideCheckCheck, LucideChevronRight, LucideCreditCard, LucideLogOut, LucideSearch, LucideShieldCheck, LucideUserRound],
  templateUrl: './portal-layout.component.html',
  styleUrl: './portal-layout.component.scss',
})
export class PortalLayoutComponent {
  private readonly banking = inject(BankingFacade);
  protected readonly router = inject(Router);
  private readonly session = inject(SessionService);
  protected readonly sessionTimeout = inject(SessionTimeoutService);
  protected readonly stepUp = inject(StepUpService);

  protected readonly customerName = toSignal(this.banking.getCustomerName(), { initialValue: '' });
  protected readonly notifications = toSignal(this.banking.getNotifications(), { initialValue: [] });
  protected readonly menuOpen = signal(false);
  protected readonly profileOpen = signal(false);
  protected readonly notificationsOpen = signal(false);
  protected readonly searchOpen = signal(false);
  protected readonly notificationsRead = signal(false);
  protected readonly unreadNotificationCount = computed(() => this.notificationsRead() ? 0 : this.notifications().filter((notification) => notification.unread).length);
  protected readonly searchQuery = signal('');
  protected readonly searchItems = [
    { label: 'Inicio', description: 'Resumen de tus finanzas', route: 'inicio' },
    { label: 'Transferir dinero', description: 'Nueva transferencia', route: 'operaciones/transferencias' },
    { label: 'Pagar servicios', description: 'Luz, agua, celular e internet', route: 'operaciones/pagos' },
    { label: 'Últimos movimientos', description: 'Historial y filtros', route: 'operaciones/movimientos' },
    { label: 'Trámites', description: 'Constancias, actualización y reclamos', route: 'tramites' },
    { label: 'Cuentas', description: 'Saldos y productos', route: 'productos/cuentas' },
    { label: 'Tarjetas', description: 'Límites, compras online y bloqueo', route: 'productos/tarjetas' },
    { label: 'Préstamos', description: 'Simulación y evaluación', route: 'productos/prestamos' },
    { label: 'Finanzas', description: 'Análisis, metas y tendencias', route: 'finanzas' },
    { label: 'Beneficios', description: 'Beneficios disponibles', route: 'beneficios' },
    { label: 'Mis datos', description: 'Información personal y contacto', route: 'configuracion/perfil' },
    { label: 'Seguridad', description: 'Clave digital y dispositivos', route: 'configuracion/seguridad' },
    { label: 'Notificaciones', description: 'Alertas y preferencias', route: 'configuracion/notificaciones' },
  ] as const;
  protected readonly filteredSearchItems = computed(() => {
    const query = this.searchQuery().trim().toLocaleLowerCase('es');
    return query
      ? this.searchItems.filter((item) => `${item.label} ${item.description}`.toLocaleLowerCase('es').includes(query))
      : this.searchItems.slice(0, 7);
  });

  constructor() {
    this.sessionTimeout.start();
  }

  protected navigate(target: string): void {
    this.menuOpen.set(false);
    this.profileOpen.set(false);
    this.notificationsOpen.set(false);
    this.searchOpen.set(false);
    this.searchQuery.set('');
    void this.router.navigateByUrl(`/portal/${target}`);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    this.profileOpen.set(false);
    this.notificationsOpen.set(false);
    this.searchOpen.set(false);
  }

  protected toggleProfile(): void {
    this.profileOpen.update((open) => !open);
    this.menuOpen.set(false);
    this.notificationsOpen.set(false);
    this.searchOpen.set(false);
  }

  protected toggleNotifications(): void {
    this.notificationsOpen.update((open) => !open);
    this.profileOpen.set(false);
    this.menuOpen.set(false);
    this.searchOpen.set(false);
  }

  protected toggleSearch(): void {
    this.searchOpen.update((open) => !open);
    this.profileOpen.set(false);
    this.menuOpen.set(false);
    this.notificationsOpen.set(false);
  }

  protected updateSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected markNotificationsRead(): void {
    this.banking.markNotificationsRead().pipe(take(1)).subscribe(() => this.notificationsRead.set(true));
  }

  protected signOut(): void {
    this.sessionTimeout.stop();
    this.session.endSession().pipe(take(1)).subscribe({
      next: () => void this.router.navigateByUrl('/auth'),
      error: () => void this.router.navigateByUrl('/auth'),
    });
  }

  protected verifyStepUp(): void {
    this.stepUp.clear();
    this.session.beginStepUp(this.router.url);
  }

  protected cancelStepUp(): void {
    this.stepUp.clear();
  }

}
