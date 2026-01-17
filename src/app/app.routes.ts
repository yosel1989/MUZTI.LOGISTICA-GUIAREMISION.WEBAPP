import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/pages/auth/auth.component';
import { AuthRedirectGuard } from './core/guards/auth-redirect.guard';

export const routes: Routes = [
    // auth
  {
    path: 'auth',
    component: AuthComponent,
    //canActivate: [AuthRedirectGuard],
  },

  {
    path: 'admin',
    loadChildren: () => import('./features/admin/layout/layout.module').then(m => m.LayoutModule),
    //canActivate: [AuthGuard],
  },
];
