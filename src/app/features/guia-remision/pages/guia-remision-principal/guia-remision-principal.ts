import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { TableGuiaRemisionPrincipalComponent } from '@features/guia-remision/components/tables/tbl-guia-remision-principal/tbl-guia-remision-principal';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-guia-remision-principal',
  templateUrl: './guia-remision-principal.html',
  styleUrl: './guia-remision-principal.scss',
  imports: [
    CommonModule,
    CardModule,
    TableGuiaRemisionPrincipalComponent
  ],
  viewProviders: [],
  providers: []
})

export class GuiaRemisionPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

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