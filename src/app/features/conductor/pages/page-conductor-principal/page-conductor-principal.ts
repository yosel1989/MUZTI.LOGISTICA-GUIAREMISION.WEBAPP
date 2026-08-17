import { Component, OnDestroy, OnInit, AfterViewInit, inject } from '@angular/core';
import { TableConductorPrincipalComponent } from '@features/conductor/components/tables/tbl-conductor-principal/tbl-conductor-principal';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
import { LayoutService } from 'app/core/services/layout.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-page-conductor-principal',
  templateUrl: './page-conductor-principal.html',
  styleUrl: './page-conductor-principal.scss',
  imports: [
    TableConductorPrincipalComponent
  ],
  viewProviders: [],
  providers: [],
  animations: [fadeDownAnimation]
})

export class PageConductorPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    private ls = inject(LayoutService);

    breadCrumbItems: MenuItem[] = [{ label: 'Administración', labelClass: 'text-sm! font-semibold text-primary!' }, { label: 'Conductor', labelClass : 'text-sm! text-slate-600! font-regular!' }];

    ngOnInit(): void{
      this.ls.breadCrumbItems = this.breadCrumbItems;
    }

    ngAfterViewInit(): void{

    }

    ngOnDestroy(): void{
        
    }

}