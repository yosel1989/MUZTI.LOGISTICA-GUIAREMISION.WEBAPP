import { Component, OnDestroy, OnInit, AfterViewInit, inject } from '@angular/core';
import { TableTransportistaPrincipalComponent } from '@features/transportista/components/tables/tbl-transportista-principal/tbl-transportista-principal';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
import { LayoutService } from 'app/core/services/layout.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-page-transportista-principal',
  templateUrl: './page-transportista-principal.html',
  styleUrl: './page-transportista-principal.scss',
  imports: [
    TableTransportistaPrincipalComponent
  ],
  viewProviders: [],
  providers: [],
  animations: [fadeDownAnimation]
})

export class PageTransportistaPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    private ls = inject(LayoutService);

    breadCrumbItems: MenuItem[] = [{ label: 'Administración', labelClass: 'text-[12px]! font-semibold text-primary!' }, { label: 'Transportista', labelClass: 'text-[12px]!' }];

    ngOnInit(): void{
      this.ls.breadCrumbItems = this.breadCrumbItems;
    }

    ngAfterViewInit(): void{

    }

    ngOnDestroy(): void{
        
    }

}