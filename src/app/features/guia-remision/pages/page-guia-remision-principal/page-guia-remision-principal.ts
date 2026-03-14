import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { TableGuiaRemisionPrincipalComponent } from '@features/guia-remision/components/tables/tbl-guia-remision-principal/tbl-guia-remision-principal';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-page-guia-remision-principal',
  templateUrl: './page-guia-remision-principal.html',
  styleUrl: './page-guia-remision-principal.scss',
  imports: [
    CommonModule,
    CardModule,
    TableGuiaRemisionPrincipalComponent
  ],
  viewProviders: [],
  providers: []
})

export class PageGuiaRemisionPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

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