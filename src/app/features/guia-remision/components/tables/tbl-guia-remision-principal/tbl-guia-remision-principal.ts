import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
import { GuiaRemisionDto } from '@features/guia-remision/models/guia-remision.model';
import { GuiaRemisionApiService } from '@features/guia-remision/services/guia-remision-api.service';
import saveAs from 'file-saver';
import { DocumentoApiService } from '@features/guia-remision/services/documento-api.service';
import { MdlVerPdfComponent } from '../../modals/mdl-ver-pdf/mdl-ver-pdf';

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
        MdlVerPdfComponent
  ],
  providers: [DialogService, ConfirmationService]
})

export class TableGuiaRemisionPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    cols: Column[] = [];

    data: GuiaRemisionDto[] = [];
    ldData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    $ldData = this.ldData.asObservable();
    selected: GuiaRemisionDto | undefined;
    private selectedSubject = new BehaviorSubject<GuiaRemisionDto | undefined>(undefined);
    items$ = this.selectedSubject.pipe(
      map(selected => this.buildMenuItems(selected))
    );
    loading: boolean = false;

    recordsTotalTable: number = 0;
    recordsTotal: number = 0;
    recordsFiltered: number = 0;
    first: number = 0;

    ref: any | undefined;
    private subs = new Subscription();

    pageNumber: number = 0;
    pageSize: number = 5;
    private pageSize$ = new BehaviorSubject<number>(5);
    totalRecords: number = 0;

    items: MenuItem[] | undefined;
    firstChange: boolean = false;

    constructor(
      public dialogService: DialogService,
      private api: GuiaRemisionApiService,
      private cd: ChangeDetectorRef,
      public util: UtilService,
      public documentoApi: DocumentoApiService
    ){
        this.cols = [
          { field: 'select', header: '', sort: false, sticky: false  },
          { field: 'cod', header: '#', sort: false, sticky: false  },
          { field: 'id', header: 'Código', sort: false, sticky: false },
          { field: 'empresa', header: 'Empresa', sort: true, sticky: false },
          { field: 'ruc_empresa', header: 'RUC Empresa', sort: true, sticky: false },
          { field: 'razon_remitente', header: 'Remitente', sort: true, sticky: false },
          { field: 'tipo_guia', header: 'Tipo Guia', sort: true, sticky: false },
          { field: 'numero_guia', header: 'N° Guia', sort: true, sticky: false },
          { field: 'tipo_traslado', header: 'T. Traslado', sort: true, sticky: false },
          { field: 'tipo_transporte', header: 'Dirección', sort: true, sticky: false },
          { field: 'fecha_emision', header: 'F. Emisión', sort: true, sticky: false },
          { field: 'hora_emision', header: 'H. Emisión', sort: true, sticky: false },
          { field: 'razon_destinatario', header: 'Destinatario', sort: true, sticky: false },
          { field: 'nro_documento_destinatario', header: 'N° Doc. Destinatario', sort: true, sticky: false },
          { field: 'distrito_origen', header: 'Origen', sort: true, sticky: false },
          { field: 'distrito_destino', header: 'Destino', sort: true, sticky: false },
          { field: 'estado', header: 'Estado', sort: true, sticky: false },
          { field: 'fecha_creacion', header: 'F. Registro', sort: true, sticky: false },
          { field: 'empleado_nombre_creacion', header: 'U. Registro', sort: true, sticky: false },
          { field: 'fecha_ultima_edicion', header: 'F. Modifico', sort: true, sticky: false },
          { field: 'empleado_nombre_edicion', header: 'U. Modifico', sort: true, sticky: false },
        ];
    }

    ngOnInit(): void{
    }

    ngAfterViewInit(): void{
      this.loadData();
    }

    ngOnDestroy(): void{
      this.subs.unsubscribe();
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
      this.selected = undefined;
      this.firstChange = false;
      this.loading = true;
      this.ldData.next(true);

      if(reload){
        this.pageNumber = 1;
        this.first = 0;
      }

      const sub = this.api.obtenerTodo(this.pageNumber + 1, this.pageSize).subscribe({
        next: (res: TableData<GuiaRemisionDto[]>) => {
          this.data = res.data.map(x => {
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
        }
      });
      this.subs.add(sub);
    }

    //events
    evtToggleSelection(row: GuiaRemisionDto): void{
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

    private evtOnReload(reload: boolean = false): void{
      this.selected = undefined;
      this.loadData(reload);
    }

    evtOnFilter(value: string){
      this.evtOnReload();
    }

    evtOnShowDetail(): void{
      
    }

    evtOnShowPdf(): void{
      this.ref = this.dialogService.open(MdlVerPdfComponent,  {
        width: '1200px',
        height: '90vh',
        closable: true,
        modal: true,
        position: 'top',
        header: this.selected?.numero_guia,
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        inputValues:{
          ticket: this.selected!.respuesta_ticket
        }
      });
    }

    evtFirstChange(first: number): void{
      this.pageNumber = (first / this.pageSize) > 0 ? ((first / this.pageSize) + 1) : 1 ;
    }

    evtRowsChange(rows: number): void{
      this.pageNumber = this.pageSize === rows ? this.pageNumber : 1;
      this.pageSize = this.pageSize === rows ? this.pageSize : rows;
      this.pageSize$.next(this.pageSize === rows ? this.pageSize : rows);
      this.first = (this.pageNumber - 1) * this.pageSize
      this.loadData();
    }

    evtOnRowSelect(event: any) {
      this.selected = event.data;
      this.setSelected(event.data);
    }

    //functions
    isLastPage(): boolean {
        return this.data ? this.first + this.pageSize >= this.totalRecords : true;
    }

    isFirstPage(): boolean {
        return this.data ? this.first === 0 : true;
    }

    reload(): void{
      this.evtOnReload(true);
    }

    private buildMenuItems(selected: GuiaRemisionDto | undefined): MenuItem[] {
      return [
        { label: 'Ver Detalle', icon: 'pi pi-eye text-blue-500!', command: () => { this.evtOnShowDetail(); }},
        { label: 'Ver PDF', icon: 'pi pi-file-pdf text-gray-500!', command: () => { this.evtOnShowPdf(); }},
      ];
    }

}