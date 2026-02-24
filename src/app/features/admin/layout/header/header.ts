import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { Menu, MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { AlertService } from 'app/shared/services/alert.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthApiService } from 'app/features/auth/services/auth-api.service';
import { OverlayBadgeModule } from 'primeng/overlaybadge';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
  imports: [
    ToolbarModule, 
    ButtonModule, 
    IconFieldModule, 
    InputIconModule, 
    SplitButtonModule,
    AvatarModule,
    MenuModule,
    BadgeModule,
    ConfirmDialogModule,
    OverlayBadgeModule 
  ],
  providers: [ConfirmationService]
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy{

    @ViewChild('menuUser') menuUser!: Menu;
    items: MenuItem[] | undefined;

    constructor(
        private alertService: AlertService,
        private confirmationService: ConfirmationService,
        private authApi: AuthApiService
    ) {
    }

    ngOnInit(): void {
        this.items = [
            {
                label: 'Documents',
                items: [
                    {
                        label: 'New',
                        icon: 'pi pi-plus'
                    },
                    {
                        label: 'Search',
                        icon: 'pi pi-search'
                    }
                ]
            },
            {
                label: 'Profile',
                items: [
                    {
                        label: 'Mi Perfil',
                        icon: 'pi pi-cog'
                    },
                    {
                        label: 'Cerrar Sesion',
                        icon: 'pi pi-sign-out',
                        command: () => { this.evtLogout(); }
                    }
                ]
            }
        ];
    }

    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {

    }

    // events
    evtShowMenu(evt: any): void{
        const target = evt.currentTarget as HTMLElement;
        this.menuUser?.show({ currentTarget: target });
    }

    evtLogout(): void{
        this.handlerConfirmDialog(() => {
            this.authApi.logout().subscribe((res) => {
                console.log('Se cerró sesión');
            });
        }, 
        '¿Desea cerrar sesión?', 
        'Confirmar la operación.');
    }

    evtToggleSidebar(): void{
        console.log('click');
        document.querySelector("body")?.classList.toggle("collapsed");
    }

    // handlers
    handlerConfirmDialog(callback: () => void, header: string, message: string): void{
      this.confirmationService.confirm({
          header: header,
          message: message,
          accept: () => {
            callback();
          },
          reject: () => {
              
          },
      });
    }

}
