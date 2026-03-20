import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { TableUnidadTransportePrincipalComponent } from '@features/unidad-transporte/components/tables/tbl-unidad-transporte-principal/tbl-unidad-transporte-principal';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
import { LayoutService } from 'app/core/services/layout.service';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';
@Component({
  selector: 'app-page-unidad-transporte-principal',
  templateUrl: './page-unidad-transporte-principal.html',
  styleUrl: './page-unidad-transporte-principal.scss',
  imports: [
    CommonModule,
    CardModule,
    TableUnidadTransportePrincipalComponent
  ],
  viewProviders: [],
  providers: [],
  animations: [fadeDownAnimation]
})

export class PageUnidadTransportePrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    breadCrumbItems: MenuItem[] = [{ label: 'Unidad de Transporte', labelClass: 'text-[12px]! font-semibold text-primary!' }, { label: 'Administración', labelClass: 'text-[12px]!' }];

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