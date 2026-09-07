import { Component } from "@angular/core";
import { fadeDownAnimation } from "@core/animations/page-animation";
import { LayoutService } from "@core/services/layout.service";
import { TblTransporterPrincipal } from "@features/entity/components/tables/tbl-transporter-principal/tbl-transporter-principal";
import { MenuItem } from "primeng/api";

@Component({
    selector: "app-page-transporters-principal",
    templateUrl: "./page-transporters-principal.html",
    styleUrls: ["./page-transporters-principal.scss"],
    imports: [
        TblTransporterPrincipal
    ],
    animations: [fadeDownAnimation]
})

export class PageTransportersPrincipal{
    
    breadCrumbItems: MenuItem[] = [{ label: 'Administración', labelClass: 'text-[12px]! font-semibold text-primary!' }, { label: 'Transportista', labelClass : 'text-[12px]!' }];

    constructor(
      private ls: LayoutService
    ){
        this.ls.breadCrumbItems = this.breadCrumbItems;
    }

}