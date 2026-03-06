import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { TableProveedorPrincipalComponent } from '@features/proveedor/components/tables/tbl-proveedor-principal/tbl-proveedor-principal';
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
  providers: []
})

export class PageProveedorPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

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