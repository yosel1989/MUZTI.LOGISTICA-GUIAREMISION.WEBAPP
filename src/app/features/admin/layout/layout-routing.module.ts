import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'proveedor',
        loadComponent: () => import('@features/proveedor/pages/page-proveedor-principal/page-proveedor-principal').then(m => m.PageProveedorPrincipalComponent)
      },
      {
        path: 'conductor',
        loadComponent: () => import('@features/conductor/pages/page-conductor-principal/page-conductor-principal').then(m => m.PageConductorPrincipalComponent)
      },
      {
        path: 'guia-remision',
        loadComponent: () => import('@features/guia-remision/pages/guia-remision-principal/guia-remision-principal').then(m => m.GuiaRemisionPrincipalComponent)
      },
      {
        path: 'guia-remision/nuevo',
        loadComponent: () => import('@features/guia-remision/pages/guia-remision-crear/guia-remision-crear').then(m => m.GuiaRemisionCrearComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
