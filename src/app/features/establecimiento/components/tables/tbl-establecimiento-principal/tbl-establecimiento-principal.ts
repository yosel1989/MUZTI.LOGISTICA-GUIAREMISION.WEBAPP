import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { RemitenteApiService } from '@features/remitente/services/remitente-api.service';
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
import { AlertService } from 'app/core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoaderComponent } from 'app/core/components/loaders/loader/loder.component';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ColumnsFilterDto } from 'app/core/models/filter';
import { EstablecimientoDTO } from '@features/establecimiento/models/establecimiento.model';

@Component({
  selector: 'app-tbl-establecimiento-principal',
  templateUrl: './tbl-establecimiento-principal.html',
  styleUrl: './tbl-establecimiento-principal.scss',
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
        LoaderComponent,
        ReactiveFormsModule
  ],
  providers: [DialogService, ConfirmationService],
  animations: [fadeDownAnimation]
})

export class TableEstablecimientoPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    cols: Column[] = [];

    data: EstablecimientoDTO[] = [];
    ldData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    $ldData = this.ldData.asObservable();
    selected: EstablecimientoDTO | undefined;
    private selectedSubject = new BehaviorSubject<EstablecimientoDTO | undefined>(undefined);
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

    pageNumber: number = 1;
    pageSize: number = 10;
    private pageSize$ = new BehaviorSubject<number>(10);
    totalRecords: number = 0;

    firstChange: boolean = false;
    items: MenuItem[] | undefined;

    filters: ColumnsFilterDto[] = [];
    search: string | null = null;

    subData: Subscription | undefined = undefined;
    ctrlSearch = new FormControl(null);

    constructor(
      public dialogService: DialogService,
      private api: RemitenteApiService,
      private cd: ChangeDetectorRef,
      public util: UtilService,
      private confirmationService: ConfirmationService,
      private alertService: AlertService
    ){
        this.cols = [
          { field: 'select', header: '', sort: false, sticky: false  },
          { field: 'cod', header: '#', sort: false, sticky: false  },
          { field: 'id', header: 'Código', sort: false, sticky: false },
          { field: 'nombre_empresa', header: 'Empresa', sort: false, sticky: false },
          { field: 'ruc', header: 'RUC', sort: false, sticky: false },
          { field: 'descripcion', header: 'Descripción', sort: false, sticky: false },
          { field: 'departamento', header: 'Departamento', sort: false, sticky: false },
          { field: 'provincia', header: 'Provincia', sort: false, sticky: false },
          { field: 'distrito', header: 'Distrito', sort: false, sticky: false },
          { field: 'direccion', header: 'Dirección', sort: false, sticky: false },
          { field: 'email', header: 'Correo', sort: false, sticky: false },
          { field: 'emailFacturador', header: 'Correo Factura', sort: false, sticky: false },
          { field: 'pais', header: 'País', sort: false, sticky: false },
          { field: 'serie', header: 'Serie', sort: false, sticky: false },
          { field: 'codigo_sunat', header: 'Cod. Sunat', sort: false, sticky: false },
          { field: 'estado', header: 'Estado', sort: false, sticky: false },
          { field: 'fecha_creacion', header: 'F. Registro', sort: false, sticky: false },
          { field: 'empleado_nombre_creacion', header: 'U. Registro', sort: false, sticky: false },
          { field: 'fecha_ultima_edicion', header: 'F. Modifico', sort: false, sticky: false },
          { field: 'empleado_nombre_edicion', header: 'U. Modifico', sort: false, sticky: false },
        ];
    }

    ngOnInit(): void{
      this.items = [
          { label: 'Editar', icon: 'pi pi-pencil text-amber-500!', command: () => { this.evtOnEdit(); }},
          { label: 'Eliminar', icon: 'pi pi-trash text-red-500!', command: () => { this.evtOnDelete(); }},
          { label: 'Activar', icon: 'pi pi-check-circle text-green-500!', command: () => { this.evtOnUpdateStatus(1); }},
          { label: 'Desactivar', icon: 'pi pi-ban text-gray-500!', command: () => { this.evtOnUpdateStatus(0); }},
      ];
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

    // getters
    get paddedData(): any[] {
      const actual = this.data ?? [];
      const fillerCount = this.pageSize - actual.length;
      const fillerRows = Array.from({ length: fillerCount }, () => ({ __empty: true }));
      return [...actual, ...fillerRows];
    }

    // setters
    setSelected(data: EstablecimientoDTO | undefined) {
      this.selectedSubject.next(data);
    }

    // data
    loadData(reload: boolean = false): void {
      this.subData?.unsubscribe();
      this.selected = undefined;
      this.firstChange = false;
      this.loading = true;
      this.ldData.next(true);

      if(reload){
        this.pageNumber = 1;
        this.first = 0;
      }

      this.filters =  this.search ? [{
        data: 'search',
        search: {
          value: this.search
        }
      }] : [];

      this.subData = this.api.obtenerTodo(this.pageNumber, this.pageSize, this.filters).subscribe({
        next: (res: TableData<EstablecimientoDTO[]>) => {
          
          this.data = res.data.map(x => {
            x.fecha_creacion = new Date(x.fecha_creacion);
            x.fecha_ultima_edicion = x.fecha_ultima_edicion ? new Date(x.fecha_creacion) : x.fecha_ultima_edicion;
            x.ldEstado = false;
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
              icon: "error",
              title: "Ocurrio un error al obtener los registros",
              showCloseButton: true,
              timerProgressBar: true,
              timer: 4000,
              customClass: {
                container: 'z-[9999]!',
                popup: 'z-[9999]!'
              }
          });
        }
      });
    }

    //events
    evtToggleSelection(row: EstablecimientoDTO): void{
      if (this.selected === row) {
        this.selected = undefined;
        this.setSelected(undefined);
      } else {
        this.selected = row;
        this.setSelected(row);
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
      this.setSelected(undefined);
      this.selected = undefined;
      this.loadData();
    }

    evtOnCreate(): void{
      this.ref = this.dialogService.open(MdlRegistrarRemitenteComponent,  {
        width: '1000px',
        closable: true,
        modal: true,
        position: 'top',
        header: 'Registrar Remitente',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body'
      });

      const sub = this.ref.onChildComponentLoaded.subscribe((cmp: MdlRegistrarRemitenteComponent) => {
        const sub2 = cmp?.OnCreated.subscribe(( s: MdlRegistrarRemitenteComponent) => {
          this.evtOnReload();
          this.ref?.close();
        });
        const sub3 = cmp?.OnCanceled.subscribe(_ => {
          this.ref?.close();
        });
        this.subs.add(sub2);
        this.subs.add(sub3);
      });

      this.subs.add(sub);
    }

    evtOnEdit(): void{
      this.ref = this.dialogService.open(MdlEditarRemitenteComponent,  {
        width: '1000px',
        closable: true,
        modal: true,
        position: 'top',
        header: 'Editar Remitente',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        inputValues:{
          id: this.selected!.id
        }
      });

      const sub = this.ref.onChildComponentLoaded.subscribe((cmp: MdlEditarRemitenteComponent) => {
        const sub2 = cmp?.OnCreated.subscribe(( s: EstablecimientoDTO) => {
          console.log(this.selected);
          this.selected!.ldUpdate = true;
          this.cd.detectChanges();

          setTimeout(() => {
            const idx = this.data.findIndex(x => x.id === this.selected!.id);
            if (idx > -1) {
              this.data[idx] = { ...this.selected!, ...s, ldUpdate: false };
            }
            this.cd.detectChanges();
          }, 1000);
          this.ref?.close();
        });
        const sub3 = cmp?.OnCanceled.subscribe(_ => {
          this.ref?.close();
        });
        this.subs.add(sub2);
        this.subs.add(sub3);
      });

      this.subs.add(sub);
    }

    evtOnDelete(): void{
      this.confirmationService.confirm({
          header: '¿Eliminar remitente?',
          message: 'Confirmar la operación.',
          accept: () => {

              const subs = this.api.eliminar(this.selected!.id).subscribe({
                next: (res: EliminarRemitenteResponseDto) => {

                  this.alertService.showToast({
                    position: 'bottom-end',
                    icon: "success",
                    title: res.detalle,
                    showCloseButton: true,
                    timerProgressBar: true,
                    timer: 4000
                  });

                  this.loadData();
                },
                error: (err: HttpErrorResponse) => {

                  this.alertService.showToast({
                    position: 'bottom-end',
                    icon: "error",
                    title: err.error.error,
                    showCloseButton: true,
                    timerProgressBar: true,
                    timer: 4000,
                    customClass: {
                      container: 'z-[9999]!',
                      popup: 'z-[9999]!'
                    }
                  });
                }
              });
              this.subs.add(subs);
            
          },
          reject: () => {
              
          },
      });
    }

    evtOnUpdateStatus(status: number): void{
      this.confirmationService.confirm({
          header: !status ? '¿Desactivar el remitente?' : '¿Activar el remitente?',
          message: 'Confirmar la operación.',
          accept: () => {

              this.selected!.ldEstado = true;
              this.cd.detectChanges();

              const request = {
                id_estado: status,
                edited_employee_id: 1,
                edited_employee_name: 'SA'
              } as ActualizarEstadoRemitenteRequestDto;

              const subs = this.api.actualizarEstado(this.selected!.id, request).subscribe({
                next: (res: ActualizarEstadoRemitenteResponseDto) => {

                  this.alertService.showToast({
                    position: 'bottom-end',
                    icon: "success",
                    title: res.detalle,
                    showCloseButton: true,
                    timerProgressBar: true,
                    timer: 4000
                  });

                  this.selected!.ldEstado = false;
                  this.selected!.id_estado = res.id_estado;
                  this.selected!.estado = res.estado;
                  this.selected!.empleado_nombre_edicion = res.empleado_nombre_edicion;
                  this.selected!.fecha_ultima_edicion = res.fecha_ultima_edicion;
                  this.cd.detectChanges();
                },
                error: (err: HttpErrorResponse) => {

                  this.selected!.ldEstado = false;
                  this.cd.detectChanges();

                  this.alertService.showToast({
                    position: 'bottom-end',
                    icon: "error",
                    title: err.error.error,
                    showCloseButton: true,
                    timerProgressBar: true,
                    timer: 4000,
                    customClass: {
                      container: 'z-[9999]!',
                      popup: 'z-[9999]!'
                    }
                  });
                }
              });
              this.subs.add(subs);
          },
          reject: () => {
              
          },
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
      return this.data ? this.first >= this.recordsTotalTable : true;
    }

    isFirstPage(): boolean {
      return this.data ? this.first === 0 : true;
    }

    reload(): void{
      this.evtOnReload();
    }

    private buildMenuItems(selected: EstablecimientoDTO | undefined): MenuItem[] {
      return [
        { label: 'Editar', icon: 'pi pi-pencil text-amber-500!', command: () => { this.evtOnEdit(); }},
        { label: 'Eliminar', icon: 'pi pi-trash text-red-500!', command: () => { this.evtOnDelete(); }},
        { label: 'Activar', icon: 'pi pi-check-circle text-green-500!', command: () => { this.evtOnUpdateStatus(1); }, visible: selected?.id_estado === 0 },
        { label: 'Desactivar', icon: 'pi pi-ban text-gray-500!', command: () => { this.evtOnUpdateStatus(0); }, visible: selected?.id_estado === 1 },
      ];
    }

}