import { AfterViewInit, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from "@angular/core";
import { EmpresaApiService } from "@features/empresa/services/empresa-api.service";
import { EmpresaToSelectDto } from '@features/empresa/models/empresa.model';
import { AlertService } from "@core/services/alert.service";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { IconFieldModule } from "primeng/iconfield";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { TableColumn } from "@core/models/table";
import { EstablecimientoDTO, EstablecimientoListToModalDTO } from "@features/establecimiento/models/establecimiento.model";
import { SkeletonModule } from "primeng/skeleton";
import { EstablecimientoApiService } from "@features/establecimiento/services/establecimiento.service";
import { finalize, Subscription } from "rxjs";
import { SelectModule } from "primeng/select";
import { NgClass } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { SunatMotivoTrasladoEnum } from "@features/guia-remision/enums/guia-remision.enum";
import { SunatMotivoTrasladoDto } from "@features/catalogo/models/sunat-catalogo.model";

@Component({
    selector: 'app-mdl-listado-establecimiento',
    templateUrl: './mdl-listado-establecimiento.html',
    styleUrl: './mdl-listado-establecimiento.scss',
    imports: [
        InputIconModule,
        InputTextModule,
        TableModule,
        ButtonModule,
        IconFieldModule,
        ReactiveFormsModule,
        SkeletonModule,
        SelectModule,
        NgClass
    ]
})

export class MdlListadoEstablecimientoComponent implements OnInit, AfterViewInit, OnDestroy{

    empresaApiService = inject(EmpresaApiService);
    api = inject(EstablecimientoApiService);
    alertService = inject(AlertService);

    @Input() ruc: string | null = null;
    @Output() OnClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() OnSelected: EventEmitter<EstablecimientoDTO> = new EventEmitter<EstablecimientoDTO>();
    @Input() tipo: string | 'destinatario' | 'remitente' = 'remitente';
    @Input() motivoTraslado: SunatMotivoTrasladoDto | undefined;
    @Input() remitente: EstablecimientoDTO | undefined;

    empresas = signal<EmpresaToSelectDto[]>([]);
    ldEmpresas = signal(false);

    ctrlRuc = new FormControl<string | null>({value: null, disabled: true});
    ctrlSearch = new FormControl<string | null>(null);
    cols: TableColumn[] = [];

    data = signal<EstablecimientoListToModalDTO[]>([]);
    ldData = signal(false);

    ldDataById = signal(false);

    ldSelected = signal(false);
    selected : EstablecimientoListToModalDTO | null = null;

    sb = new Subscription();
    sbData : Subscription | undefined;

    placeholderLoading = 'Cargando ...';
    placeholder = 'Seleccionar ...';

    ngOnInit(): void {

        console.log(this.tipo, this.motivoTraslado, this.remitente);

        if(this.tipo === 'remitente'){
            this.ctrlRuc.setValue(this.ruc);
        }

        if(this.tipo === 'destinatario'){

            switch(this.motivoTraslado?.codigo_sunat){
                case SunatMotivoTrasladoEnum.venta: 
                 
                    this.ctrlRuc.enable();
                    break;
                case SunatMotivoTrasladoEnum.compra: 
                    this.ctrlRuc.setValue(this.ruc);
                    break;
                case SunatMotivoTrasladoEnum.traslado_establecimientos_misma_empresa: 
                console.log('misma empresa');
                    this.ctrlRuc.setValue(this.ruc);
                    break;
                case SunatMotivoTrasladoEnum.importacion: break;
                case SunatMotivoTrasladoEnum.exportacion: break;
                case SunatMotivoTrasladoEnum.otros: break;
                case SunatMotivoTrasladoEnum.venta_sujeta_confirmacion_comprador: break;
                case SunatMotivoTrasladoEnum.traslado_emisor_itinerante_comprobantes_pago: break;
                case SunatMotivoTrasladoEnum.traslado_zona_primaria: break;
                default: this.ctrlRuc.disable(); break;
            }

        }

        this.ctrlSearch.valueChanges.subscribe(() => {
            this.loadData();
        });
        this.cols = [
            {
                field: 'id',
                header: 'COD',
                className: 'w-[50px]'
            },
            {
                field: 'entidad',
                header: 'Entidad'
            },
            {
                field: 'descripcion',
                header: 'Local'
            },
            {
                field: 'codigo_sunat',
                header: 'Cod. Sunat'
            }
        ]
        this.loadEmpresas();
        this.loadData();
    }

    ngAfterViewInit(): void{

    }

    ngOnDestroy(): void {
        this.sbData?.unsubscribe();
        this.sb.unsubscribe();
    }

    // data 

    loadEmpresas(): void{
        this.ldEmpresas.set(true);
        const s = this.empresaApiService.loadAllToSelect().subscribe({
            next: (value: EmpresaToSelectDto[]) => {
                this.empresas.set(value.map(x => ({
                    ...x,
                    disabled: (this.motivoTraslado?.codigo_sunat === SunatMotivoTrasladoEnum.venta && this.remitente) ? this.remitente.ruc === x.ruc : false
                })));
                this.ldEmpresas.set(false);
            },
            error: (e: HttpErrorResponse) => {
                this.alertService.showToast({
                    icon: "error",
                    title: e.error.detalle,
                    timer: 4000,
                    showCloseButton: true
                });
                this.ldEmpresas.set(false);
            },
        });
        this.sb.add(s);
    }

    loadData(): void{
        this.sbData?.unsubscribe();
        this.ldData.set(true);
        const ruc = this.ctrlRuc.value!;
        const search = this.ctrlSearch.value;

        this.sbData = this.api.getAllToModalByRuc(ruc, search)
        .pipe(finalize(() => this.ldData.set(false)))
        .subscribe({
            next: (value: EstablecimientoListToModalDTO[]) => {
                this.data.set(value);
            },
            error: (err: HttpErrorResponse) =>  {
                this.alertService.showToast({
                    icon: "error",
                    title: err.error.detalle,
                    timer: 4000,
                    showCloseButton: true
                });
                this.OnClose.emit(true);
            },
        });
    }

    loadDataById(): void{
        console.log('cargando establecimiento por id', this.selected!.id);
        this.ldDataById.set(true);
        const s = this.api.getById(this.selected!.id!)
        .pipe(finalize(() => {
            this.ldDataById.set(false);
            this.ldSelected.set(false);
        }))
        .subscribe({
            next: (value: EstablecimientoDTO) => {
                console.log('establecimiento seleccionado', value);
                this.OnSelected.emit(value);
            },
            error: (err: HttpErrorResponse) =>  {
                this.alertService.showToast({
                    icon: "error",
                    title: err.error.detalle,
                    showCloseButton: true,
                    timer: 4000
                });
            },
        });
        this.sb.add(s);
    }

    // events 
    
    evtSelect(): void{
        console.log('establecimiento seleccionado', this.selected!);
        this.ldSelected.set(true);
        this.loadDataById();
    }

    evtOnClose(): void{
        this.OnClose.emit(true);
    }

    evtChangeEmpresa(): void{
        this.selected = null;
        this.loadData();
    }
}