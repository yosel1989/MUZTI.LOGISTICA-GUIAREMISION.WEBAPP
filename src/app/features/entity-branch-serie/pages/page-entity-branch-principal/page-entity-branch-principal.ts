import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { TblEntityBranchPrincipal } from '@features/entity-branch/components/tables/tbl-entity-branch-principal/tbl-entity-branch-principal';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
import { LayoutService } from 'app/core/services/layout.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-page-entity-branch-principal',
  templateUrl: './page-entity-branch-principal.html',
  styleUrl: './page-entity-branch-principal.scss',
  imports: [
    CommonModule,
    TblEntityBranchPrincipal
  ],
  viewProviders: [],
  providers: [],
  animations: [fadeDownAnimation]
})

export class PageEntityBranchPrincipal implements OnInit, AfterViewInit, OnDestroy{

    breadCrumbItems: MenuItem[] = [{ label: 'Administración', labelClass: 'text-[12px]! font-semibold text-primary!' }, { label: 'Establecimiento', labelClass: 'text-[12px]!' }];

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