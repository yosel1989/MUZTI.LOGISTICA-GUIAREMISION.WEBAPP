import { DatePipe, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, computed, DestroyRef, EventEmitter, inject, input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
import { LoaderComponent } from 'app/core/components/loaders/loader/loder.component';
import { ColumnsFilterDto } from 'app/core/models/filter';
import { TableData } from 'app/core/models/table';
import { AlertService } from 'app/core/services/alert.service';
import { ErrorHandlerService } from '@core/handlers/error-handler.service';
import { UtilService } from 'app/core/services/util.service';
import { Column } from 'app/shared/models/table';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule, TableRowSelectEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, Subscription } from 'rxjs';
import { StorageService } from '@core/services/storage.service';
import { PopoverModule } from 'primeng/popover';
import { ListboxModule } from 'primeng/listbox';
import { SecurityPersonalDto } from '@features/security-personal/models/security-personal';
import { AvatarModule } from 'primeng/avatar';
import { SecurityPersonalReasonForTransferApiService } from '@features/security-personal-reason-for-transfer/services/security-personal-reason-for-transfer-api.service';
import { SecurityPersonalReasonForTransferDeleteDto, SecurityPersonalReasonForTransferDto } from '@features/security-personal-reason-for-transfer/models/security-personal-reason-for-transfer';
import { MdlReasonForTransferListToSelect } from '@features/catalogo/components/modals/mdl-reason-for-transfer-list-to-select/mdl-reason-for-transfer-list-to-select';
import { MdlHeader } from '@core/components/modals/headers/mdl-header/mdl-header';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SunatMotivoTrasladoDto } from '@features/catalogo/models/sunat-catalogo.model';

@Component({
  selector: 'app-tbl-security-personal-reason-for-transfer-principal',
  templateUrl: './tbl-security-personal-reason-for-transfer-principal.html',
  styleUrl: './tbl-security-personal-reason-for-transfer-principal.scss',
  imports: [
        TableModule,
        SkeletonModule,
        TagModule,
        ToolbarModule,
        ButtonModule,
        DividerModule,
        IconFieldModule,
        InputIconModule,
        TooltipModule,
        InputTextModule,
        ConfirmDialogModule,
        LoaderComponent,
        ReactiveFormsModule,
        NgClass,

        PopoverModule,
        ListboxModule,
        FormsModule,
        AvatarModule
  ],
  providers: [DialogService, ConfirmationService, DatePipe],
  animations: [fadeDownAnimation]
})

export class TblSecurityPersonalReasonForTransferPrincipal implements OnInit, AfterViewInit, OnDestroy{

    private IDTABLE = 'tbl-security-personal-reason-for-transfer-principal';

    private datePipe = inject(DatePipe);
    private destroyRef = inject(DestroyRef);
    public dialogService = inject(DialogService);
    private api = inject(SecurityPersonalReasonForTransferApiService);
    public util = inject(UtilService);
    private alertService = inject(AlertService);
    private errorHandler = inject(ErrorHandlerService);
    private storageService = inject(StorageService);
    private confirmationService = inject(ConfirmationService);

    securityPersonal = input.required<SecurityPersonalDto>();
    @Output() OnUpdate = new EventEmitter<boolean>();

    cols = signal<Column[]>([]);

    colsVisibled = computed(() =>
      this.cols()
        .filter(col => col.visible)
    );

    colsFilter = computed(() =>
      this.cols()
        .filter(col => col.canVisible)
        .map(col => ({
          field: col.field,
          name: col.header,
          checked: col.visible ?? true
        }))
    );

    selectedColumns = computed(() =>
      this.cols()
        .filter(col => col.visible && col.canVisible)
        .map(col => col.field)
    );
    
    data = signal<SecurityPersonalReasonForTransferDto[]>([]);
    ldData = signal(true);
    selected = signal<SecurityPersonalReasonForTransferDto | undefined>(undefined);
    loading = signal(false);

