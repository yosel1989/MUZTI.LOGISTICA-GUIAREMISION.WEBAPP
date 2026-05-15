import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'administracion/proveedor',
        loadComponent: () => import('@features/proveedor/pages/page-proveedor-principal/page-proveedor-principal').then(m => m.PageProveedorPrincipalComponent)
      },
      {
        path: 'administracion/conductor',
        loadComponent: () => import('@features/conductor/pages/page-conductor-principal/page-conductor-principal').then(m => m.PageConductorPrincipalComponent)
      },
      {
        path: 'administracion/unidad-transporte',
        loadComponent: () => import('@features/unidad-transporte/pages/page-unidad-transporte-principal/page-unidad-transporte-principal').then(m => m.PageUnidadTransportePrincipalComponent)
      },
      {
        path: 'administracion/guia-remision',
        loadComponent: () => import('@features/guia-remision/pages/page-guia-remision-principal/page-guia-remision-principal').then(m => m.PageGuiaRemisionPrincipalComponent)
      },
      {
        path: 'administracion/remitente',
        loadComponent: () => import('@features/remitente/pages/page-remitente-principal/page-remitente-principal').then(m => m.PageRemitentePrincipalComponent)
      },
      {
        path: 'administracion/guia-remision/nuevo',
        loadComponent: () => import('@features/guia-remision/pages/guia-remision-crear/guia-remision-crear').then(m => m.GuiaRemisionCrearComponent)
      },
      {
        path: 'administracion/guia-remision/editar/:uuid',
        loadComponent: () => import('@features/guia-remision/pages/guia-remision-editar/guia-remision-editar').then(m => m.GuiaRemisionEditarComponent)
      },
      {
        path: 'administracion/transportista',
        loadComponent: () => import('@features/transportista/pages/page-transportista-principal/page-transportista-principal').then(m => m.PageTransportistaPrincipalComponent)
      },
      {
        path: 'administracion/establecimiento',
        loadComponent: () => import('@features/establecimiento/pages/page-establecimiento-principal/page-establecimiento-principal').then(m => m.PageEstablecimientoPrincipalComponent)
      },
      {
        path: 'configuracion',
        loadComponent: () => import('@features/configuracion/pages/page-configuracion-principal/page-configuracion-principal').then(m => m.PageConfiguracionPrincipalComponent),
        children: [
          {
            path: 'perfiles',
            loadComponent: () => import('@features/perfil/pages/page-perfil-principal/page-perfil-principal').then(m => m.PagePerfilPrincipalComponent)
          },
          {
            path: 'permisos',
            loadComponent: () => import('@features/permiso/pages/page-permiso-principal/page-permiso-principal').then(m => m.PagePermisoPrincipalComponent)
          },
          {
            path: 'estados',
            loadComponent: () => import('@features/guia-remision-estado/pages/page-guia-remision-estado-principal/page-guia-remision-estado-principal').then(m => m.PageGuiaRemisionEstadoPrincipalComponent)
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
