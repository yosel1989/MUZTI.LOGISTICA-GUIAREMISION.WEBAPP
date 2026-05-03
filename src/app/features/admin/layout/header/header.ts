import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { Menu, MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthApiService } from 'app/features/auth/services/auth-api.service';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { Observable } from 'rxjs';
import { LayoutService } from 'app/core/services/layout.service';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { AsyncPipe } from '@angular/common';
import { animate, AnimationBuilder, AnimationPlayer, style } from '@angular/animations';
import { StorageService } from '@core/services/storage.service';
import { User } from '@features/auth/services/auth.interface';

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
    OverlayBadgeModule,
    BreadcrumbModule,
    AsyncPipe
  ],
  providers: [ConfirmationService]
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy{
    private ls = inject(StorageService);

    @ViewChild('breadcrumbContainer') breadcrumbContainer: ElementRef | undefined;
    @ViewChild('menuUser') menuUser!: Menu;  
    items: MenuItem[] | undefined;
    breadCrumbItems: Observable<MenuItem[]> | undefined;
    fadeState = 'in';
    private player!: AnimationPlayer;

    public user: User | null = null;

    constructor(
        private confirmationService: ConfirmationService,
        private authApi: AuthApiService,
        private layoutService: LayoutService,
        private builder: AnimationBuilder
    ) {
        this.breadCrumbItems = this.layoutService.breadCrumbItems;
        this.user = this.ls.getUser();
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
        this.layoutService.breadCrumbItems.subscribe(() => {
            this.handlerPlayFadeLeft();
        });
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        this.player?.destroy();
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

    handlerPlayFadeLeft() {
        const factory = this.builder.build([
            style({ opacity: 0, transform: 'translateX(-20px)' }),
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
        ]);

        if (this.player) {
            this.player.destroy();
        }

        this.player = factory.create(this.breadcrumbContainer?.nativeElement);
        this.player.play();
    }

}
