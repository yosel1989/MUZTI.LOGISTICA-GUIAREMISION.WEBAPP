import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuiaRemisionComponent } from './guia-remision';

const routes: Routes = [{
  path: '',
  component: GuiaRemisionComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GuiaRemisionRoutingModule { }
