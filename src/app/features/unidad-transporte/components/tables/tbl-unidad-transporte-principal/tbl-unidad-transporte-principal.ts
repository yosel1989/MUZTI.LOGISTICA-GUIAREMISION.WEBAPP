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
import { AlertService } from 'app/core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ActualizarEstadoUnidadTransporteRequestDto, EliminarUnidadTransporteResponseDto, UnidadTransporteDto } from '@features/unidad-transporte/models/unidad-transporte.model';
import { UnidadTransporteApiService } from '@features/unidad-transporte/services/unidad-transporte-api.service';
import { MdlRegistrarUnidadTransporteComponent } from '../../modals/mdl-registrar-unidad-transporte/mdl-registrar-unidad-transporte';
import { MdlEditarUnidadTransporteComponent } from '../../modals/mdl-editar-unidad-transporte/mdl-editar-unidad-transporte';
import { LoaderComponent } from 'app/core/components/loaders/loader/loder.component';
import { ColumnsFilterDto } from 'app/core/models/filter';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActualizarEstadoResponseDto } from '@features/shared/models/shared';

@Component({
  selector: 'app-tbl-unidad-transporte-principal',
  templateUrl: './tbl-unidad-transporte-principal.html',
  styleUrl: './tbl-unidad-transporte-principal.scss',
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
  providers: [DialogService, ConfirmationService]
})

