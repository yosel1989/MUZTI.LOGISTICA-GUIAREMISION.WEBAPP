import { AfterViewInit, Component, DestroyRef, effect, EventEmitter, inject, input, Input, OnDestroy, OnInit, Output, signal } from "@angular/core";
import { AlertService } from "@core/services/alert.service";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { IconFieldModule } from "primeng/iconfield";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { SkeletonModule } from "primeng/skeleton";
import { finalize, Subscription } from "rxjs";
import { SelectModule } from "primeng/select";
import { NgClass } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { SunatMotivoTrasladoEnum } from "@features/guia-remision/enums/guia-remision.enum";
import { SunatMotivoTrasladoDto } from "@features/catalogo/models/sunat-catalogo.model";
import { AvatarModule } from "primeng/avatar";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Column } from "app/shared/models/table";
import { EntityDto } from "@features/entity/models/entity";
import { EntityApiService } from "@features/entity/services/entity-service";
import { DialogService } from "primeng/dynamicdialog";
import { MdlEntityList } from "@features/entity/components/modals/mdl-entity-list/mdl-entity-list";
import { MdlHeader } from "@core/components/modals/headers/mdl-header/mdl-header";
import { EntityBranchApiService } from "@features/entity-branch/services/establecimiento.service";
import { EntityBranchDto, EntityBranchListToModalDTO } from "@features/entity-branch/models/entity-branch";

@Component({
    selector: 'app-mdl-entity-branch-list',
    templateUrl: './mdl-entity-branch-list.html',
    styleUrl: './mdl-entity-branch-list.scss',
    imports: [
        InputIconModule,
        InputTextModule,
        TableModule,
        ButtonModule,
        IconFieldModule,
        ReactiveFormsModule,
        SkeletonModule,
        SelectModule,
        NgClass,
        AvatarModule
    ]
})

export class MdlEntityBranchList implements OnInit, AfterViewInit, OnDestroy{

    entityApiService = inject(EntityApiService);
    api = inject(EntityBranchApiService);
    alertService = inject(AlertService);
    dialogService = inject(DialogService);
    destroyRef = inject(DestroyRef);

    entity = input<EntityDto | null>(null);
    @Output() OnClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() OnSelected: EventEmitter<EntityBranchDto> = new EventEmitter<EntityBranchDto>();
    @Input() tipo: string | 'destinatario' | 'remitente' = 'remitente';
    @Input() motivoTraslado: SunatMotivoTrasladoDto | undefined;
    @Input() remitente: EntityBranchDto | undefined;

    entitySelected = signal<EntityDto | undefined>(undefined);

    ctrlRuc = new FormControl<number | null>({value: null, disabled: true});
    ctrlSearch = new FormControl<string | null>(null);
    cols: Column[] = [];

    data = signal<EntityBranchListToModalDTO[]>([]);
    ldData = signal(false);

    ldDataById = signal(false);

    ldSelected = signal(false);
    selected : EntityBranchListToModalDTO | null = null;

    sb = new Subscription();
    sbData : Subscription | undefined;

    placeholderLoading = 'Cargando ...';
    placeholder = 'Seleccionar ...';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modalRef: any | undefined;

    constructor(){
        effect(()=>{
            const entity = this.entity();
            if(entity){
                this.entitySelected.set(entity);
                this.loadData();
            }
        });

        effect(()=>{
            const entitySelected = this.entitySelected();
            if(entitySelected){
                this.loadData();
            }
        });
    }

    ngOnInit(): void {
        console.log('entidad', this.entity());

        //console.log(this.tipo, this.motivoTraslado, this.remitente);

        if(this.tipo === 'remitente'){
            switch(this.motivoTraslado?.codigo_sunat){
                case SunatMotivoTrasladoEnum.recojo_bienes_transformados:
                    this.ctrlRuc.enable();
                    break;
                default:
                    this.ctrlRuc.setValue(this.entity()?.id ?? null);
                    break;
            }
        }

        if(this.tipo === 'destinatario'){

            switch(this.motivoTraslado?.codigo_sunat){
                case SunatMotivoTrasladoEnum.venta: 
                case SunatMotivoTrasladoEnum.consignacion: 
                case SunatMotivoTrasladoEnum.devolucion: 
                    this.ctrlRuc.enable();
                    break;
                case SunatMotivoTrasladoEnum.compra: 
                    this.ctrlRuc.setValue(this.entity()?.id ?? null);
                    break;
                case SunatMotivoTrasladoEnum.traslado_establecimientos_misma_empresa: 
                case SunatMotivoTrasladoEnum.recojo_bienes_transformados: 
                case SunatMotivoTrasladoEnum.importacion:
                    this.ctrlRuc.setValue(this.entity()?.id ?? null);
                    break;
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
                header: '#',
                className: 'w-[50px]',
                tdClassName: 'font-semibold! ps-4!'
            },
            {
                field: 'description',
                header: 'Local'
            },
            {
                field: 'area',
                header: 'Area'
            },
            {
                field: 'serie',
                header: 'Serie'
            },
            {
                field: 'code_sunat',
                header: 'Cod. Sunat'
            }
        ]
        this.loadData();
    }

    ngAfterViewInit(): void{

    }

    ngOnDestroy(): void {
        this.sbData?.unsubscribe();
        this.sb.unsubscribe();
    }

    // data 

    evtShowEntityList(): void{

        this.modalRef = this.dialogService.open(MdlEntityList, {
            width: '700px',
            closable: false,
            draggable: false,
            modal: true,
            position: 'top',
            header: 'Seleccionar Empresa',
            styleClass: 'max-h-none! slide-down-dialog',
            maskStyleClass: 'py-4',
            appendTo: 'body',
            templates: {
                header: MdlHeader
            },
            inputValues: {
                _type : 'empresa',
                _roles : this.tipo === 'remitente' ? 'emisor' : undefined,
                _isInternal : undefined
            }
        });

        this.modalRef?.onChildComponentLoaded
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((childComponent: MdlEntityList) => {
            childComponent.OnSelected
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((entity: EntityDto) => {
                this.entitySelected.set(entity);
                this.ctrlRuc.setValue(entity.id);
                this.modalRef?.close();
            });
            childComponent.OnClose
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.modalRef?.close();
            });
        });

    }

    
    loadData(): void{
        if(this.entitySelected() === undefined){
            return;
        }

        this.sbData?.unsubscribe();
        this.ldData.set(true);
        const entityId = this.entitySelected()!.id;
        const search = this.ctrlSearch.value;

        this.sbData = this.api.getAllToModalByRuc(entityId, search)
        .pipe(finalize(() => this.ldData.set(false)))
        .subscribe({
            next: (value: EntityBranchListToModalDTO[]) => {
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
            next: (value: EntityBranchDto) => {
                //console.log('establecimiento seleccionado', value);
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
        //console.log('establecimiento seleccionado', this.selected!);
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

    // functions

    /*disabledOptions(item: EmpresaToSelectDto): boolean{
        // Solo sí el motivo de traslado es igual a 'Recojo de bienes transformados' y es para seleccionar el remitente, se deshabilita la opción que tenga el mismo ruc al emisor
        if( (this.motivoTraslado?.codigo_sunat === SunatMotivoTrasladoEnum.recojo_bienes_transformados && this.tipo === 'remitente') && this.entityId === item.ruc)
            return true;

        if( (this.motivoTraslado?.codigo_sunat === SunatMotivoTrasladoEnum.venta && this.remitente) && this.remitente.entity_document_number === item.ruc ) 
            return true;
        return false;
    }*/
}