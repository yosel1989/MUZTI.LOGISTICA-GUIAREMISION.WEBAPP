import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
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

    constructor() { }  

    ngOnInit(): void {

    }

    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {

    }

}