    recordsTotalTable: number = 0;
    recordsTotal: number = 0;
    recordsFiltered: number = 0;
    first: number = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: any | undefined;
    private subs = new Subscription();

    pageNumber = signal(1);
    pageSize = signal(5);
    totalRecords = signal(0);

    firstChange: boolean = false;

    filters: ColumnsFilterDto[] = [];
    search: string | null = null;

    subData: Subscription | undefined = undefined;
    ctrlSearch = new FormControl(null);

    paddedData = computed<(SecurityPersonalReasonForTransferDto | { __empty: boolean })[]>(() => {
      const actual = this.data() ?? [];
      const fillerCount = this.pageSize() - actual.length;
      const fillerRows = Array.from({ length: fillerCount }, () => ({ __empty: true }));
      return [...actual, ...fillerRows];
    });


    ngOnInit(): void{
      this.cols.set([
          { field: 'select', header: '', sort: false, sticky: false},
          { field: 'cod', header: '#', sort: false, sticky: false},
          { field: 'reason_for_transfer_name', header: 'Motivo de Traslado', sort: false, sticky: false, canVisible: true, tdClassName: 'font-semibold! uppercase!' },
          { field: 'reason_for_transfer_code_sunat', header: 'Cod. Sunat', sort: false, sticky: false, canVisible: true, tdClassName: 'text-center!' },
          { field: 'created_at', header: 'F. Registro', sort: false, sticky: false, canVisible: true, render: (rowData: SecurityPersonalReasonForTransferDto) => {
            return this.datePipe.transform(rowData.created_at, 'dd/MM/yyyy HH:mm:ss a');
          }},
          { field: 'created_at_user', header: 'U. Registro', sort: false, sticky: false, canVisible: true },
          { field: 'options', header: '<i class="fa-light fa-columns-3"></i>', sort: false, sticky: true, alignFrozen: 'right', thClassName: 'text-center!'},
        ]);

        this.cols.set(this.storageService.loadTable(this.IDTABLE, this.cols()));

    }

    ngAfterViewInit(): void{
      this.ctrlSearch.valueChanges.subscribe((val: string | null) => {
        this.search = val;
        this.evtOnReload();
      });
      this.loadData();
    }

    ngOnDestroy(): void{
      this.subs.unsubscribe();
      this.subData?.unsubscribe();
    }

    // data
    loadData(reload: boolean = false): void {
      this.subData?.unsubscribe();
      this.selected.set(undefined);
      this.firstChange = false;
      this.loading.set(true);
      this.ldData.set(true);

      if(reload){
        this.pageNumber.set(1);
        this.first = 0;
      }

      this.subData = this.api.getCollection(this.securityPersonal().id, this.pageNumber(), this.pageSize(), this.search)
      .pipe(finalize(() => {
        this.loading.set(false);
        this.ldData.set(false);
      }))
      .subscribe({
        next: (res: TableData<SecurityPersonalReasonForTransferDto[]>) => {
          
          this.data.set(res.data.map(x => {
            x.created_at = new Date(x.created_at);
            x.loading_active = false;
            x.loading_update = false;
            return x;
          }));

          this.pageNumber.set(res.page_number);
          this.pageSize.set(res.page_size);
          this.first = (this.pageNumber() - 1) * this.pageSize();
          this.totalRecords.set(res.total_records);
        },
        error: (e: HttpErrorResponse) => {
          this.data.set([]);

          this.errorHandler.handle(e);
        }
      });
    }

    //events
    evtToggleSelection(row: SecurityPersonalReasonForTransferDto): void{
      if (this.selected() === row) {
        this.selected.set(undefined);
      } else {
        this.selected.set(row);
      }
    }

    evtNext() {
      /*this.queryParams = {
        ...this.queryParams!,
        start : this.first + this.queryParams!.length 
      };*/

      this.reload();
    }

