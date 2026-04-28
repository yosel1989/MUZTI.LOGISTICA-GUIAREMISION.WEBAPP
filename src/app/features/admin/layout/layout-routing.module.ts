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
        path: 'unidad-transporte',
        loadComponent: () => import('@features/unidad-transporte/pages/page-unidad-transporte-principal/page-unidad-transporte-principal').then(m => m.PageUnidadTransportePrincipalComponent)
      },
      {
        path: 'guia-remision',
        loadComponent: () => import('@features/guia-remision/pages/page-guia-remision-principal/page-guia-remision-principal').then(m => m.PageGuiaRemisionPrincipalComponent)
      },
      {
        path: 'remitente',
        loadComponent: () => import('@features/remitente/pages/page-remitente-principal/page-remitente-principal').then(m => m.PageRemitentePrincipalComponent)
      },
      {
        path: 'guia-remision/nuevo',
        loadComponent: () => import('@features/guia-remision/pages/guia-remision-crear/guia-remision-crear').then(m => m.GuiaRemisionCrearComponent)
      },
      {
        path: 'transportista',
        loadComponent: () => import('@features/transportista/pages/page-transportista-principal/page-transportista-principal').then(m => m.PageTransportistaPrincipalComponent)
      },
      {
        path: 'establecimiento',
        loadComponent: () => import('@features/establecimiento/pages/page-establecimiento-principal/page-establecimiento-principal').then(m => m.PageEstablecimientoPrincipalComponent)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
