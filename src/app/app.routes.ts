import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { sessionGuard } from './core/auth/session.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
  { path: 'auth', component: AuthComponent, title: 'Ingresar | Banca Azzu' },
  {
    path: 'portal',
    canActivate: [sessionGuard],
    loadComponent: () => import('./features/portal/layout/portal-layout.component').then((m) => m.PortalLayoutComponent),
    loadChildren: () => import('./features/portal/portal.routes').then((m) => m.PORTAL_ROUTES),
  },
  { path: '**', redirectTo: 'auth' },
];
