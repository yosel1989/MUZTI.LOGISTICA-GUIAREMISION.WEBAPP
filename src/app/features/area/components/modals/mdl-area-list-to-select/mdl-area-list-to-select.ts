import { NgClass } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { AfterViewInit, Component, DestroyRef, EventEmitter, inject, OnDestroy, OnInit, Output, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ErrorHandlerService } from "@core/handlers/error-handler.service";
import { AreaToSelectDto } from "@features/area/models/area";
import { AreaApiService } from "@features/area/services/area-api.service";
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
import { finalize } from "rxjs";

@Component({
    selector: 'app-mdl-area-list-to-select',
    templateUrl: './mdl-area-list-to-select.html',
    styleUrl: './mdl-area-list-to-select.scss',
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

export class MdlAreaListToSelect implements OnInit, AfterViewInit, OnDestroy{

    api = inject(AreaApiService);
    errorHandler = inject(ErrorHandlerService);
    dialogService = inject(DialogService);
    destroyRef = inject(DestroyRef);

    @Output() OnClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() OnSelected: EventEmitter<AreaToSelectDto> = new EventEmitter<AreaToSelectDto>();

    cols: Column[] = [];

    data = signal<AreaToSelectDto[]>([]);
    ldData = signal(false);


    ldSelected = signal(false);
    selected : AreaToSelectDto | null = null;

    placeholderLoading = 'Cargando ...';
    placeholder = 'Seleccionar ...';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modalRef: any | undefined;


    ngOnInit(): void {
        this.cols = [
            {
                field: 'id',
                header: '#',
                className: 'w-[50px]',
                tdClassName: 'font-semibold! ps-4!'
            },
            {
                field: 'name',
                header: 'Local',
                tdClassName: 'font-semibold! uppercase! '
            },
            {
                field: 'code',
                header: 'Código'
            }
        ];
        this.loadData();
    }

    ngAfterViewInit(): void{

    }

    ngOnDestroy(): void {
    }

    // data 

    loadData(): void{

        this.ldData.set(true);

        this.api.getToSelect()
        .pipe(
            finalize(() => this.ldData.set(false)),
            takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
            next: (value: AreaToSelectDto[]) => {
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

}