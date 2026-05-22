import { AfterViewInit, ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit, signal, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { TipoGuiaRemisionEnum } from "@features/guia-remision/enums/guia-remision.enum";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { PanelModule } from 'primeng/panel';
import { SelectModule } from "primeng/select";
import { TooltipModule } from "primeng/tooltip";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { OnlyNumberDirective } from "app/core/directives/only-numbers.directive";
import { AlertService } from "app/core/services/alert.service";
import { BehaviorSubject, finalize, Subscription } from "rxjs";
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { FltDateComponent } from "app/core/components/filters/flt-date/flt-date";
import { DestinatarioSugeridoDto } from "@features/destinatario/models/destinatario";
import { NgClass } from "@angular/common";
import { ColumnsFilterDto } from "app/core/models/filter";
import { provideIcons } from "@ng-icons/core";
import { heroQuestionMarkCircleMini } from "@ng-icons/heroicons/mini";
import { EmpresaApiService } from "@features/empresa/services/empresa-api.service";
import { EmpresaToSelectDto } from "@features/empresa/models/empresa.model";
import { SunatMotivoTrasladoDto } from "@features/catalogo/models/sunat-catalogo.model";
import { EstablecimientoListToSelectDTO } from "@features/establecimiento/models/establecimiento.model";
import { EstablecimientoApiService } from "@features/establecimiento/services/establecimiento.service";
import { HttpErrorResponse } from "@angular/common/http";
import { SunatCatalogoApiService } from "@features/catalogo/services/sunat-catalogo-api.service";
import { GuiaRemisionEstadoApiService } from "@features/guia-remision-estado/services/guia-remision-estado.service";
import { GuiaRemisionEstadoDTO } from "@features/guia-remision-estado/models/guia-remision-estado.model";


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
        NgClass
    ],
    viewProviders: [provideIcons({ heroQuestionMarkCircleMini })]
})

