import { AfterViewInit, Component, DestroyRef, EventEmitter, inject, OnDestroy, OnInit, Output, signal } from "@angular/core";
import { ErrorHandlerService } from "@core/handlers/error-handler.service";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { IconFieldModule } from "primeng/iconfield";
import { SkeletonModule } from "primeng/skeleton";
import { finalize } from "rxjs";
import { SelectModule } from "primeng/select";
import { NgClass } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { AvatarModule } from "primeng/avatar";
import { Column } from "app/shared/models/table";
import { EntityBySerieAssignedDto } from "@features/entity/models/entity";
import { EntityApiService } from "@features/entity/services/entity-service";

@Component({
    selector: 'app-mdl-entity-list-by-series-assigned',
    templateUrl: './mdl-entity-list-by-series-assigned.html',
    styleUrl: './mdl-entity-list-by-series-assigned.scss',
    imports: [
        InputIconModule,
        InputTextModule,
        TableModule,
        ButtonModule,
        IconFieldModule,
        SkeletonModule,
        SelectModule,
        NgClass,
        AvatarModule
    ]
})

export class MdlEntityListBySeriesAssigned implements OnInit, AfterViewInit, OnDestroy{

    api = inject(EntityApiService);
    errorHandler = inject(ErrorHandlerService);
    destroyRef = inject(DestroyRef);

    @Output() OnClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() OnSelected: EventEmitter<EntityBySerieAssignedDto> = new EventEmitter<EntityBySerieAssignedDto>();

    cols: Column[] = [];

    data = signal<EntityBySerieAssignedDto[]>([]);
    ldData = signal(false);

    ldSelected = signal(false);
    selected = signal<EntityBySerieAssignedDto | null>(null);

    placeholderLoading = 'Cargando ...';
    placeholder = 'Seleccionar ...';

    pageNumber = signal<number>(1);
    totalRecords = signal<number>(0);
    pageSize = signal<number>(10);
    rows = signal<number>(10);
    first = signal<number>(0);

    ngOnInit(): void {

        this.cols = [
            {
                field: 'count',
                header: '#',
                thClassName: 'w-[50px]',
                tdClassName: 'font-semibold! ps-4! text-center!',
                render : (rowData: EntityBySerieAssignedDto, rowIndex: number | undefined) => {
                    return `${(rowIndex ?? 0) + 1}`;
                }
            },
            {
                field: 'name',
                header: 'Nombre o Razón Social',
                render: (rowData: EntityBySerieAssignedDto) => {
                    return `
                        <div class="font-medium">${rowData.entity.name}</div>
                        <div>${rowData.entity.document_number}</div>
                    `;
                }
            },
            {
                field: 'entity_branch_serie',
                header: 'Serie',
                thClassName: 'text-center!',
                tdClassName: 'text-center! font-semibold!',
                render : (rowData: EntityBySerieAssignedDto) => {
                    return rowData.entity_branch_serie.serie;
                }
            },
            {
                field: 'entity_branch',
                header: 'Local',
                render : (rowData: EntityBySerieAssignedDto) => {
                    return `
                        <div class="font-medium">${rowData.entity_branch.description}</div>
                        <div>${rowData.entity_branch.address}</div>
                    `;
                }
            },
            
        ]
        this.loadData();
    }

    ngAfterViewInit(): void{

    }

    ngOnDestroy(): void {

    }

    // data 

    loadData(): void{
        this.ldData.set(true);
        this.api.getListBySeriesAssigned()
        .pipe(finalize(() => this.ldData.set(false)))
        .subscribe({
            next: (value: EntityBySerieAssignedDto[]) => {
                this.data.set(value);
                this.pageNumber.set(0);
                this.pageSize.set(value.length);
                this.first.set(0);
                this.totalRecords.set(value.length);
            },
            error: (err: HttpErrorResponse) =>  {
                this.errorHandler.handle(err);
                this.OnClose.emit(true);
            },
        });
    }

    // events 
    
    evtSelect(): void{
        this.OnSelected.emit(this.selected()!);
    }

    evtOnClose(): void{
        this.OnClose.emit(true);
    }
}