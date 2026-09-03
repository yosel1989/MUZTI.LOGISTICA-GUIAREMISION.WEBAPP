import { Component } from "@angular/core";
import { fadeDownAnimation } from "@core/animations/page-animation";
import { LayoutService } from "@core/services/layout.service";
import { TblEntityPrincipal } from "@features/entity/components/tables/tbl-entity-principal/tbl-entity-principal";
import { MenuItem } from "primeng/api";

@Component({
    selector: "app-page-entities-principal",
    templateUrl: "./page-entities-principal.html",
    styleUrls: ["./page-entities-principal.scss"],
    imports: [
        TblEntityPrincipal
    ],
    animations: [fadeDownAnimation]
})

export class PageEntitiesPrincipal{
    
    breadCrumbItems: MenuItem[] = [{ label: 'Administración', labelClass: 'text-[12px]! font-semibold text-primary!' }, { label: 'Proveedor', labelClass : 'text-[12px]!' }];

    constructor(
      private ls: LayoutService
    ){
        this.ls.breadCrumbItems = this.breadCrumbItems;
    }

}