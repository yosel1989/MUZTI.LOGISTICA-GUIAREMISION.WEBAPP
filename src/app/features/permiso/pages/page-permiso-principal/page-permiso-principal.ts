import { AfterViewInit, Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { AlertService } from "@core/services/alert.service";
import { LayoutService } from "@core/services/layout.service";
import { UtilService } from "@core/services/util.service";
import { PerfilListToSelectDTO } from "@features/perfil/models/perfil.model";
import { PerfilApiService } from "@features/perfil/services/perfil-api.service";
import { PermisoAsignarPerfilesDTO, PermisoDTO } from "@features/permiso/models/permiso.model";
import { PermisoApiService } from "@features/permiso/services/permiso.service";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DividerModule } from "primeng/divider";
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from "primeng/skeleton";
import { finalize, Subscription } from "rxjs";

interface City {
    name: string;
    code: string;
}


@Component({
    selector: "app-page-permiso-principal",
    templateUrl: "./page-permiso-principal.html",
    styleUrls: ["./page-permiso-principal.scss"],
    imports: [
        MultiSelectModule,
        CardModule,
        DividerModule,
        SkeletonModule,
        ReactiveFormsModule,
        ButtonModule
    ]
})

export class PagePermisoPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    private alertService = inject(AlertService);
    private perfilApiService = inject(PerfilApiService);
    private permisoApiService = inject(PermisoApiService);
    public utilService = inject(UtilService);
    private ls = inject(LayoutService);

    cities!: City[];

    perfiles: PerfilListToSelectDTO[] = [];
    ldPerfiles = signal(false);

    permisos = signal<PermisoDTO[]>([]);
    ldPermisos = signal(false);

    private sb = new Subscription();

    form: FormGroup = new FormGroup({});
    ldSubmit = signal(false);

    ngOnInit(): void {
        this.ls.breadCrumbItems = [
            { label: 'Configuración', labelClass: 'text-[12px]! font-semibold text-primary!' },
            { label: 'Permisos', labelClass : 'text-[12px]!' }
        ];
    }

    ngAfterViewInit(): void {
        this.loadPerfiles();
        this.loadPermisos();
    }

    ngOnDestroy(): void {
        this.sb.unsubscribe();
    }

    // Getters

    get request(): PermisoAsignarPerfilesDTO[]{
        const result = this.permisos().map(p => ({
            id: p.id,
            perfiles: this.form.get(`perfiles_${p.id}`)?.value as number[] || []
        }));

        return result;
    }

    // Data

    loadPerfiles(): void{
        this.ldPerfiles.set(true);
        const s = this.perfilApiService.getAllToSelect()
        .pipe(finalize(() => this.ldPerfiles.set(false)))
        .subscribe({
            next: (response) => {
                this.perfiles = response;
            },
            error: (error) => {
                console.error("Error loading perfiles:", error); 
            }
        });
        this.sb.add(s);
    }

    loadPermisos(): void{
        this.ldPermisos.set(true);
        const s = this.permisoApiService.getPermisos()
        .pipe(finalize(() => this.ldPermisos.set(false)))
        .subscribe({
            next: (response) => {
                this.permisos.set(response);
                response.forEach(p => {
                    this.form.addControl(
                        `perfiles_${p.id}`,
                        new FormControl(p.perfiles)
                    );
                });
            },
            error: (error) => {
                console.error("Error loading permisos:", error); 
            }
        });
        this.sb.add(s);
    }

    // Events

    evtOnSubmit(): void{
        this.ldSubmit.set(true);
        this.form.disable();
        const s = this.permisoApiService.postAsignarPerfiles(this.request)
        .pipe(finalize(() => {
            this.ldSubmit.set(false);
            this.form.enable();
        }))
        .subscribe({
            next: (response) => {
                this.alertService.showToast({
                    title: 'Se configuró los permisos con éxito',
                    icon: 'success',
                    position: 'top-end',
                    showCloseButton: true,
                    timer: 4000,
                    timerProgressBar: true
                });
            },
            error: (error) => {
                console.error("Error submitting form:", error); 
            }
        });
        this.sb.add(s);
    }
}