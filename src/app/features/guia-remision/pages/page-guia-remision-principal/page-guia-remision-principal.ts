import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FltGuiaRemisionPrincipalComponent } from '@features/guia-remision/components/filters/flt-guia-remision-principal/flt-guia-remision-principal';
import { TableGuiaRemisionPrincipalComponent } from '@features/guia-remision/components/tables/tbl-guia-remision-principal/tbl-guia-remision-principal';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
import { LayoutService } from 'app/core/services/layout.service';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-page-guia-remision-principal',
  templateUrl: './page-guia-remision-principal.html',
  styleUrl: './page-guia-remision-principal.scss',
  imports: [
    CommonModule,
    CardModule,
    TableGuiaRemisionPrincipalComponent,
    FltGuiaRemisionPrincipalComponent
  ],
  viewProviders: [],
  providers: [],
  animations: [fadeDownAnimation]
})

export class PageGuiaRemisionPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    breadCrumbItems: MenuItem[] = [{ label: 'Administración', labelClass: 'text-[12px]! font-semibold text-primary!' }, { label: 'Guia de Remisión', labelClass: 'text-[12px]!' }];
    
    @ViewChild('fltGuiaRemision') fltGuiaRemision: FltGuiaRemisionPrincipalComponent | undefined;

    collapseFilter = true;

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

    // Events

    evtShowFilter(): void{
      this.collapseFilter = !this.collapseFilter;
    }

}