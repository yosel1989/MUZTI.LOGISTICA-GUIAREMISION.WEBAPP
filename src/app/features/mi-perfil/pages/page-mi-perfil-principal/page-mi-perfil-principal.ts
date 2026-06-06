import { AfterViewInit, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { fadeDownAnimation } from "@core/animations/page-animation";
import { LayoutService } from "@core/services/layout.service";
import { MenuItem } from "primeng/api";
import { CardModule } from "primeng/card";
import { MenubarModule } from 'primeng/menubar';

@Component({
    selector: "app-page-mi-perfil-principal",
    templateUrl: "./page-mi-perfil-principal.html",
    styleUrls: ["./page-mi-perfil-principal.scss"],
    imports: [
        CardModule,
        RouterOutlet,
        MenubarModule,
        RouterLinkActive,
        RouterLink
    ],
    animations: [fadeDownAnimation]
})

export class PageMiPerfilPrincipalComponent implements OnInit, AfterViewInit, OnDestroy {
    private ls = inject(LayoutService);
    items: MenuItem[] | undefined;

    ngOnInit(): void {
        this.ls.breadCrumbItems = [{ label: 'Mi Perfil', labelClass: 'text-[12px]! font-semibold text-primary!' }];

        this.items = [
            {
                label: 'Firma',
                styleClass: 'text-[12px]! font-semibold text-primary!',
                routerLink: 'firma'
            }
        ];
    }

    ngAfterViewInit(): void {
        
    }

    ngOnDestroy(): void {
        
    }
}