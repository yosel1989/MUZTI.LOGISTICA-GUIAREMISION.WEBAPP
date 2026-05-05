import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { BehaviorSubject, map, Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { TableData } from 'app/core/models/table';
import { UtilService } from 'app/core/services/util.service';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {
  GR_EmitirGuiaRemisionResponseDto,
  GuiaRemisionDto,
} from '@features/guia-remision/models/guia-remision.model';
import { GuiaRemisionApiService } from '@features/guia-remision/services/guia-remision-api.service';
import { DocumentoApiService } from '@features/guia-remision/services/documento-api.service';
import { MdlVerPdfComponent } from '../../modals/mdl-ver-pdf/mdl-ver-pdf';
import { LayoutRoutingModule } from '@features/admin/layout/layout-routing.module';
import { LoaderComponent } from 'app/core/components/loaders/loader/loder.component';
import { DrawerModule } from 'primeng/drawer';
import { ColumnsFilterDto } from 'app/core/models/filter';
import { FltGuiaRemisionPrincipalComponent } from '../../filters/flt-guia-remision-principal/flt-guia-remision-principal';
import saveAs from 'file-saver';
import { AlertService } from 'app/core/services/alert.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DragScrollDirective } from 'app/core/directives/drag-scroll.directive';
import { GuiaRemitenteApiService } from '@features/guia-remitente/services/guia-remitente-api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-tbl-guia-remision-principal',
  templateUrl: './tbl-guia-remision-principal.html',
  styleUrl: './tbl-guia-remision-principal.scss',
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
    AsyncPipe,
    DatePipe,
    ContextMenuModule,
    ConfirmDialogModule,
    LayoutRoutingModule,
    LoaderComponent,
    DrawerModule,
    NgClass,
    ReactiveFormsModule,
    DragScrollDirective,
  ],
  providers: [DialogService, ConfirmationService],
})
export class TableGuiaRemisionPrincipalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('datatable', { read: ElementRef }) datatableEl!: ElementRef;
  @Input() filter: FltGuiaRemisionPrincipalComponent | undefined;
  @Output() OnShowFilter: EventEmitter<boolean> = new EventEmitter<boolean>();

  cols: Column[] = [];

  data: GuiaRemisionDto[] = [];
  ldData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  $ldData = this.ldData.asObservable();
  selected: GuiaRemisionDto | undefined;
  private selectedSubject = new BehaviorSubject<GuiaRemisionDto | undefined>(undefined);
  items$ = this.selectedSubject.pipe(map((selected) => this.buildMenuItems(selected)));
  loading: boolean = false;

  recordsTotalTable: number = 0;
  recordsTotal: number = 0;
  recordsFiltered: number = 0;
  first: number = 0;

  ref: any | undefined;
  private subs = new Subscription();

  pageNumber: number = 1;
  pageSize: number = 10;
  private pageSize$ = new BehaviorSubject<number>(10);
  totalRecords: number = 0;

  items: MenuItem[] | undefined;
  firstChange: boolean = false;

  visibleFilters: boolean = false;

  loadingDownload = new BehaviorSubject<boolean>(false);
  loadingDownload$ = this.loadingDownload.asObservable();

  filters: ColumnsFilterDto[] = [];
  search: string | null = null;

  subData: Subscription | undefined = undefined;
  ctrlSearch = new FormControl(null);

  hands = signal<boolean>(false);

    constructor(
      public dialogService: DialogService,
      private alertService: AlertService,
      private api: GuiaRemisionApiService,
      private apiGuiaRemitente: GuiaRemitenteApiService,
      private cd: ChangeDetectorRef,
      public util: UtilService,
      public documentoApi: DocumentoApiService
    ){
        this.cols = [
          { field: 'select', header: '', sort: false, sticky: false  },
          { field: 'cod', header: '#', sort: false, sticky: false  },
          { field: 'id', header: 'Código', sort: false, sticky: false },
          { field: 'empresa', header: 'Empresa', sort: false, sticky: false },
          { field: 'ruc', header: 'RUC Empresa', sort: false, sticky: false },
          { field: 'razon_remitente', header: 'Remitente', sort: false, sticky: false },
          { field: 'tipo_guia', header: 'Tipo Guia', sort: false, sticky: false },
          { field: 'numero_guia', header: 'N° Guia', sort: false, sticky: false },
          { field: 'tipo_traslado', header: 'T. Traslado', sort: false, sticky: false },
          { field: 'tipo_transporte', header: 'T. Transporte', sort: false, sticky: false },
          { field: 'fecha_emision', header: 'F. Emisión', sort: false, sticky: false },
          { field: 'hora_emision', header: 'H. Emisión', sort: false, sticky: false },
          { field: 'razon_destinatario', header: 'Destinatario', sort: false, sticky: false, className: 'w-[100px]' },
          { field: 'nro_documento_destinatario', header: 'N° Doc. Destinatario', sort: false, sticky: false },
          { field: 'distrito_origen', header: 'Origen', sort: false, sticky: false },
          { field: 'direccion_origen', header: 'Dirección Origen', sort: false, sticky: false },
          { field: 'distrito_destino', header: 'Destino', sort: false, sticky: false },
          { field: 'direccion_destino', header: 'Dirección Destino', sort: false, sticky: false },
          { field: 'estado', header: 'Estado', sort: false, sticky: false },
          { field: 'estado_sunat', header: 'Estado Sunat', sort: false, sticky: false },
          { field: 'fecha_creacion', header: 'F. Registro', sort: false, sticky: false },
          { field: 'empleado_nombre_creacion', header: 'U. Registro', sort: false, sticky: false },
          { field: 'fecha_ultima_edicion', header: 'F. Modifico', sort: false, sticky: false },
          { field: 'empleado_nombre_edicion', header: 'U. Modifico', sort: false, sticky: false },
        ];
    }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.filter?.filters.subscribe((res: ColumnsFilterDto[]) => {
      this.filters = res;
      this.loadData(true);
    });

    this.loadData();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.subData?.unsubscribe();
  }

  // getters
  get paddedData(): any[] {
    const actual = this.data ?? [];
    const fillerCount = this.pageSize - actual.length;
    const fillerRows = Array.from({ length: fillerCount }, () => ({ __empty: true }));
    return [...actual, ...fillerRows];
  }

  // setters
  setSelected(data: GuiaRemisionDto | undefined) {
    this.selectedSubject.next(data);
  }

  // data
  loadData(reload: boolean = false): void {
    this.subData?.unsubscribe();
    this.selected = undefined;
    this.firstChange = false;
    this.loading = true;
    this.ldData.next(true);

    if (reload) {
      this.pageNumber = 1;
      this.first = 0;
    }

    if (this.search) {
      this.filters.push({
        data: 'search',
        search: {
          value: this.search,
        },
      });
    }

    this.subData = this.api.obtenerTodo(this.pageNumber, this.pageSize, this.filters).subscribe({
      next: (res: TableData<GuiaRemisionDto[]>) => {
        this.data = res.data.map((x) => {
          x.fecha_creacion = new Date(x.fecha_creacion);
          x.fecha_ultima_edicion = x.fecha_ultima_edicion ? new Date(x.fecha_ultima_edicion) : null;
          return x;
        });

          this.pageNumber = res.page_number;
          this.pageSize = res.page_size;
          this.first = (this.pageNumber - 1) * this.pageSize;
          this.totalRecords = res.total_records;
          this.ldData.next(false);
          this.cd.detectChanges();
          this.loading = false;
        },
        error: (e) => {
          console.log(e);
          this.ldData.next(false);
          this.loading = false;
          this.data = [];

        this.alertService.showToast({
          position: 'bottom-end',
          icon: 'error',
          title: 'Ocurrio un error al obtener los registros',
          showCloseButton: true,
          timerProgressBar: true,
          timer: 4000,
          customClass: {
            container: 'z-[9999]!',
            popup: 'z-[9999]!',
          },
        });
      },
    });
  }

  //events
  evtToggleSelection(row: GuiaRemisionDto): void {
    if (this.selected === row) {
      this.setSelected(undefined);
      this.selected = undefined;
    } else {
      this.setSelected(row);
      this.selected = row;
    }
  }

  evtNext() {
    this.first = this.first + this.pageSize;
    this.pageNumber = this.pageNumber + 1;
    this.evtOnReload(false);
  }

  evtPrev() {
    this.first = this.first - this.pageSize;
    this.pageNumber--;
    this.evtOnReload(false);
  }

  private evtOnReload(reload: boolean = false): void {
    this.selected = undefined;
    this.loadData(reload);
  }

  evtOnShowDetail(): void {}

  evtOnShowPdf(): void {
    this.ref = this.dialogService.open(MdlVerPdfComponent, {
      width: '1200px',
      height: '90vh',
      closable: true,
      maximizable: true,
      modal: true,
      draggable: false,
      header: this.selected?.numero_guia,
      styleClass: 'max-h-none! slide-down-dialog overflow-hidden',
      maskStyleClass: 'overflow-y-auto',
      contentStyle: {
        height: '100%',
        padding: '0',
        overflow: 'hide',
      },
      appendTo: 'body',
      inputValues: {
        ticket: this.selected!.respuesta_ticket,
        data: this.selected!,
      },
    });
  }

    evtEmitInvoice(): void{
        if(!this.selected){
          this.alertService.showSwalAlert({
            text: "Debe seleccionar una guía",
            icon: "warning"
          });
          return;
        }
        this.selected.loading_update = true;
        this.apiGuiaRemitente.emitirGuiaRemision(this.selected.id, this.selected.ruc).subscribe({
          next: (val: GR_EmitirGuiaRemisionResponseDto) => {
            if(val.success){
              this.alertService.showSwalAlert({
                icon: "success",
                title: "¡Guía de Remisión Emitida!",
                text: `Se emitió la GUÍA DE REMISIÓN ${this.selected?.tipo_guia} ELECTRÓNICA\n N° ${this.selected?.numero_guia}`
              });
              this.selected!.loading_update = false;
              this.reload();
            }else{
              this.alertService.showSwalAlert({
                icon: "error",
                text: "Ocurrio un error al emitir la guía"
              });
            }
          },
          error: (err: any) => {
              this.alertService.showSwalAlert({
                icon: "error",
                title: err.error.error,
                text: err.error.detalle
              });
              this.selected!.loading_update = false;
              this.cd.detectChanges();
          }
        });
    }

  evtOnShowFilters(): void {
    this.OnShowFilter.emit(true);
  }

  evtFirstChange(first: number): void {
    this.pageNumber = first / this.pageSize > 0 ? first / this.pageSize + 1 : 1;
  }

  evtRowsChange(rows: number): void {
    this.pageNumber = this.pageSize === rows ? this.pageNumber : 1;
    this.pageSize = this.pageSize === rows ? this.pageSize : rows;
    this.pageSize$.next(this.pageSize === rows ? this.pageSize : rows);
    this.first = (this.pageNumber - 1) * this.pageSize;
    this.loadData();
  }

  evtOnRowSelect(event: any) {
    this.selected = event.data;
    this.setSelected(event.data);
  }

    evtToggleHand(): void{
      this.hands.set(!this.hands());
      console.log(this.hands());
    }

  evtExport(): void {
    this.loadingDownload.next(true);

    if (this.search) {
      this.filters.push({
        data: 'search',
        search: {
          value: this.search,
        },
      });
    }

      this.subData = this.api.exportarTodo(this.filters).subscribe(blob => {
          saveAs(blob, 'reporte.xlsx'); // 👈 descarga el archivo
        this.loadingDownload.next(false);
        }, (error) => {
        this.loadingDownload.next(false);
        this.alertService.showToast({
          position: 'bottom-end',
          icon: 'error',
          title: 'Error al descargar el archivo',
          showCloseButton: true,
          timerProgressBar: true,
          timer: 4000,
        });
      },
    );
  }

  //functions
  isLastPage(): boolean {
    return this.data ? this.first + this.pageSize >= this.totalRecords : true;
  }

  isFirstPage(): boolean {
    return this.data ? this.first === 0 : true;
  }

  reload(): void {
    this.evtOnReload(true);
  }

  private buildMenuItems(selected: GuiaRemisionDto | undefined): MenuItem[] {
    return [
      //{ label: 'Ver Detalle', icon: 'pi pi-eye text-blue-500!', command: () => { this.evtOnShowDetail(); }},
      {
        label: 'Ver PDF',
        icon: 'pi pi-file-pdf text-gray-500!',
        command: () => {
          this.evtOnShowPdf();
        },
        visible: selected?.estado === 'ENVIADO',
      },
      {
        label: 'Aprobar',
        icon: 'pi pi-check-circle text-green-500!',
        command: () => {
          this.evtEmitInvoice();
        },
        visible: selected?.estado === 'REGISTRADO',
      },
      {
        label: 'Rechazar',
        icon: 'pi pi-ban text-red-500!',
        command: () => {
          this.evtEmitInvoice();
        },
        visible: selected?.estado === 'REGISTRADO',
      },
    ];
  }
}