export class TableUnidadTransportePrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    cols: Column[] = [];

    data: UnidadTransporteDto[] = [];
    ldData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    $ldData = this.ldData.asObservable();
    selected: UnidadTransporteDto | undefined;
    private selectedSubject = new BehaviorSubject<UnidadTransporteDto | undefined>(undefined);
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
    totalRecords: number = 0;

    items: MenuItem[] | undefined;

    firstChange: boolean = false;

    filters: ColumnsFilterDto[] = [];
    search: string | null = null;

    subData: Subscription | undefined = undefined;
    ctrlSearch = new FormControl(null);

    constructor(
      public dialogService: DialogService,
      private api: UnidadTransporteApiService,
      private cd: ChangeDetectorRef,
      public util: UtilService,
      private confirmationService: ConfirmationService,
      private alertService: AlertService
    ){
        this.cols = [
          { field: 'select', header: '', sort: false, sticky: false  },
          { field: 'cod', header: '#', sort: false, sticky: false  },
          { field: 'id', header: 'Código', sort: false, sticky: false },
          { field: 'descripcion', header: 'Descripción', sort: false, sticky: false },
          { field: 'marca', header: 'Marca', sort: false, sticky: false },
          { field: 'modelo', header: 'Modelo', sort: false, sticky: false },
          { field: 'placa', header: 'Placa', sort: false, sticky: false },
          { field: 'tarjeta', header: 'TUCE o Cert. de habilitación vehicular', sort: false, sticky: false },
          { field: 'emisor_vehicular', header: 'Entidad emisora de la autorización vehícular', sort: false, sticky: false },
          { field: 'nro_autorizacion', header: 'N° Autorización', sort: false, sticky: false },
          { field: 'estado', header: 'Estado', sort: false, sticky: false },
          { field: 'fecha_registro', header: 'F. Registro', sort: false, sticky: false },
          { field: 'usuario_registro', header: 'U. Registro', sort: false, sticky: false },
          { field: 'fecha_modifico', header: 'F. Modifico', sort: false, sticky: false },
          { field: 'usuario_modifico', header: 'U. Modifico', sort: false, sticky: false },
        ];
    }

    ngOnInit(): void{
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
    setSelected(data: UnidadTransporteDto | undefined) {
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

      this.subData = this.api.obtenerTodo(this.pageNumber, this.pageSize, this.search).subscribe({
        next: (res: TableData<UnidadTransporteDto[]>) => {
          this.data = res.data.map(x => {
            x.fecha_registro = new Date(x.fecha_registro);
            x.fecha_modifico = x.fecha_modifico ? new Date(x.fecha_modifico) : null;
            x.ld_estado = false;
            x.ld_update = false;
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
              position: 'top-end',
              icon: "error",
              title: e.error.detalle,
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
    evtToggleSelection(row: UnidadTransporteDto): void{
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

    evtOnCreate(): void{
      this.ref = this.dialogService.open(MdlRegistrarUnidadTransporteComponent,  {
        width: '800px',
        closable: true,
        modal: true,
        draggable: false,
        position: 'top',
        header: 'Registrar Unidad de Transporte',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body'
      });

      const sub = this.ref.onChildComponentLoaded.subscribe((cmp: MdlRegistrarUnidadTransporteComponent) => {
        const sub2 = cmp?.OnCreated.subscribe(( s: MdlRegistrarUnidadTransporteComponent) => {
          this.evtOnReload();
          this.ref?.close();
        });
        const sub3 = cmp?.OnCanceled.subscribe((_: any) => {
          this.ref?.close();
        });
        this.subs.add(sub2);
        this.subs.add(sub3);
      });

      this.subs.add(sub);
    }

    evtOnEdit(): void{
      this.ref = this.dialogService.open(MdlEditarUnidadTransporteComponent,  {
        width: '800px',
        closable: true,
        modal: true,
        draggable: false,
        position: 'top',
        header: 'Editar Unidad de Transporte',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        inputValues:{
          id: this.selected!.id
        }
      });

      const sub = this.ref.onChildComponentLoaded.subscribe((cmp: MdlEditarUnidadTransporteComponent) => {
        const sub2 = cmp?.OnCreated.subscribe(( s: UnidadTransporteDto ) => {
          this.selected!.ld_update = true;
          this.cd.detectChanges();

          setTimeout(() => {
            const idx = this.data.findIndex(x => x.id === this.selected!.id);
            if (idx > -1) {
              this.data[idx] = s;
              this.selected = s;
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
          header: '¿Eliminar Unidad de Transporte?',
          message: 'Confirmar la operación.',
          accept: () => {

              const subs = this.api.eliminar(this.selected!.id).subscribe({
                next: (res: EliminarUnidadTransporteResponseDto) => {

                  this.alertService.showToast({
                    position: 'top-end',
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
                    position: 'top-end',
                    icon: "error",
                    title: err.error.detalle,
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
          header: !status ? '¿Desactivar la Unidad de Transporte?' : '¿Activar la Unidad de Transporte',
          message: 'Confirmar la operación.',
          accept: () => {
              this.selected!.ld_estado = true;
              this.cd.detectChanges();

              const request = {
                id_estado: status
              } as ActualizarEstadoUnidadTransporteRequestDto;

              const subs = this.api.actualizarEstado(this.selected!.id, request).subscribe({
                next: (res: ActualizarEstadoResponseDto) => {

                  this.alertService.showToast({
                    position: 'top-end',
                    icon: "success",
                    title: res.detalle,
                    showCloseButton: true,
                    timerProgressBar: true,
                    timer: 4000
                  });

                  this.selected!.ld_estado = false;
                  this.selected!.id_estado = res.id_estado;
                  this.selected!.estado = res.estado;
                  this.selected!.usuario_modifico = res.usuario_modifico;
                  this.selected!.usuario_modifico_nombre = res.usuario_modifico_nombre;
                  this.selected!.fecha_modifico = res.fecha_modifico;
                  this.cd.detectChanges();
                },
                error: (err: HttpErrorResponse) => {

                  this.selected!.ld_estado = false;
                  this.cd.detectChanges();

                  this.alertService.showToast({
                    position: 'top-end',
                    icon: "error",
                    title: err.error.detalle,
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
        return this.data ? this.first + this.pageSize >= this.totalRecords : true;
    }

    isFirstPage(): boolean {
        return this.data ? this.first === 0 : true;
    }

    reload(): void{
      this.evtOnReload(true);
    }

    private buildMenuItems(selected: UnidadTransporteDto | undefined): MenuItem[] {
      return [
        { label: 'Editar', icon: 'pi pi-pencil text-amber-500!', command: () => { this.evtOnEdit(); }},
        { label: 'Eliminar', icon: 'pi pi-trash text-red-500!', command: () => { this.evtOnDelete(); }},
        { label: 'Activar', icon: 'pi pi-check-circle text-green-500!', command: () => { this.evtOnUpdateStatus(1); }, visible: selected?.id_estado === 0 },
        { label: 'Desactivar', icon: 'pi pi-ban text-gray-500!', command: () => { this.evtOnUpdateStatus(0); }, visible: selected?.id_estado === 1 },
      ];
    }
}