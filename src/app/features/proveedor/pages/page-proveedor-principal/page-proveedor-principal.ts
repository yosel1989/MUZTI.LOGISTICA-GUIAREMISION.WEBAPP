import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { TableProveedorPrincipalComponent } from '@features/proveedor/components/tables/tbl-proveedor-principal/tbl-proveedor-principal';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
import { LayoutService } from 'app/core/services/layout.service';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-page-proveedor-principal',
  templateUrl: './page-proveedor-principal.html',
  styleUrl: './page-proveedor-principal.scss',
  imports: [
    CommonModule,
    CardModule,
    TableProveedorPrincipalComponent
  ],
  viewProviders: [],
  providers: [],
  animations: [fadeDownAnimation]
})

export class PageProveedorPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    breadCrumbItems: MenuItem[] = [{ label: 'Administración', labelClass: 'text-[12px]! font-semibold text-primary!' }, { label: 'Proveedor', labelClass : 'text-[12px]!' }];

    constructor(
      private ls: LayoutService
    ){
        this.ls.breadCrumbItems = this.breadCrumbItems;
    }

    ngOnInit(): void{

    }

    ngAfterViewInit(): void{

    }

    ngOnDestroy(): void{
        
    }

}