import { Component } from "@angular/core";
import { fadeDownAnimation } from "@core/animations/page-animation";
import { LayoutService } from "@core/services/layout.service";
import { TblProviderPrincipal } from "@features/entity/components/tables/tbl-provider-principal/tbl-provider-principal";
import { MenuItem } from "primeng/api";

@Component({
    selector: "app-page-providers-principal",
    templateUrl: "./page-providers-principal.html",
    styleUrls: ["./page-providers-principal.scss"],
    imports: [
        TblProviderPrincipal
    ],
    animations: [fadeDownAnimation]
})

export class PageProvidersPrincipal{
    
    breadCrumbItems: MenuItem[] = [{ label: 'Administración', labelClass: 'text-[12px]! font-semibold text-primary!' }, { label: 'Proveedor', labelClass : 'text-[12px]!' }];

    constructor(
      private ls: LayoutService
    ){
        this.ls.breadCrumbItems = this.breadCrumbItems;
    }

}