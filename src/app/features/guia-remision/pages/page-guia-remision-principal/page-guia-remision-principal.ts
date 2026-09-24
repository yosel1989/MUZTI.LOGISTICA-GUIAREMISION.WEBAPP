import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FltGuiaRemisionPrincipalComponent } from '@features/guia-remision/components/filters/flt-guia-remision-principal/flt-guia-remision-principal';
import { TableGuiaRemisionPrincipalComponent } from '@features/guia-remision/components/tables/tbl-guia-remision-principal/tbl-guia-remision-principal';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
import { LayoutService } from 'app/core/services/layout.service';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-page-guia-remision-principal',
  templateUrl: './page-guia-remision-principal.html',
  styleUrl: './page-guia-remision-principal.scss',
  imports: [
    TableGuiaRemisionPrincipalComponent,
    FltGuiaRemisionPrincipalComponent,
    ButtonModule,
    RouterLink
  ],
  viewProviders: [],
  providers: [],
  animations: [fadeDownAnimation]
})

export class PageGuiaRemisionPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    private router = inject(Router);
    breadCrumbItems: MenuItem[] = [{ label: 'Administración', labelClass: 'text-[12px]! font-semibold text-primary!' }, { label: 'Guia de Remisión', labelClass: 'text-[12px]!' }];
    
    @ViewChild('fltGuiaRemision') fltGuiaRemision: FltGuiaRemisionPrincipalComponent | undefined;

    collapseFilter = signal(true);

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
      this.collapseFilter.set(!this.collapseFilter());
    }

}