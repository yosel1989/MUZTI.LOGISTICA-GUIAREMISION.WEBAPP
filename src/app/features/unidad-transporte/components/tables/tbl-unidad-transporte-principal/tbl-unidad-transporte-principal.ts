import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef, signal, computed, inject, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule, TableRowSelectEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { TableData } from 'app/core/models/table';
import { UtilService } from 'app/core/services/util.service';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { AlertService } from 'app/core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { EliminarUnidadTransporteResponseDto, UnidadTransporteDto } from '@features/unidad-transporte/models/unidad-transporte.model';
import { UnidadTransporteApiService } from '@features/unidad-transporte/services/unidad-transporte-api.service';
import { MdlRegistrarUnidadTransporteComponent } from '../../modals/mdl-registrar-unidad-transporte/mdl-registrar-unidad-transporte';
import { MdlEditarUnidadTransporteComponent } from '../../modals/mdl-editar-unidad-transporte/mdl-editar-unidad-transporte';
import { LoaderComponent } from 'app/core/components/loaders/loader/loder.component';
import { ColumnsFilterDto } from 'app/core/models/filter';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActualizarEstadoResponseDto, ResponseDTO } from '@features/shared/models/shared';
import { ToggleActiveRequestDto } from 'app/shared/models/request';
import { MdlHeader } from '@core/components/modals/headers/mdl-header/mdl-header';
import { Column } from 'app/shared/models/table';

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
      DatePipe,
      ContextMenuModule,
      ConfirmDialogModule,
      LoaderComponent,
      ReactiveFormsModule
  ],
  providers: [DialogService, ConfirmationService]
})

