import { HttpErrorResponse } from "@angular/common/http";
import { AfterViewInit, Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { AlertService } from "@core/services/alert.service";
import { LayoutService } from "@core/services/layout.service";
import { UtilService } from "@core/services/util.service";
import { EstadoAsignarPermisosDTO, GuiaRemisionEstadoDTO, GuiaRemisionEstadoWithPermisosDTO } from "@features/guia-remision-estado/models/guia-remision-estado.model";
import { GuiaRemisionEstadoApiService } from "@features/guia-remision-estado/services/guia-remision-estado.service";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DividerModule } from "primeng/divider";
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from "primeng/skeleton";
import { finalize, Subscription } from "rxjs";

@Component({
    selector: "app-page-guia-remision-estado-principal",
    templateUrl: "./page-guia-remision-estado-principal.html",
    styleUrls: ["./page-guia-remision-estado-principal.scss"],
    imports: [
        MultiSelectModule,
        CardModule,
        DividerModule,
        SkeletonModule,
        ReactiveFormsModule,
        ButtonModule
    ]
})

export class PageGuiaRemisionEstadoPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    private alertService = inject(AlertService);
    private api = inject(GuiaRemisionEstadoApiService);
    public utilService = inject(UtilService);
    private ls = inject(LayoutService);


    estados: GuiaRemisionEstadoDTO[] = [];
    ldEstados = signal(false);

    estadosWithPermisos = signal<GuiaRemisionEstadoWithPermisosDTO[]>([]);
    ldEstadosWithPermisos = signal(false);

    private sb = new Subscription();

    form: FormGroup = new FormGroup({});
    ldSubmit = signal(false);

    ngOnInit(): void {
        this.ls.breadCrumbItems = [
            { label: 'Configuración', labelClass: 'text-[12px]! font-semibold text-primary!' },
            { label: 'Estados Guía de Remisión', labelClass : 'text-[12px]!' }
        ];
    }

    ngAfterViewInit(): void {
        this.loadEstados();
        this.loadEstadosWithPermisos();
    }

    ngOnDestroy(): void {
        this.sb.unsubscribe();
    }

    // Getters

    get request(): EstadoAsignarPermisosDTO[]{
        const result = this.estadosWithPermisos().map(p => ({
            id: p.id,
            permisos: this.form.get(`permisos_${p.id}`)?.value as number[] || []
        }));

        return result;
    }

    // Data

    loadEstados(): void{
        this.ldEstados.set(true);
        const s = this.api.getAll()
        .pipe(finalize(() => this.ldEstados.set(false)))
        .subscribe({
            next: (response) => {
                this.estados = response;
            },
            error: (error: HttpErrorResponse) => {
                this.alertService.showToast({
                    title: error.error.detalle,
                    icon: 'error',
                    timer: 4000,
                    showCloseButton: true,
                    timerProgressBar: true
                });
            }
        });
        this.sb.add(s);
    }

    loadEstadosWithPermisos(): void{
        this.ldEstadosWithPermisos.set(true);
        const s = this.api.getAllWithPermisos()
        .pipe(finalize(() => this.ldEstadosWithPermisos.set(false)))
        .subscribe({
            next: (response) => {
                this.estadosWithPermisos.set(response);
                response.forEach(p => {
                    this.form.addControl(
                        `permisos_${p.id}`,
                        new FormControl(p.permisos)
                    );
                });
            },
            error: (error: HttpErrorResponse) => {
                this.alertService.showToast({
                    title: error.error.detalle,
                    icon: 'error',
                    timer: 4000,
                    showCloseButton: true,
                    timerProgressBar: true
                }); 
            }
        });
        this.sb.add(s);
    }

    // Events

    evtOnSubmit(): void{
        this.ldSubmit.set(true);
        this.form.disable();
        const s = this.api.postAsignarPermisos(this.request)
        .pipe(finalize(() => {
            this.ldSubmit.set(false);
            this.form.enable();
        }))
        .subscribe({
            next: (response) => {
                this.alertService.showToast({
                    title: 'Se configuró los estados con éxito',
                    icon: 'success',
                    position: 'top-end',
                    showCloseButton: true,
                    timer: 4000,
                    timerProgressBar: true
                });
            },
            error: (error: HttpErrorResponse) => {
                this.alertService.showToast({
                    title: error.error.detalle,
                    icon: 'success',
                    position: 'top-end',
                    showCloseButton: true,
                    timer: 4000,
                    timerProgressBar: true
                });
            }
        });
        this.sb.add(s);
    }
}