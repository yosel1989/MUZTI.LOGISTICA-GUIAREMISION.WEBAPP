import { AfterViewInit, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { LayoutService } from "@core/services/layout.service";
import { TableIntegrationCredentialPrincipal } from "@features/integration-credential/components/tables/tbl-integration-credential-principal/tbl-integration-credential-principal";
import { CardModule } from "primeng/card";

@Component({
    selector: "app-page-integration-credential-principal",
    templateUrl: "./page-integration-credential-principal.html",
    styleUrls: ["./page-integration-credential-principal.scss"],
    imports: [
        TableIntegrationCredentialPrincipal,
        CardModule
    ]
})

export class PageIntegrationCredentialPrincipal implements OnInit, AfterViewInit, OnDestroy {
    private ls = inject(LayoutService);
    
    constructor() { }  

    ngOnInit(): void {
        this.ls.breadCrumbItems = [
            { label: 'Configuración', labelClass: 'text-[12px]! font-semibold text-primary!' },
            { label: 'Integraciones', labelClass : 'text-[12px]!' }
        ];
    }

    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {

    }

}