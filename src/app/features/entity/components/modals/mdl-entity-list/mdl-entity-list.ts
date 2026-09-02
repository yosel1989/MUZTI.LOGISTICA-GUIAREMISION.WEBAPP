import { AfterViewInit, Component, DestroyRef, EventEmitter, inject, input, OnDestroy, OnInit, Output, signal } from "@angular/core";
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
import { AvatarModule } from "primeng/avatar";
import { Column } from "app/shared/models/table";
import { EntityDto, EntityListDto } from "@features/entity/models/entity";
import { EntityApiService } from "@features/entity/services/entity-service";
import { TableData } from "@core/models/table";

@Component({
    selector: 'app-mdl-entity-list',
    templateUrl: './mdl-entity-list.html',
    styleUrl: './mdl-entity-list.scss',
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

export class MdlEntityList implements OnInit, AfterViewInit, OnDestroy{
    _type = input<'empresa' | 'persona' | undefined>(undefined);

    api = inject(EntityApiService);
    alertService = inject(AlertService);
    destroyRef = inject(DestroyRef);

    @Output() OnClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() OnSelected: EventEmitter<EntityDto> = new EventEmitter<EntityDto>();

    empresas = signal<EntityListDto[]>([]);
    ldEmpresas = signal(false);

    ctrlRuc = new FormControl<string | null>({value: null, disabled: true});
    ctrlSearch = new FormControl<string | null>(null);
    cols: Column[] = [];

    data = signal<EntityListDto[]>([]);
    ldData = signal(false);

    ldDataById = signal(false);

    ldSelected = signal(false);
    selected : EntityListDto | null = null;

    sb = new Subscription();
    sbData : Subscription | undefined;

    placeholderLoading = 'Cargando ...';
    placeholder = 'Seleccionar ...';

    pageNumber = signal<number>(1);
    totalRecords = signal<number>(0);
    pageSize = signal<number>(10);
    rows = signal<number>(10);
    first = signal<number>(0);

    ngOnInit(): void {

        this.ctrlSearch.valueChanges.subscribe(() => {
            this.loadData();
        });
        this.cols = [
            {
                field: 'id',
                header: '#',
                thClassName: 'w-[50px]',
                tdClassName: 'font-semibold! ps-4!',
                render: (rowData: EntityListDto) => {
                    return `${rowData.id.toString().padStart(6, '0')}`;
                }
            },
            {
                field: 'document_type',
                header: 'T. Doc',
                thClassName: 'text-center!',
                tdClassName: 'text-center! font-medium!'
            },
            {
                field: 'name',
                header: 'Nombre o Razón Social',
                render: (rowData: EntityListDto) => {
                    return `
                        <div class="font-medium">${rowData.name ?? (rowData.first_name + ' ' + rowData.last_name)}</div>
                        <div>${rowData.document_number}</div>
                    `;
                }
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

    loadData(): void{
        this.sbData?.unsubscribe();
        this.ldData.set(true);
        const search = this.ctrlSearch.value;


        this.sbData = this.api.getList(1, 100, search, this._type() ?? null)
        .pipe(finalize(() => this.ldData.set(false)))
        .subscribe({
            next: (value: TableData<EntityListDto[]>) => {
                this.data.set(value.data);
                this.pageNumber.set(value.page_number);
                this.pageSize.set(value.page_size);
                this.first.set((this.pageNumber() - 1) * this.pageSize());
                this.totalRecords.set(value.total_records);
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
        this.ldDataById.set(true);
        this.api.getById(this.selected!.id!)
        .pipe(finalize(() => {
            this.ldDataById.set(false);
            this.ldSelected.set(false);
        }))
        .subscribe({
            next: (value: EntityDto) => {
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