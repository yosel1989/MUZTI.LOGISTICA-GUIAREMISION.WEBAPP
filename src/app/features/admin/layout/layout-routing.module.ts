import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
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