export class TableUnidadTransportePrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    @ViewChild('cm') cm: ContextMenu | undefined;

    public util = inject(UtilService);
    private confirmationService = inject(ConfirmationService);
    private alertService = inject(AlertService);
    public dialogService = inject(DialogService);
    private api = inject(UnidadTransporteApiService);

    cols: Column[] = [];

    data = signal<UnidadTransporteDto[]>([]);
    ldData = signal(false);
    selected = signal<UnidadTransporteDto | undefined>(undefined);
    items = computed(() => this.buildMenuItems(this.selected()));
    loading = signal(false);

    recordsTotalTable: number = 0;
    recordsTotal: number = 0;
    recordsFiltered: number = 0;
    first: number = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: any | undefined;
    private subs = new Subscription();

    pageNumber = signal(1);
    pageSize = signal(10);
    totalRecords = signal(0);

    firstChange: boolean = false;

    filters: ColumnsFilterDto[] = [];
    search: string | null = null;

    subData: Subscription | undefined = undefined;
    ctrlSearch = new FormControl(null);

    constructor(
      private cd: ChangeDetectorRef
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
          { field: 'entidad_reguladora_vehicular', header: 'Entidad emisora de la autorización vehícular', sort: false, sticky: false },
          { field: 'nro_autorizacion', header: 'N° Autorización', sort: false, sticky: false },
          { field: 'tipo', header: 'Tipo', sort: false, sticky: false },
          { field: 'estado', header: 'Estado', sort: false, sticky: false },
          { field: 'fecha_registro', header: 'F. Registro', sort: false, sticky: false },
          { field: 'usuario_registro', header: 'U. Registro', sort: false, sticky: false },
          { field: 'fecha_modifico', header: 'F. Modifico', sort: false, sticky: false },
          { field: 'usuario_modifico', header: 'U. Modifico', sort: false, sticky: false },
          { field: 'options', header: '<i class="fa-light fa-columns-3"></i>', sort: false, sticky: true, alignFrozen: 'right' },
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
      this.ref?.close();
    }

    // getters
    get paddedData(): (UnidadTransporteDto | {__empty: boolean})[] {
      const actual = this.data() ?? [];
      const fillerCount = this.pageSize() - actual.length;
      const fillerRows = Array.from({ length: fillerCount }, () => ({ __empty: true }));
      return [...actual, ...fillerRows];
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

      this.subData = this.api.obtenerTodo(this.pageNumber(), this.pageSize(), this.search).subscribe({
        next: (res: TableData<UnidadTransporteDto[]>) => {
          this.data.set(res.data.map(x => {
            x.fecha_registro = new Date(x.fecha_registro);
            x.fecha_modifico = x.fecha_modifico ? new Date(x.fecha_modifico) : null;
            x.ld_estado = false;
            x.ld_update = false;
            return x;
          }));

          this.pageNumber.set(res.page_number);
          this.pageSize.set(res.page_size);
          this.first = (this.pageNumber() - 1) * this.pageSize();
          this.totalRecords.set(res.total_records);
          this.ldData.set(false);
          this.loading.set(false);
        },
        error: (e: HttpErrorResponse) => {
          console.log(e);
          this.ldData.set(false); 
          this.loading.set(false); 
          this.data.set([]);

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
      if (this.selected() === row) {
        this.selected.set(undefined);
      } else {
        this.selected.set(row);
      }
    }

    evtNext() {
      this.first = this.first + this.pageSize();
      this.pageNumber.set(this.pageNumber() + 1);
      this.evtOnReload(false);
    }

    evtPrev() {
      this.first = this.first - this.pageSize();
      this.pageNumber.update(current => current - 1);
      this.evtOnReload(false);
    }

    private evtOnReload(reload: boolean = false): void{
      this.selected.set(undefined);
      this.loadData(reload);
    }

    evtOnCreate(): void{
      this.ref = this.dialogService.open(MdlRegistrarUnidadTransporteComponent,  {
        width: '600px',
        closable: false,
        modal: true,
        draggable: false,
        position: 'top',
        header: 'Registrar Unidad de Transporte',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        templates: {
          header: MdlHeader
        }
      });

      const sub = this.ref.onChildComponentLoaded.subscribe((cmp: MdlRegistrarUnidadTransporteComponent) => {
        const sub2 = cmp?.OnCreated.subscribe(() => {
          this.evtOnReload();
          this.ref?.close();
        });
        const sub3 = cmp?.OnCanceled.subscribe(() => {
          this.ref?.close();
        });
        this.subs.add(sub2);
        this.subs.add(sub3);
      });

      this.subs.add(sub);
    }

    evtOnEdit(): void{
      this.ref = this.dialogService.open(MdlEditarUnidadTransporteComponent,  {
        width: '600px',
        closable: false,
        modal: true,
        draggable: false,
        position: 'top',
        header: 'Editar Unidad de Transporte',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        inputValues:{
          id: this.selected()!.id
        },
        templates: {
          header: MdlHeader
        }
      });

      const sub = this.ref.onChildComponentLoaded.subscribe((cmp: MdlEditarUnidadTransporteComponent) => {
        const sub2 = cmp?.OnCreated.subscribe(( s: UnidadTransporteDto ) => {
          this.ref?.close();

          this.selected.update(current => {
            const updated = { ...current!, ...s, ld_update: true };

            this.data.update(arr =>
              arr.map(c => c.id === updated.id ? updated : c)
            );

            return updated;
          });

          setTimeout(() => {
              const idx = this.data().findIndex(x => x.id === this.selected()?.id);
              if (idx > -1) {
                this.data.update(arr => {
                  const copy = [...arr];
                  copy[idx] = s;
                  return copy;
                });
                this.selected.set(s);
              }
          }, 1000);

        });
        const sub3 = cmp?.OnCanceled.subscribe(() => {
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

              const subs = this.api.eliminar(this.selected()!.id).subscribe({
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

    evtOnToggleActive(status: boolean): void{
      this.confirmationService.confirm({
          header: !status ? '¿Desactivar la Unidad de Transporte?' : '¿Activar la Unidad de Transporte',
          message: 'Confirmar la operación.',
          accept: () => {
              this.selected.update(current => {
                const updated = { ...current!, ld_estado: true };

                this.data.update(arr =>
                  arr.map(c => c.id === updated.id ? updated : c)
                );

                return updated;
              });

              const request = {
                id: this.selected()!.id,
                active: status
              } as ToggleActiveRequestDto;

              const subs = this.api.toogleActive(this.selected()!.id, request).subscribe({
                next: (res: ResponseDTO<ActualizarEstadoResponseDto>) => {

                  this.alertService.showToast({
                    position: 'top-end',
                    icon: "success",
                    title: res.detalle,
                    showCloseButton: true,
                    timerProgressBar: true,
                    timer: 4000
                  });

                  this.selected.update(current => {
                    const updated = {
                      ...current!,
                      ld_estado: false,
                      ld_update: false,
                      id_estado: res.data.id_estado,
                      estado: res.data.estado,
                      fecha_modifico: res.data.fecha_modifico,
                      usuario_modifico: res.data.usuario_modifico,
                      usuario_modifico_nombre: res.data.usuario_modifico_nombre
                    };

                    this.data.update(arr =>
                      arr.map(c => c.id === updated.id ? updated : c)
                    );

                    return updated;
                  });
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

                  this.selected.update(current => {
                    const updated = { ...current!, ld_estado: false };

                    this.data.update(arr =>
                      arr.map(c => c.id === updated.id ? updated : c)
                    );

                    return updated;
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
      this.pageNumber.set( (first / this.pageSize()) > 0 ? ((first / this.pageSize()) + 1) : 1 );
    }

    evtRowsChange(rows: number): void{
      this.pageNumber.set( this.pageSize() === rows ? this.pageNumber() : 1 );
      this.pageSize.set( this.pageSize() === rows ? this.pageSize() : rows );
      this.first = (this.pageNumber() - 1) * this.pageSize();
      this.loadData();
    }

    evtOnRowSelect(event: TableRowSelectEvent) {
      this.selected.set(event.data);
    }

    evtShowContextMenu(event: MouseEvent, rowData: UnidadTransporteDto) {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const currentSelected = this.selected();

      this.selected.set(rowData);
      if(this.cm?.visible()){
        if(currentSelected !== rowData){
          this.cm?.hide();
          const customEvent = new MouseEvent('contextmenu', {
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            view: event.view,
            clientX: rect.left + target.offsetWidth,
            clientY: rect.bottom
          });
          setTimeout(()=>{
            this.cm?.show(customEvent);
          },0);
        }
      }else{
        const customEvent = new MouseEvent(event.type, {
          bubbles: event.bubbles,
          cancelable: event.cancelable,
          view: event.view,
          clientX: rect.left + target.offsetWidth,
          clientY: rect.bottom
        });

        this.cm?.show(customEvent);
      }
    }

    //functions

    isOpenCm(rowData: UnidadTransporteDto): boolean{
      return (this.cm?.visible() && rowData === this.selected()) ?? false;
    }

    isLastPage(): boolean {
        return this.data() ? this.first + this.pageSize() >= this.totalRecords() : true;
    }

    isFirstPage(): boolean {
        return this.data() ? this.first === 0 : true;
    }

    reload(): void{
      this.evtOnReload(true);
    }

    private buildMenuItems(selected: UnidadTransporteDto | undefined): MenuItem[] {
      return [
        { label: 'Editar', icon: 'pi pi-pencil', command: () => { this.evtOnEdit(); }, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500'},
        { label: 'Eliminar', icon: 'pi pi-trash', command: () => { this.evtOnDelete(); }, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500'},
        { label: 'Activar', icon: 'pi pi-check-circle', command: () => { this.evtOnToggleActive(true); }, visible: selected?.id_estado === 0, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500' },
        { label: 'Desactivar', icon: 'pi pi-ban', command: () => { this.evtOnToggleActive(false); }, visible: selected?.id_estado === 1, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500' },
      ];
    }
}