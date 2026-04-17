import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { TableConductorPrincipalComponent } from '@features/conductor/components/tables/tbl-conductor-principal/tbl-conductor-principal';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
import { LayoutService } from 'app/core/services/layout.service';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';
@Component({
  selector: 'app-page-conductor-principal',
  templateUrl: './page-conductor-principal.html',
  styleUrl: './page-conductor-principal.scss',
  imports: [
    CommonModule,
    CardModule,
    TableConductorPrincipalComponent
  ],
  viewProviders: [],
  providers: [],
  animations: [fadeDownAnimation]
})

export class PageConductorPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    breadCrumbItems: MenuItem[] = [{ label: 'Administración', labelClass: 'text-[12px]! font-semibold text-primary!' }, { label: 'Conductor', labelClass : 'text-[12px]!' }];

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