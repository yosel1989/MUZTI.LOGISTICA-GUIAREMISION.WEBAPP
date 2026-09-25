import { NgClass } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { AfterViewInit, Component, DestroyRef, effect, EventEmitter, inject, input, Input, OnDestroy, OnInit, Output, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MdlHeader } from "@core/components/modals/headers/mdl-header/mdl-header";
import { ErrorHandlerService } from "@core/handlers/error-handler.service";
import { SunatMotivoTrasladoDto } from "@features/catalogo/models/sunat-catalogo.model";
import { EntityBranchDto, EntityBranchListToModalDTO } from "@features/entity-branch/models/entity-branch";
import { EntityBranchApiService } from "@features/entity-branch/services/entity-branch-api-service";
import { MdlEntityList } from "@features/entity/components/modals/mdl-entity-list/mdl-entity-list";
import { EntityBySerieAssigned_EntityDto, EntityDto } from "@features/entity/models/entity";
import { EntityApiService } from "@features/entity/services/entity-service";
import { SunatMotivoTrasladoEnum } from "@features/guia-remision/enums/guia-remision.enum";
import { Column } from "app/shared/models/table";
import { AvatarModule } from "primeng/avatar";
import { ButtonModule } from "primeng/button";
import { DialogService } from "primeng/dynamicdialog";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { SkeletonModule } from "primeng/skeleton";
import { TableModule } from "primeng/table";
import { finalize, Subscription } from "rxjs";

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
    errorHandler = inject(ErrorHandlerService);
    dialogService = inject(DialogService);
    destroyRef = inject(DestroyRef);

    entity = input<EntityDto | EntityBySerieAssigned_EntityDto | null>(null);
    @Output() OnClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() OnSelected: EventEmitter<EntityBranchDto> = new EventEmitter<EntityBranchDto>();
    @Input() tipo: string | 'destinatario' | 'remitente' = 'remitente';
    motivoTraslado  = input<SunatMotivoTrasladoDto | undefined>(undefined);
    @Input() remitente: EntityBranchDto | undefined;

    entitySelected = signal<EntityDto | EntityBySerieAssigned_EntityDto | undefined>(undefined);

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
    disabled = signal<boolean>(true);

    exclude = signal<number | null>(null);

    constructor(){
        effect(()=>{
            const entity = this.entity();
            if(entity){
                //untracked(() => this.entitySelected.set(entity));
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


        if(this.tipo === 'remitente'){
            switch(this.motivoTraslado()?.codigo_sunat){
                case SunatMotivoTrasladoEnum.recojo_bienes_transformados:
                    this.disabled.set(false);
                    break;
                default:
                    this.entitySelected.set(this.entity() ?? undefined);
                    break;
            }
        }

        if(this.tipo === 'destinatario'){
            switch(this.motivoTraslado()?.codigo_sunat){
                case SunatMotivoTrasladoEnum.venta: 
                case SunatMotivoTrasladoEnum.consignacion: 
                case SunatMotivoTrasladoEnum.devolucion: 
                    this.disabled.set(false);
                    this.exclude.set(this.entity()?.id ?? null);
                    break;
                case SunatMotivoTrasladoEnum.compra: 
                    this.entitySelected.set(this.entity() ?? undefined);
                    break;
                case SunatMotivoTrasladoEnum.traslado_establecimientos_misma_empresa: 
                case SunatMotivoTrasladoEnum.recojo_bienes_transformados: 
                case SunatMotivoTrasladoEnum.importacion:
                    this.entitySelected.set(this.entity() ?? undefined);
                    break;
                case SunatMotivoTrasladoEnum.exportacion: break;
                case SunatMotivoTrasladoEnum.otros: break;
                case SunatMotivoTrasladoEnum.venta_sujeta_confirmacion_comprador: break;
                case SunatMotivoTrasladoEnum.traslado_emisor_itinerante_comprobantes_pago: break;
                case SunatMotivoTrasladoEnum.traslado_zona_primaria: break;
                default: 
                    this.disabled.set(true);
                    break;
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
                field: 'code_sunat',
                header: 'Cod. Sunat'
            }
        ].filter(c => c !== null);
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
            header: 'Seleccionar ' + (this.tipo === 'destinatario' ? 'Entidad de Destino' : 'Empresa Emisora'),
            styleClass: 'max-h-none! slide-down-dialog',
            maskStyleClass: 'py-4',
            appendTo: 'body',
            templates: {
                header: MdlHeader
            },
            inputValues: {
                _type : 'empresa',
                _roles : this.tipo === 'remitente' ? 'emisor' : undefined,
                _isInternal : undefined,
                _excludeId: this.exclude() ?? undefined,
                _hasBranch: true
            }
        });

        this.modalRef?.onChildComponentLoaded
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((childComponent: MdlEntityList) => {
            childComponent.OnSelected
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((entity: EntityDto) => {
                this.entitySelected.set(entity);
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
                this.errorHandler.handle(err);
                this.OnClose.emit(true);
            },
        });
    }

    loadDataById(): void{
        this.ldDataById.set(true);
        const s = this.api.getById(this.selected!.id!)
        .pipe(finalize(() => {
            this.ldDataById.set(false);
            this.ldSelected.set(false);
        }))
        .subscribe({
            next: (value: EntityBranchDto) => {
                this.OnSelected.emit(value);
            },
            error: (err: HttpErrorResponse) =>  {
                this.errorHandler.handle(err);
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