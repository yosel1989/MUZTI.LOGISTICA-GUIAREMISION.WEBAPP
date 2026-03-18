import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
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
import { AsyncPipe, NgClass } from "@angular/common";
import { ColumnsFilterDto } from "app/core/models/filter";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { heroQuestionMarkCircleMini } from "@ng-icons/heroicons/mini";
import { EmpresaApiService } from "@features/empresa/services/empresa-api.service";
import { EmpresaDto } from "@features/empresa/models/empresa.model";


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
        AsyncPipe,
        NgIcon,
        NgClass
    ],
    viewProviders: [provideIcons({ heroQuestionMarkCircleMini })]
})

export class FltGuiaRemisionPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    @Input() collapsed: boolean = false;
    @ViewChild('fechaRegistro') ctrlFechaRegistro: FltDateComponent | undefined;
    @ViewChild('fechaEmision') ctrlFechaEmision: FltDateComponent | undefined;

    filters = new BehaviorSubject<ColumnsFilterDto[]>([]);

    formGroup: FormGroup = new FormGroup({});
    tiposGuia: {label: string, value: string | null}[] = [ 
        { label: 'REMITENTE', value: TipoGuiaRemisionEnum.remitente }, 
        { label: 'TRANSPORTISTA', value: TipoGuiaRemisionEnum.transportista }
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

    empresas: EmpresaDto[] = [];
    ldEmpresas: boolean = false;

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
        private empresaApiService: EmpresaApiService
    ){
        this.formGroup = this.fb.group({
            fechaRegistro: new FormControl(null),
            fechaEmision: new FormControl(null),
            rucEmpresa: new FormControl(null),
            tipoGuia: new FormControl(null),
            idRemitente: new FormControl(null),
            serieGuia: new FormControl(null),
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
        this.loadEmpresas();
    }
    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    // Getters
    get f(): any{
        return this.formGroup.controls;
    }

    get request(): ColumnsFilterDto[]{
        const output: ColumnsFilterDto[] = [];
        this.ctrlFechaRegistro?.filter && output.push(this.ctrlFechaRegistro.filter);
        this.ctrlFechaEmision?.filter && output.push(this.ctrlFechaEmision.filter);
        this.f.idRemitente.value && output.push({data: 'id_remitente', search: { value: this.f.idRemitente.value.join(',') }});
        this.f.tipoGuia.value && output.push({data: 'tipo_guia', search: { value: this.f.tipoGuia.value }});
        this.f.rucEmpresa.value && output.push({data: 'ruc', search: { value: this.f.rucEmpresa.value }});
        this.f.serieGuia.value && output.push({data: 'serie_guia', search: { value: this.f.serieGuia.value }});
        this.f.numeroGuia.value && output.push({data: 'numero_guia', search: { value: this.f.numeroGuia.value }});
        this.f.idTipoTraslado.value && output.push({data: 'tipo_traslado', search: { value: this.f.idTipoTraslado.value }});
        this.f.idTipoTransporte.value && output.push({data: 'tipo_transporte', search: { value: this.f.idTipoTransporte.value }});
        this.f.idDestinatario.value && output.push({data: 'tipo_transporte', search: { value: this.f.idDestinatario.value }});
        return output;
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


    evtChangeFechaRegistro(data: ColumnsFilterDto | null){
        this.f.fechaRegistro.setValue(data ? this.ctrlFechaRegistro?.ctrlText.value : null);
    }

    evtChangeFechaEmision(data: ColumnsFilterDto | null){
        this.f.fechaEmision.setValue(data ? this.ctrlFechaEmision?.ctrlText.value : null);
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

    loadEmpresas(): void{
        this.ldEmpresas = false;
        const sub = this.empresaApiService.obtenerTodo().subscribe({
            next: (value: EmpresaDto[]) => {
                this.empresas = value;
                this.ldEmpresas = false;
            },
            error: () => {
                this.alertService.showToast({
                    title: 'No se pudo obtener los remitentes',
                    icon: 'error'
                });
                this.ldEmpresas = false;
            }
        });
        this.subs.add(sub);
    }

    // functions

    private updateFilledCount() {
        this.countActived = Object.values(this.formGroup.controls)
        .filter(control => control.value !== null && control.value !== '')
        .length;
        
        this.filters.next(this.request);
    }

}