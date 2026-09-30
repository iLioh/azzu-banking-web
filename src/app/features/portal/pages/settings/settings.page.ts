import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideBellRing, LucideChevronRight, LucideShieldCheck, LucideUserRound } from '@lucide/angular';
import { PORTAL_PAGE_STYLES } from '../../shared/portal-page.styles';

@Component({
  selector: 'app-settings-page',
  imports: [LucideBellRing, LucideChevronRight, LucideShieldCheck, LucideUserRound],
  template: `<main class="page"><p class="eyebrow">CONFIGURACIÓN</p><h1>Tu perfil y seguridad.</h1><p class="intro">Administra tus datos, las formas de acceso y las alertas de tu banca desde un solo lugar.</p><section class="settings-grid"><button class="setting-card" type="button" (click)="go('perfil')"><span><svg lucideUserRound [size]="22"></svg></span><div><b>Mis datos</b><small>Correo, celular y dirección registrada.</small></div><svg lucideChevronRight [size]="18"></svg></button><button class="setting-card" type="button" (click)="go('seguridad')"><span><svg lucideShieldCheck [size]="22"></svg></span><div><b>Seguridad y clave digital</b><small>Cambia tu clave y revisa los dispositivos con sesión.</small></div><svg lucideChevronRight [size]="18"></svg></button><button class="setting-card" type="button" (click)="go('notificaciones')"><span><svg lucideBellRing [size]="22"></svg></span><div><b>Alertas y notificaciones</b><small>Elige qué avisos recibir y por qué canal.</small></div><svg lucideChevronRight [size]="18"></svg></button></section></main>`,
  styles: [PORTAL_PAGE_STYLES, `.settings-grid{display:grid;gap:14px;max-width:760px}.setting-card{align-items:center;background:#fff;border:1px solid #e5e8ee;border-radius:12px;color:#11183f;cursor:pointer;display:grid;gap:14px;grid-template-columns:46px 1fr 20px;padding:18px;text-align:left;width:100%}.setting-card:hover{border-color:#c9d3a1}.setting-card>span{align-items:center;background:#eaf6ad;border-radius:11px;color:#526300;display:flex;height:46px;justify-content:center;width:46px}.setting-card div{display:grid;gap:5px}.setting-card b{font-size:14px}.setting-card small{color:#687291;font-size:12px}.setting-card>svg{color:#8a93a8}`],
})
export class SettingsPageComponent {
  private readonly router = inject(Router);
  protected go(section: string) { void this.router.navigateByUrl(`/portal/configuracion/${section}`); }
}
