import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { GuiaRemisionTipoTrasladoEnum, TipoGuiaRemisionEnum } from "@features/guia-remision/enums/guia-remision.enum";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { PanelModule } from 'primeng/panel';
import { SelectModule } from "primeng/select";
import { TooltipModule } from "primeng/tooltip";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { OnlyNumberDirective } from "app/core/directives/only-numbers.directive";
import { RemitenteNombre } from "@features/remitente/models/remitente";
import { RemitenteApiService } from "@features/remitente/services/remitente-api.service";
import { AlertService } from "app/core/services/alert.service";
import { BehaviorSubject, Subscription } from "rxjs";
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { SelectTipoTraslado } from "../../selects/select-motivo-traslado/select-motivo-traslado";
import { FltDateComponent } from "app/core/components/filters/flt-date/flt-date";
import { DestinatarioBusqueda } from "@features/destinatario/models/destinatario";
import { DestinatarioApiService } from "@features/destinatario/services/destinatario-api.service";
import { AsyncPipe } from "@angular/common";


@Component({
    selector: 'app-flt-guia-remision-principal',
    templateUrl: './flt-guia-remision-principal.html',
    styleUrl: './flt-guia-remision-principal.scss',
    imports: [
        PanelModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        TooltipModule,
        SelectModule,
        IconFieldModule,
        InputIconModule,
        TooltipModule,
        OnlyNumberDirective,
        MultiSelectModule,
        FltDateComponent,
        AsyncPipe
    ]
})

export class FltGuiaRemisionPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    formGroup: FormGroup = new FormGroup({});
    tiposGuia: {label: string, value: string | null}[] = [ 
        { label: 'Guía Remitente', value: TipoGuiaRemisionEnum.remitente }, 
        { label: 'Guía Transportista', value: TipoGuiaRemisionEnum.transportista }
    ];

    tiposTraslado: SelectTipoTraslado[] = [ 
        { label: 'VENTA', value: GuiaRemisionTipoTrasladoEnum.venta }, 
        { label: 'COMPRA', value: GuiaRemisionTipoTrasladoEnum.compra },
        { label: 'TRASLADO', value: GuiaRemisionTipoTrasladoEnum.traslado }, 
    ];

    tiposTransporte: {label: string, value: string | null}[] = [ 
        { label: 'PUBLICO', value: 'PUBLICO' }, 
        { label: 'PRIVADO', value: 'PRIVADO' }
    ];

    remitentes: RemitenteNombre[] = [];
    ldRemitentes: boolean = false;

    private subs = new Subscription();
    countActived = 0;

    destinatarios = new BehaviorSubject<DestinatarioBusqueda[]>([]);
    destinatarios$ = this.destinatarios.asObservable();
    ldDestinatarios: boolean = false;
    subDestinatario = new Subscription();

    constructor(
        private fb: FormBuilder,
        private remitenteService: RemitenteApiService,
        private alertService: AlertService,
        private destinatarioService: DestinatarioApiService,
        private cd: ChangeDetectorRef,
    ){
        this.formGroup = this.fb.group({
            rucEmpresa: new FormControl(null),
            tipoGuia: new FormControl(null),
            idRemitente: new FormControl(null),
            numeroGuia: new FormControl(null),
            idTipoTraslado: new FormControl(null),
            idTipoTransporte: new FormControl(null),
            idDestinatario: new FormControl(null)
        });
    }

    ngOnInit(): void {
        this.formGroup.valueChanges.subscribe(() => {
            this.updateFilledCount();
        });
    }
    ngAfterViewInit(): void {
        this.loadRemitentes();
    }
    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }


    // Events

    evtClearControl(nameControl: string): void{
        this.formGroup.get(nameControl)?.setValue(null);
    }

    evtCloseMultiSelect(ms: MultiSelect) {
        ms.overlayVisible = false; // fuerza el cierre del overlay
    }

    evtFilterDestinatario(val: any): void{
        this.loadDestinatarios(val.target.value);
    }

    // Data

    loadRemitentes(): void{
        this.ldRemitentes = true;
        const sub = this.remitenteService.getToFilter().subscribe((res: RemitenteNombre[]) => {
            this.remitentes = res;
            this.ldRemitentes = false;
            this.cd.detectChanges();
        }, (error: any) => {
            this.alertService.showToast({
                title: 'No se pudo obtener los remitentes',
                icon: 'error'
            });
            this.ldRemitentes = false;
            this.cd.detectChanges();
        });
        this.subs.add(sub);
    }

    loadDestinatarios(search: string | null): void{
        this.ldDestinatarios = false;
        this.subDestinatario.unsubscribe();
        this.destinatarios.next([]);

        if(search){
            this.ldDestinatarios = true;
            this.subDestinatario = this.destinatarioService.buscar(search).subscribe({
                next: (val: DestinatarioBusqueda[]) => {
                    this.destinatarios.next(val);
                    this.ldDestinatarios = false;
                },
                error: () => {
                    this.alertService.showToast({
                        title: 'No se pudo obtener los remitentes',
                        icon: 'error'
                    });
                    this.ldDestinatarios = false;
                }
            });
        }
    }

    // functions

    private updateFilledCount() {
        this.countActived = Object.values(this.formGroup.controls)
        .filter(control => control.value !== null && control.value !== '')
        .length;
    }

}