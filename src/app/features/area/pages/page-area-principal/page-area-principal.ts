import { AfterViewInit, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { fadeDownAnimation } from "@core/animations/page-animation";
import { LayoutService } from "@core/services/layout.service";
import { TblAreaPrincipal } from "@features/area/components/tables/tbl-area-principal/tbl-area-principal";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";

@Component({
    selector: "app-page-area-principal",
    templateUrl: "./page-area-principal.html",
    styleUrls: ["./page-area-principal.scss"],
    imports: [
        TblAreaPrincipal,
        CardModule,
        ButtonModule
    ],
    animations: [fadeDownAnimation]
})

export class PageAreaPrincipal implements OnInit, AfterViewInit, OnDestroy {
    private ls = inject(LayoutService);
    
    constructor() { }  

    ngOnInit(): void {
        this.ls.breadCrumbItems = [
            { label: 'Configuración', labelClass: 'text-[12px]! font-semibold text-primary!' },
            { label: 'Areas', labelClass : 'text-[12px]!' }
        ];
    }

    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {

    }

}