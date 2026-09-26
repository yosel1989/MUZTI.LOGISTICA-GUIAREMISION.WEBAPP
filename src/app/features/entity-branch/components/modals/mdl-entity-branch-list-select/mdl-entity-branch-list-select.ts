import { NgClass } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { AfterViewInit, Component, DestroyRef, effect, EventEmitter, inject, OnDestroy, OnInit, Output, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MdlHeader } from "@core/components/modals/headers/mdl-header/mdl-header";
import { ErrorHandlerService } from "@core/handlers/error-handler.service";
import { EntityBranchListToModalDTO } from "@features/entity-branch/models/entity-branch";
import { EntityBranchApiService } from "@features/entity-branch/services/entity-branch-api-service";
import { MdlEntityList } from "@features/entity/components/modals/mdl-entity-list/mdl-entity-list";
import { EntityDto } from "@features/entity/models/entity";
import { EntityApiService } from "@features/entity/services/entity-service";
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
    selector: 'app-mdl-entity-branch-list-select',
    templateUrl: './mdl-entity-branch-list-select.html',
    styleUrl: './mdl-entity-branch-list-select.scss',
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

export class MdlEntityBranchListSelect implements OnInit, AfterViewInit, OnDestroy{

    entityApiService = inject(EntityApiService);
    api = inject(EntityBranchApiService);
    errorHandler = inject(ErrorHandlerService);
    dialogService = inject(DialogService);
    destroyRef = inject(DestroyRef);

    @Output() OnClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() OnSelected: EventEmitter<EntityBranchListToModalDTO> = new EventEmitter<EntityBranchListToModalDTO>();

    entitySelected = signal<EntityDto | undefined>(undefined);

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
            const entitySelected = this.entitySelected();
            if(entitySelected){
                this.loadData();
            }
        });
    }

    ngOnInit(): void {
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
                header: 'Local',
                render: (rowData: EntityBranchListToModalDTO) => {
                    return `
                        <div class="font-semibold">${rowData.description}</div>
                        <div>${rowData.address}</div>
                    `;
                }
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
            header: 'Seleccionar entidad',
            styleClass: 'max-h-none! slide-down-dialog',
            maskStyleClass: 'py-4',
            appendTo: 'body',
            templates: {
                header: MdlHeader
            },
            inputValues: {
                _type : 'empresa',
                _roles : 'emisor',
                _isInternal : true,
                _excludeId: undefined,
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

    // events 
    
    evtSelect(): void{

        this.ldSelected.set(true);
        this.OnSelected.emit(this.selected!);
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