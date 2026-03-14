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
import { BehaviorSubject, combineLatest, map, Observable, Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { TableData } from 'app/core/models/table';
import { UtilService } from 'app/core/services/util.service';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ConductorApiService } from '@features/conductor/services/conductor-api.service';
import { MdlRegistrarConductorComponent } from '../../modals/mdl-registrar-conductor/mdl-registrar-conductor';
import { MdlEditarConductorComponent } from '../../modals/mdl-editar-conductor/mdl-editar-conductor';
import { ActualizarEstadoConductorRequestDto, ActualizarEstadoConductorResponseDto, ConductorDto, EliminarConductorResponseDto } from '@features/conductor/models/conductor.model';
import { AlertService } from 'app/core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LoaderComponent } from 'app/core/components/loaders/loader/loder.component';

@Component({
  selector: 'app-tbl-conductor-principal',
  templateUrl: './tbl-conductor-principal.html',
  styleUrl: './tbl-conductor-principal.scss',
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
  providers: [DialogService, ConfirmationService]
})

export class TableConductorPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    cols: Column[] = [];

    data: ConductorDto[] = [];

    ldData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    $ldData = this.ldData.asObservable();

    selected: ConductorDto | undefined;
    private selectedSubject = new BehaviorSubject<ConductorDto | undefined>(undefined);

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
    pageSize: number = 5;
    private pageSize$ = new BehaviorSubject<number>(5);
    totalRecords: number = 0;

    items: MenuItem[] | undefined;
    firstChange: boolean = false;

    constructor(
      public dialogService: DialogService,
      private api: ConductorApiService,
      private cd: ChangeDetectorRef,
      public util: UtilService,
      private confirmationService: ConfirmationService,
      private alertService: AlertService
    ){
        this.cols = [
          { field: 'select', header: '', sort: false, sticky: false  },
          { field: 'cod', header: '#', sort: false, sticky: false  },
          { field: 'id', header: 'Código', sort: false, sticky: false },
          { field: 'tipo_documento', header: 'T. Documento', sort: false, sticky: false },
          { field: 'numero_documento', header: 'N° Documento', sort: false, sticky: false },
          { field: 'nombres', header: 'Nombres', sort: false, sticky: false },
          { field: 'apellidos', header: 'Apellidos', sort: false, sticky: false },
          { field: 'cargo', header: 'Cargo', sort: false, sticky: false },
          { field: 'licencia', header: 'Distrito', sort: false, sticky: false },
          { field: 'estado', header: 'Estado', sort: false, sticky: false },
          { field: 'fecha_creacion', header: 'F. Registro', sort: false, sticky: false },
          { field: 'empleado_nombre_creacion', header: 'U. Registro', sort: false, sticky: false },
          { field: 'fecha_ultima_edicion', header: 'F. Modifico', sort: false, sticky: false },
          { field: 'empleado_nombre_edicion', header: 'U. Modifico', sort: false, sticky: false },
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
    setSelected(data: ConductorDto | undefined) {
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


      const sub = this.api.obtenerTodo(this.pageNumber, this.pageSize).subscribe({
        next: (res: TableData<ConductorDto[]>) => {
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
        error: (e: HttpErrorResponse) => {
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
      this.subs.add(sub);
    }

    //events
    evtToggleSelection(row: ConductorDto): void{
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

    evtOnCreate(): void{
      this.ref = this.dialogService.open(MdlRegistrarConductorComponent,  {
        width: '800px',
        closable: true,
        modal: true,
        draggable: false,
        position: 'top',
        header: 'Registrar Conductor',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body'
      });

      const sub = this.ref.onChildComponentLoaded.subscribe((cmp: MdlRegistrarConductorComponent) => {
        const sub2 = cmp?.OnCreated.subscribe(( s: MdlRegistrarConductorComponent) => {
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
      this.ref = this.dialogService.open(MdlEditarConductorComponent,  {
        width: '800px',
        closable: true,
        modal: true,
        draggable: false,
        position: 'top',
        header: 'Editar Conductor',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        inputValues:{
          id: this.selected!.id
        }
      });

      const sub = this.ref.onChildComponentLoaded.subscribe((cmp: MdlEditarConductorComponent) => {
        const sub2 = cmp?.OnCreated.subscribe(( s: MdlEditarConductorComponent) => {
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
          header: '¿Eliminar conductor?',
          message: 'Confirmar la operación.',
          accept: () => {

              const sub = this.api.eliminar(this.selected!.id).subscribe({
                next: (res: EliminarConductorResponseDto) => {

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
              this.subs.add(sub);
            
          },
          reject: () => {
              
          },
      });
    }

    evtOnUpdateStatus(status: number): void{
      this.confirmationService.confirm({
          header: !status ? '¿Desactivar el conductor?' : '¿Activar el conductor?',
          message: 'Confirmar la operación.',
          accept: () => {
              const request = {
                id_estado: status,
                edited_employee_id: 1,
                edited_employee_name: 'SA'
              } as ActualizarEstadoConductorRequestDto;

              const sub = this.api.actualizarEstado(this.selected!.id, request).subscribe({
                next: (res: ActualizarEstadoConductorResponseDto) => {

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
                  this.selected!.fecha_ultima_edicion = res.fecha_ultima_edicion;
                  this.selected!.empleado_nombre_edicion = res.empleado_nombre_edicion;
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
              this.subs.add(sub);
            
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
        return this.data ? this.first + this.pageSize >= this.totalRecords : true;
    }

    isFirstPage(): boolean {
        return this.data ? this.first === 0 : true;
    }

    reload(): void{
      this.evtOnReload(true);
    }

    private buildMenuItems(selected: ConductorDto | undefined): MenuItem[] {
      return [
        { label: 'Editar', icon: 'pi pi-pencil text-amber-500!', command: () => { this.evtOnEdit(); }},
        { label: 'Eliminar', icon: 'pi pi-trash text-red-500!', command: () => { this.evtOnDelete(); }},
        { label: 'Activar', icon: 'pi pi-check-circle text-green-500!', command: () => { this.evtOnUpdateStatus(1); }, visible: selected?.id_estado === 0 },
        { label: 'Desactivar', icon: 'pi pi-ban text-gray-500!', command: () => { this.evtOnUpdateStatus(0); }, visible: selected?.id_estado === 1 },
      ];
    }
}