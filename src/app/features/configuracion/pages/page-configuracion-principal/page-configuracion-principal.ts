import { AfterViewInit, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { fadeDownAnimation } from "@core/animations/page-animation";
import { LayoutService } from "@core/services/layout.service";
import { MenuItem } from "primeng/api";
import { CardModule } from "primeng/card";
import { MenubarModule } from 'primeng/menubar';

@Component({
    selector: "app-page-configuracion-principal",
    templateUrl: "./page-configuracion-principal.html",
    styleUrls: ["./page-configuracion-principal.scss"],
    imports: [
        CardModule,
        RouterOutlet,
        MenubarModule,
        RouterLinkActive,
        RouterLink
    ],
    animations: [fadeDownAnimation]
})

export class PageConfiguracionPrincipalComponent implements OnInit, AfterViewInit, OnDestroy {
    private ls = inject(LayoutService);
    items: MenuItem[] | undefined;

    ngOnInit(): void {
        this.ls.breadCrumbItems = [{ label: 'Configuración', labelClass: 'text-[12px]! font-semibold text-primary!' }];

        this.items = [
            {
                label: 'Perfiles',
                styleClass: 'text-[12px]! font-semibold text-primary!',
                routerLink: 'perfiles'
            },
            {
                label: 'Permisos',
                styleClass: 'text-[12px]! font-semibold text-primary!',
                routerLink: 'permisos'
            }
        ];
    }
    ngAfterViewInit(): void {
        
    }

    ngOnDestroy(): void {
        
    }
}