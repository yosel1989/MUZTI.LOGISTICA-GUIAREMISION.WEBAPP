import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActualizarEstadoRemitenteRequestDto, ActualizarEstadoRemitenteResponseDto, EliminarRemitenteResponseDto, RemitenteDto } from '@features/remitente/models/remitente';
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
import { MdlRegistrarRemitenteComponent } from '../../modals/mdl-registrar-remitente/mdl-registrar-remitente.component';
import { MdlEditarRemitenteComponent } from '../../modals/mdl-editar-remitente/mdl-editar-remitente.component';
import { LoaderComponent } from 'app/core/components/loaders/loader/loder.component';
import { fadeDownAnimation } from 'app/core/animations/page-animation';

@Component({
  selector: 'app-tbl-remitente-principal',
  templateUrl: './tbl-remitente-principal.html',
  styleUrl: './tbl-remitente-principal.scss',
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
        LoaderComponent
  ],
  providers: [DialogService, ConfirmationService],
  animations: [fadeDownAnimation]
})

export class TableRemitentePrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    cols: Column[] = [];

    data: RemitenteDto[] = [];
    ldData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    $ldData = this.ldData.asObservable();
    selected: RemitenteDto | undefined;
    private selectedSubject = new BehaviorSubject<RemitenteDto | undefined>(undefined);
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
    pageSize: number = 10;
    totalRecords: number = 0;

    items: MenuItem[] | undefined;

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
          { field: 'nombre_empresa', header: 'Empresa', sort: true, sticky: false },
          { field: 'ruc', header: 'RUC', sort: true, sticky: false },
          { field: 'descripcion', header: 'Descripción', sort: true, sticky: false },
          { field: 'departamento', header: 'Departamento', sort: true, sticky: false },
          { field: 'provincia', header: 'Provincia', sort: true, sticky: false },
          { field: 'distrito', header: 'Distrito', sort: true, sticky: false },
          { field: 'direccion', header: 'Dirección', sort: true, sticky: false },
          { field: 'email', header: 'Correo', sort: true, sticky: false },
          { field: 'emailFacturador', header: 'Correo Factura', sort: true, sticky: false },
          { field: 'pais', header: 'País', sort: true, sticky: false },
          { field: 'serie', header: 'Serie', sort: true, sticky: false },
          { field: 'codigo_sunat', header: 'Cod. Sunat', sort: true, sticky: false },
          { field: 'estado', header: 'Estado', sort: true, sticky: false },
          { field: 'fecha_creacion', header: 'F. Registro', sort: true, sticky: false },
          { field: 'empleado_nombre_creacion', header: 'U. Registro', sort: true, sticky: false },
          { field: 'fecha_ultima_edicion', header: 'F. Modifico', sort: true, sticky: false },
          { field: 'empleado_nombre_edicion', header: 'U. Modifico', sort: true, sticky: false },
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
    setSelected(data: RemitenteDto | undefined) {
      this.selectedSubject.next(data);
    }

    // data
    loadData(): void {
      this.selected = undefined;
      this.loading = true;
      this.ldData.next(true);
      const sub = this.api.obtenerTodo(this.pageNumber + 1, this.pageSize).subscribe({
        next: (res: TableData<RemitenteDto[]>) => {
          this.data = res.data.map(x => {
            x.fecha_creacion = new Date(x.fecha_creacion);
            x.fecha_ultima_edicion = x.fecha_ultima_edicion ? new Date(x.fecha_creacion) : x.fecha_ultima_edicion;
            return x;
          });

          this.pageNumber = res.page_number - 1;
          this.pageSize = res.page_size;
          this.totalRecords = res.data.length;
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
    evtToggleSelection(row: RemitenteDto): void{
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

    evtOnFilter(value: string){
      this.evtOnReload();
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
        const sub2 = cmp?.OnCreated.subscribe(( s: MdlEditarRemitenteComponent) => {
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

                  this.selected!.id_estado = res.id_estado;
                  this.selected!.estado = res.estado;
                  this.selected!.empleado_nombre_edicion = res.empleado_nombre_edicion;
                  this.selected!.fecha_ultima_edicion = res.fecha_ultima_edicion;
                  this.cd.detectChanges();
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

    evtFirstChange(first: number): void{
      this.pageNumber = (first / this.pageSize) > 0 ? ((first / this.pageSize) + 1) : 1 ;
    }

    evtRowsChange(rows: number): void{
      this.pageNumber = this.pageSize === rows ? this.pageNumber : 1;
      this.pageSize = this.pageSize === rows ? this.pageSize : rows;
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

    private buildMenuItems(selected: RemitenteDto | undefined): MenuItem[] {
      return [
        { label: 'Editar', icon: 'pi pi-pencil text-amber-500!', command: () => { this.evtOnEdit(); }},
        { label: 'Eliminar', icon: 'pi pi-trash text-red-500!', command: () => { this.evtOnDelete(); }},
        { label: 'Activar', icon: 'pi pi-check-circle text-green-500!', command: () => { this.evtOnUpdateStatus(1); }, visible: selected?.id_estado === 0 },
        { label: 'Desactivar', icon: 'pi pi-ban text-gray-500!', command: () => { this.evtOnUpdateStatus(0); }, visible: selected?.id_estado === 1 },
      ];
    }

}