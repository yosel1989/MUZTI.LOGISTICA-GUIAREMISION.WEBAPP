import { Component, OnDestroy, OnInit, AfterViewInit, HostBinding } from '@angular/core';
import { PanelMenuModule } from 'primeng/panelmenu';
import { GuiaRemisionRoutingModule } from "../../pages/guia-remision/guia-remision-routing.module";
import { HeaderComponent } from '../header/header';


@Component({
  selector: 'app-content',
  templateUrl: './content.html',
  styleUrl: './content.scss',
  imports: [PanelMenuModule, GuiaRemisionRoutingModule, HeaderComponent],
})
export class ContentComponent implements OnInit, AfterViewInit, OnDestroy{

    constructor() {
    }

    @HostBinding('class') claseHost = 'w-full';

    ngOnInit(): void {
        
    }
    ngAfterViewInit(): void {
        
    }
    ngOnDestroy(): void {
        
    }
    
}