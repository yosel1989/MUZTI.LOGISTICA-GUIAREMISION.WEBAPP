import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { TblProviderPrincipal } from '@features/entity/components/tables/tbl-provider-principal/tbl-provider-principal';
import { TableProveedorPrincipalComponent } from '@features/proveedor/components/tables/tbl-proveedor-principal/tbl-proveedor-principal';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
import { LayoutService } from 'app/core/services/layout.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-page-proveedor-principal',
  templateUrl: './page-proveedor-principal.html',
  styleUrl: './page-proveedor-principal.scss',
  imports: [
    TableProveedorPrincipalComponent,
    TblProviderPrincipal
  ],
  animations: [fadeDownAnimation]
})

export class PageProveedorPrincipalComponent {

    breadCrumbItems: MenuItem[] = [{ label: 'Administración', labelClass: 'text-[12px]! font-semibold text-primary!' }, { label: 'Proveedor', labelClass : 'text-[12px]!' }];

    constructor(
      private ls: LayoutService
    ){
        this.ls.breadCrumbItems = this.breadCrumbItems;
    }

}