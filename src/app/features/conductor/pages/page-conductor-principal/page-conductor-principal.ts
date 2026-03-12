import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { TableConductorPrincipalComponent } from '@features/conductor/components/tables/tbl-conductor-principal/tbl-conductor-principal';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
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

    constructor(

    ){
        
    }

    ngOnInit(): void{

    }

    ngAfterViewInit(): void{

    }

    ngOnDestroy(): void{
        
    }

}