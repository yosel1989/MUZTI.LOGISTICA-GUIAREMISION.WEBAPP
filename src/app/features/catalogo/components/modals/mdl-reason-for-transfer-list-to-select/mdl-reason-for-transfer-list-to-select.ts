import { NgClass } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { AfterViewInit, Component, DestroyRef, EventEmitter, inject, OnDestroy, OnInit, Output, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ErrorHandlerService } from "@core/handlers/error-handler.service";
import { SunatMotivoTrasladoDto } from "@features/catalogo/models/sunat-catalogo.model";
import { SunatCatalogoApiService } from "@features/catalogo/services/sunat-catalogo-api.service";
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
    selector: 'app-mdl-reason-for-transfer-list-to-select',
    templateUrl: './mdl-reason-for-transfer-list-to-select.html',
    styleUrl: './mdl-reason-for-transfer-list-to-select.scss',
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

export class MdlReasonForTransferListToSelect implements OnInit, AfterViewInit, OnDestroy{

    api = inject(SunatCatalogoApiService);
    errorHandler = inject(ErrorHandlerService);
    dialogService = inject(DialogService);
    destroyRef = inject(DestroyRef);

    @Output() OnClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() OnSelected: EventEmitter<SunatMotivoTrasladoDto> = new EventEmitter<SunatMotivoTrasladoDto>();

    cols: Column[] = [];

    data = signal<SunatMotivoTrasladoDto[]>([]);
    ldData = signal(false);


    ldSelected = signal(false);
    selected : SunatMotivoTrasladoDto | null = null;

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
                field: 'nombre',
                header: 'Local',
                tdClassName: 'font-semibold! uppercase! '
            },
            {
                field: 'codigo_sunat',
                header: 'Cod. Sunat'
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

        this.api.loadMotivosTraslado()
        .pipe(
            finalize(() => this.ldData.set(false)),
            takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
            next: (value: SunatMotivoTrasladoDto[]) => {
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