    evtPrev() {
      /*this.first = this.first - this.queryParams!.length;*/
      this.reload();
    }

    private evtOnReload(): void{
      this.selected.set(undefined);
      this.loadData();
    }

    evtOnCreate(): void{
      this.ref = this.dialogService.open(MdlReasonForTransferListToSelect,  {
        width: '700px',
        closable: false,
        draggable: false,
        modal: true,
        position: 'top',
        header: 'Seleccionar motivo de traslado',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        templates: {
          header: MdlHeader
        }
      });

      this.ref.onChildComponentLoaded
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cmp: MdlReasonForTransferListToSelect) => {
        
        cmp?.OnSelected
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((value: SunatMotivoTrasladoDto) => {
          this.handlerSelectedReasonForTransfer(value);
          this.ref?.close();
        });
        
        cmp?.OnClose
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.ref?.close();
        });
      });

    }

    evtOnDelete(data: SecurityPersonalReasonForTransferDto): void{
      this.selected.set(data);
      this.confirmationService.confirm({
          header: '¿Quitar el motivo de traslado de los asignados?',
          message: 'Confirmar la operación.',
          accept: () => {

              this.api.delete(data.security_person_id, data.reason_for_transfer_id)
              .pipe(
                takeUntilDestroyed(this.destroyRef)
              )
              .subscribe({
                next: () => {

                  this.alertService.success("Se quito el motivo de traslado de la lista de asignados.");
                  this.OnUpdate.emit(true);
                  this.loadData();
                },
                error: (err: HttpErrorResponse) => {

                  this.errorHandler.handle(err);
                }
              });
            
          },
      });
    }

    evtFirstChange(first: number): void{
      this.pageNumber.set( (first / this.pageSize()) > 0 ? ((first / this.pageSize()) + 1) : 1 );
    }

    evtRowsChange(rows: number): void{
      this.pageNumber.set( this.pageSize() === rows ? this.pageNumber() : 1 );
      this.pageSize.set( this.pageSize() === rows ? this.pageSize() : rows );
      this.first = (this.pageNumber() - 1) * this.pageSize();
      this.loadData();
    }

    evtOnRowSelect(event: TableRowSelectEvent) {
      this.selected.set( event.data );
    }


    /*evtShowList(): void{
      if(!this.handlerValidateSelected()) return;

      this.ref = this.dialogService.open(MdlReasonForTransferListToSelect,  {
        width: '1200px',
        closable: false,
        draggable: false,
        modal: true,
        position: 'top',
        header: 'Administración de motivos de traslado',
        styleClass: 'max-h-none! slide-down-dialog overflow-hidden!',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        inputValues:{
          entityBranch: this.selected()!
        },
        templates: {
          header: MdlHeader
        },
        contentStyle: {
          padding: '0rem'
        }
      });
    }*/

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onColumnsChange(event: any) {

      const selected = new Set(event.value);

      this.cols.update(cols =>
        cols.map(col => ({
          ...col,
          visible: selected.has(col.field)
        }))
      );

      this.storageService.loadTable(this.IDTABLE, this.cols());
    }

    // Functions

    isLastPage(): boolean {
      return this.data() ? this.first >= this.recordsTotalTable : true;
    }

    isFirstPage(): boolean {
      return this.data() ? this.first === 0 : true;
    }

    reload(): void{
      this.evtOnReload();
    }

    // Handlers

    handlerValidateSelected(): boolean{
      if(!this.selected()){
        this.alertService.error("Debe seleccionar una serie");

        return false;
      }

      return true;
    }

    handlerSelectedReasonForTransfer(value: SunatMotivoTrasladoDto): void{
      this.api.create({security_person_id: this.securityPersonal().id, reason_for_transfer_id: value.id})
        .pipe(
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: () => {
            this.OnUpdate.emit(true);
            this.evtOnReload();
          },
          error: (e: HttpErrorResponse) => {
            this.errorHandler.handle(e);
          }
        });
    }

}