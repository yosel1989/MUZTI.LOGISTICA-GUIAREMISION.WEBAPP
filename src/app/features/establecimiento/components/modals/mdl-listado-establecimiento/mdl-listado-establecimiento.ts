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
import { finalize, Subscriber, Subscription } from "rxjs";
import { SelectModule } from "primeng/select";
import { NgClass } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";

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

    empresas: EmpresaToSelectDto[] = [];
    ldEmpresas = signal(false);

    ctrlRuc = new FormControl<string | null>({value: null, disabled: true});
    ctrlSearch = new FormControl<string | null>(null);
    cols: TableColumn[] = [];

    data = signal<EstablecimientoListToModalDTO[]>([]);
    ldData = signal(false);

    ldDataById = signal(false);

    ldSelected = signal(false);
    selected: EstablecimientoListToModalDTO | null = null;

    sb = new Subscription();
    sbData : Subscription | undefined;

    placeholderLoading = 'Cargando ...';
    placeholder = 'Seleccionar ...';

    ngOnInit(): void {
        this.ctrlRuc.setValue(this.ruc);
        this.ctrlSearch.valueChanges.subscribe((val) => {
            this.loadData();
        });
        this.cols = [
            {
                field: 'id',
                header: 'COD',
                className: 'w-[50px]'
            },
            {
                field: 'descripcion',
                header: 'Descripción'
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
                this.empresas = value;
                this.ldEmpresas.set(false);
            },
            error: (err) => {
                this.alertService.showToast({
                    icon: "error",
                    title: 'No se puedo obtener el listado de empresas',
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
        const search = this.ctrlRuc.value;
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
                });
                this.OnClose.emit(true);
            },
        });
    }

    loadDataById(): void{
        this.ldDataById.set(true);
        const s = this.api.getById(this.selected?.id!)
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
                    title: err.error.detalle
                });
            },
        });
        this.sb.add(s);
    }

    // events 
    
    evtSelect(): void{
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