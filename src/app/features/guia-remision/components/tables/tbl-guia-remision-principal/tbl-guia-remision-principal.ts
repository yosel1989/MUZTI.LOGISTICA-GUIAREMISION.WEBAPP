import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-tbl-guia-remision-principal',
  templateUrl: './tbl-guia-remision-principal.html',
  styleUrl: './tbl-guia-remision-principal.scss',
  imports: [
        CommonModule,
        TableModule
  ],
  providers: []
})

export class TableGuiaRemisionPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

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