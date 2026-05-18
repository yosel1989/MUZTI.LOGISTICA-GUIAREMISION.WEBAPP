import { AfterViewInit, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { LayoutService } from "@core/services/layout.service";
import { TblPerfilPrincipalComponent } from "@features/perfil/components/tables/tbl-perfil-principal/tbl-perfil-principal";
import { CardModule } from "primeng/card";

@Component({
    selector: "app-page-perfil-principal",
    templateUrl: "./page-perfil-principal.html",
    styleUrls: ["./page-perfil-principal.scss"],
    imports: [
        TblPerfilPrincipalComponent,
        CardModule
    ]
})

export class PagePerfilPrincipalComponent implements OnInit, AfterViewInit, OnDestroy {
    private ls = inject(LayoutService);
    
    constructor() { }  

    ngOnInit(): void {
        this.ls.breadCrumbItems = [
            { label: 'Configuración', labelClass: 'text-[12px]! font-semibold text-primary!' },
            { label: 'Perfiles', labelClass : 'text-[12px]!' }
        ];
    }

    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {

    }

}