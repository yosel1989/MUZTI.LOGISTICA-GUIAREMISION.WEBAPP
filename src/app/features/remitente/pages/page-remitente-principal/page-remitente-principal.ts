import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { TableRemitentePrincipalComponent } from '@features/remitente/components/tables/tbl-remitente-principal/tbl-remitente-principal';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-page-remitente-principal',
  templateUrl: './page-remitente-principal.html',
  styleUrl: './page-remitente-principal.scss',
  imports: [
    CommonModule,
    CardModule,
    TableRemitentePrincipalComponent
  ],
  viewProviders: [],
  providers: [],
  animations: [fadeDownAnimation]
})

export class PageRemitentePrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

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