export class FltGuiaRemisionPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    private establecimientoApiService = inject(EstablecimientoApiService);
    private alertService = inject(AlertService);
    private empresaApiService = inject(EmpresaApiService);
    private sunatCatalogoApiService = inject(SunatCatalogoApiService);
    private guiaRemisionEstadoApiService = inject(GuiaRemisionEstadoApiService);

    @Input() collapsed: boolean = false;
    @ViewChild('fechaRegistro') ctrlFechaRegistro: FltDateComponent | undefined;
    @ViewChild('fechaEmision') ctrlFechaEmision: FltDateComponent | undefined;

    filters = new BehaviorSubject<ColumnsFilterDto[]>([]);

    formGroup: FormGroup = new FormGroup({});
    tiposGuia: {label: string, value: string | null}[] = [ 
        { label: 'REMITENTE', value: TipoGuiaRemisionEnum.remitente }, 
        { label: 'TRANSPORTISTA', value: TipoGuiaRemisionEnum.transportista }
    ];

    tiposTraslado: SunatMotivoTrasladoDto[] = [];

    tiposTransporte: {label: string, value: string | null}[] = [ 
        { label: 'PUBLICO', value: 'PUBLICO' }, 
        { label: 'PRIVADO', value: 'PRIVADO' }
    ];

    estadosGuia: {label: string, value: string | null}[] = [ 
        { label: 'CREADO', value: 'CREADO' },
        { label: 'ENVIADO', value: 'ENVIADO' }
    ];

    establecimientosRemitente = signal<EstablecimientoListToSelectDTO[]>([]);
    ldEstablecimientosRemitente = signal(false);

    establecimientosDestinatario = signal<EstablecimientoListToSelectDTO[]>([]);
    ldEstablecimientosDestinatario = signal(false);

    motivosTraslado = signal<SunatMotivoTrasladoDto[]>([]);
    ldMotivosTraslado = signal(false);

    guiaRemisionEstados = signal<GuiaRemisionEstadoDTO[]>([]);
    ldGuiaRemisionEstados = signal(false);


    empresas = signal<EmpresaToSelectDto[]>([]);
    ldEmpresas = signal(false);

    private subs = new Subscription();
    countActived = 0;

    destinatarios = new BehaviorSubject<DestinatarioSugeridoDto[]>([]);
    destinatarios$ = this.destinatarios.asObservable();
    ldDestinatarios: boolean = false;
    subDestinatario = new Subscription();

    constructor(
        private fb: FormBuilder,
        private cd: ChangeDetectorRef
    ){
        this.formGroup = this.fb.group({
            fechaRegistro: new FormControl(null),
            fechaEmision: new FormControl(null),
            remitenteId: new FormControl(null),
            establecimientoRemitenteId: new FormControl(null),
            destinatarioId: new FormControl(null),
            establecimientoDestinatarioId: new FormControl(null),
            serieGuia: new FormControl(null),
            numeroGuia: new FormControl(null),
            motivoTrasladoId: new FormControl(null),
            idTipoTransporte: new FormControl(null),
            estadoGuia: new FormControl(null),
        });

        this.formGroup.get('remitenteId')?.valueChanges.subscribe((val)=>{
            this.establecimientosRemitente.set([]);
            this.formGroup.get('establecimientoRemitenteId')?.setValue(null);
            val && this.loadEstablecimientos('remitente', val)
        });

        this.formGroup.get('destinatarioId')?.valueChanges.subscribe((val)=>{
            this.establecimientosDestinatario.set([]);
            this.formGroup.get('establecimientoDestinatarioId')?.setValue(null);
            val && this.loadEstablecimientos('destinatario', val)
        });
    }

    ngOnInit(): void {
        this.loadEntidades();
        this.loadMotivosTraslado();
        this.loadGuiaRemisionEstados();
        this.formGroup.valueChanges.subscribe(() => {
            this.updateFilledCount();
        });
    }

    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    // Getters
    get f(): any{
        return this.formGroup.controls;
    }

    get request(): ColumnsFilterDto[]{
        console.log('ctrlFechaRegistro', this.ctrlFechaRegistro?.filter);
        const output: ColumnsFilterDto[] = [];
        this.ctrlFechaRegistro?.filter && output.push(this.ctrlFechaRegistro.filter);
        this.ctrlFechaEmision?.filter && output.push(this.ctrlFechaEmision.filter);
        this.f.remitenteId.value && output.push({data: 'remitente', search: { value: this.f.remitenteId.value }});
        this.f.establecimientoRemitenteId.value && output.push({data: 'remitente_id', search: { value: this.f.establecimientoRemitenteId.value }});
        this.f.destinatarioId.value && output.push({data: 'destinatario', search: { value: this.f.destinatarioId.value }});
        this.f.establecimientoDestinatarioId.value && output.push({data: 'destinatario_id', search: { value: this.f.establecimientoDestinatarioId.value }});
        //this.f.tipoGuia.value && output.push({data: 'tipo_guia', search: { value: this.f.tipoGuia.value }});
        this.f.serieGuia.value && output.push({data: 'serie_guia', search: { value: this.f.serieGuia.value }});
        this.f.numeroGuia.value && output.push({data: 'correlativo', search: { value: this.f.numeroGuia.value }});
        this.f.motivoTrasladoId.value && output.push({data: 'motivo_traslado_id', search: { value: this.f.motivoTrasladoId.value.join(',') }});
        this.f.idTipoTransporte.value && output.push({data: 'tipo_transporte', search: { value: this.f.idTipoTransporte.value }});
        this.f.estadoGuia.value && output.push({data: 'estado', search: { value: this.f.estadoGuia.value }});
        return output;
    }

    // Events

    evtClearControl(nameControl: string): void{
        this.formGroup.get(nameControl)?.setValue(null);
    }

    evtCloseMultiSelect(ms: MultiSelect) {
        ms.overlayVisible = false; // fuerza el cierre del overlay
    }

    evtChangeFechaRegistro(data: ColumnsFilterDto | null){
        this.f.fechaRegistro.setValue(data ? this.ctrlFechaRegistro?.ctrlText.value : null);
    }

    evtChangeFechaEmision(data: ColumnsFilterDto | null){
        this.f.fechaEmision.setValue(data ? this.ctrlFechaEmision?.ctrlText.value : null);
    }

    evtClearAll(): void{
        this.ctrlFechaRegistro?.evtClear();
        this.ctrlFechaEmision?.evtClear();
        this.formGroup.reset();
    }

    // Data

    loadEntidades(): void{
        this.ldEmpresas.set(false);
        const sub = this.empresaApiService.loadAllToSelect().subscribe({
            next: (value: EmpresaToSelectDto[]) => {
                this.empresas.set(value);
                this.ldEmpresas.set(false);
            },
            error: () => {
                this.alertService.showToast({
                    title: 'No se pudo obtener las entidades',
                    icon: 'error',
                    timer: 4000,
                    showCloseButton: true
                });
                this.ldEmpresas.set(false);
            }
        });
        this.subs.add(sub);
    }

    loadEstablecimientos(tipo: string | 'remitente' | 'destinatario', ruc: string): void{
        if(tipo === 'remitente'){
            this.ldEstablecimientosRemitente.set(true);
        }else{
            this.ldEstablecimientosDestinatario.set(true);
        }

        const s = this.establecimientoApiService.getAllToSelectByRuc(ruc)
        .pipe(finalize(()=>{
            this.ldEstablecimientosRemitente.set(false);
            this.ldEstablecimientosDestinatario.set(false);
        }))
        .subscribe({
            next: (value) => {
                if(tipo === 'remitente'){
                    this.establecimientosRemitente.set(value);
                }else{
                    this.establecimientosDestinatario.set(value);
                }
            },
            error: (err: HttpErrorResponse) => {
                this.alertService.showToast({
                    title: err.error.detalle,
                    icon: 'error',
                    timer: 4000,
                    timerProgressBar: true,
                    showCloseButton: true
                });
            }
        });
        this.subs.add(s);
    }

    loadMotivosTraslado(): void{
        this.ldMotivosTraslado.set(true);
        const s = this.sunatCatalogoApiService.loadMotivosTraslado()
        .pipe(finalize(()=>{
            this.ldMotivosTraslado.set(false);
        }))
        .subscribe({
            next: (val: SunatMotivoTrasladoDto[]) => {
                this.motivosTraslado.set(val);
            },
            error : (err: HttpErrorResponse) => {
                this.alertService.showToast({
                    title: err.error.detalle,
                    icon: 'error',
                    timer: 4000,
                    timerProgressBar: true,
                    showCloseButton: true
                })
            }
        });
        this.subs.add(s);
    }

    loadGuiaRemisionEstados(): void{
        this.ldGuiaRemisionEstados.set(true);
        const s = this.guiaRemisionEstadoApiService.getAll()
        .pipe(finalize(()=>{
            this.ldGuiaRemisionEstados.set(false);
        }))
        .subscribe({
            next : (value: GuiaRemisionEstadoDTO[]) => {
                this.guiaRemisionEstados.set(value);
            },
            error: (err: HttpErrorResponse) => {
                this.alertService.showToast({
                    title: err.error.detalle,
                    icon: 'error',
                    timer: 4000,
                    timerProgressBar: true,
                    showCloseButton: true
                })
            }
        })
    }

    // functions

    private updateFilledCount() {
        this.countActived = Object.values(this.formGroup.controls)
        .filter(control => control.value !== null && control.value !== '')
        .length;
        
        this.filters.next(this.request);
    }

}