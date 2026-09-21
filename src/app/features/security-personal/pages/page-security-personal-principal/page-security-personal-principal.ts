import { AfterViewInit, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { LayoutService } from "@core/services/layout.service";
import { TblSecurityPersonalPrincipal } from "@features/security-personal/components/tables/tbl-security-personal-principal/tbl-security-personal-principal";
import { CardModule } from "primeng/card";

@Component({
    selector: "app-page-security-personal-principal",
    templateUrl: "./page-security-personal-principal.html",
    styleUrls: ["./page-security-personal-principal.scss"],
    imports: [
        TblSecurityPersonalPrincipal,
        CardModule
    ]
})

export class PageSecurityPersonalPrincipal implements OnInit, AfterViewInit, OnDestroy {
    private ls = inject(LayoutService);
    
    constructor() { }  

    ngOnInit(): void {
        this.ls.breadCrumbItems = [
            { label: 'Configuración', labelClass: 'text-[12px]! font-semibold text-primary!' },
            { label: 'Personal de Seguridad', labelClass : 'text-[12px]!' }
        ];
    }

    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {

    }

}