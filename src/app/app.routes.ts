import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/pages/auth/auth.component';
import { AuthRedirectGuard } from './core/guards/auth-redirect.guard';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'admin' },

  {
    path: 'login',
    component: AuthComponent,
    canActivate: [AuthRedirectGuard],
  },

  {
    path: 'admin',
    loadChildren: () => import('./features/admin/layout/layout.module').then(m => m.LayoutModule),
    canActivate: [AuthGuard],
  },
];
