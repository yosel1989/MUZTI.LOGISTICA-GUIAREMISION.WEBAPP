import { DatePipe, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef, inject, signal, computed, ViewChild, DestroyRef } from '@angular/core';
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
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableData } from 'app/core/models/table';
import { UtilService } from 'app/core/services/util.service';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmationService, MenuItem } from 'primeng/api';


import { AlertService } from 'app/core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LoaderComponent } from 'app/core/components/loaders/loader/loder.component';
import { ColumnsFilterDto } from 'app/core/models/filter';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EntityApiService } from '@features/entity/services/entity-service';
import { EntityDto, ProviderDto } from '@features/entity/models/entity';
import { MdlEntityCreate } from '../../modals/mdl-entity-create/mdl-entity-create';
import { MdlHeader } from '@core/components/modals/headers/mdl-header/mdl-header';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { Column } from 'app/shared/models/table';
import { MdlEntityEdit } from '../../modals/mdl-entity-edit/mdl-entity-edit';

@Component({
  selector: 'app-tbl-provider-principal',
  templateUrl: './tbl-provider-principal.html',
  styleUrl: './tbl-provider-principal.scss',
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
      ContextMenuModule,
      ConfirmDialogModule,
      LoaderComponent,
      ReactiveFormsModule,
      NgClass
  ],
  providers: [DialogService, ConfirmationService, DatePipe]
})

export class TblProviderPrincipal implements OnInit, AfterViewInit, OnDestroy{

    datePipe = inject(DatePipe);
    sanitizer = inject(DomSanitizer);
    destroyRef = inject(DestroyRef);
    @ViewChild('cm') cm: ContextMenu | undefined;

    public util = inject(UtilService);
    private confirmationService = inject(ConfirmationService);
    private alertService = inject(AlertService);
    public dialogService = inject(DialogService);
    private api = inject(EntityApiService);

    cols: Column[] = [];

    data = signal<ProviderDto[]>([]);

    ldData = signal(true);

    selected = signal<ProviderDto | undefined>(undefined);
    items = computed(() => this.buildMenuItems(this.selected()));
    loading: boolean = false;

    recordsTotalTable: number = 0;
    recordsTotal: number = 0;
    recordsFiltered: number = 0;
    first: number = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: DynamicDialogRef<any> | undefined | null;
    private subs = new Subscription();

    pageNumber: number = 1;
    pageSize = signal(10);
    totalRecords: number = 0;

    firstChange: boolean = false;

    filters: ColumnsFilterDto[] = [];
    search: string | null = null;

    subData: Subscription | undefined = undefined;
    ctrlSearch = new FormControl(null);
    

    constructor( private cd: ChangeDetectorRef ){}

    ngOnInit(): void{
      this.cols = [
        { field: 'select', header: '', sort: false, sticky: false  },
        { field: 'cod', header: '#', sort: false, sticky: false  },
        { field: 'document_number', header: 'N° Documento', sort: false, sticky: false },
        { field: 'type', header: 'Tipo', sort: false, sticky: false, tdClassName: 'text-center!', render: (rowData: ProviderDto)  => { 
          if (rowData.type === 'empresa') {
            return `<span class="uppercase px-3 text-slate-700 text-center flex items-center justify-center bg-slate-200 p-1  rounded-lg! font-medium"><i class="fa-light fa-building me-1"></i> ${rowData.type.toLocaleUpperCase()}</span>`;
          }
          return `<span class="uppercase px-3 text-slate-700 text-center flex items-center justify-center bg-slate-200 p-1 rounded-lg! font-medium"><i class="fa-light fa-user me-1"></i> ${rowData.type.toLocaleUpperCase()}</span>`;
        }},
        { field: 'name', header: 'Razón Social', sort: false, sticky: false },
        { field: 'first_name', header: 'Nombre', sort: false, sticky: false },
        { field: 'last_name', header: 'Apellido', sort: false, sticky: false },
        { field: 'document_type', header: 'Tipo Documento', sort: false, sticky: false, tdClassName: 'text-center!' },
        { field: 'ubigeo_id', header: 'Ubigeo', sort: false, sticky: false },
        { field: 'address', header: 'Dirección', sort: false, sticky: false },
        { field: 'country', header: 'País', sort: false, sticky: false, tdClassName: 'uppercase' },
        { field: 'is_internal', header: 'Interno', sort: false, sticky: false, thClassName: 'text-center!', render: (rowData: ProviderDto)  => { 
          if (rowData.is_internal) {
            return '<span class="uppercase w-25 text-green-700 text-center flex items-center justify-center  p-1 px-2 rounded-lg! font-medium"><span class="pi pi-check-circle"></span></span>';
          }
          return '<span class="uppercase w-25 text-red-700 text-center flex items-center justify-center p-1 px-2 rounded-lg! font-medium"><span class="pi pi-times-circle"></span></span>';
        } },
        { field: 'active', header: 'Estado', sort: false, sticky: false, render: (rowData: ProviderDto)  => { 
          if (rowData.active) {
            return '<span class="uppercase w-25 text-green-700 text-center flex items-center justify-center bg-green-100 p-1 px-2 rounded-lg! font-medium">Activo</span>';
          }
          return '<span class="uppercase w-25 text-gray-700 text-center flex items-center justify-center bg-gray-100 p-1 px-2 rounded-lg! font-medium">Inactivo</span>';
        }},
        { field: 'created_at', header: 'F. Registro', sort: false, sticky: false, render: (rowData: ProviderDto) => {
          return this.datePipe.transform(rowData.created_at, 'dd/MM/yyyy HH:mm:ss a');
        }},
        { field: 'created_at_user', header: 'U. Registro', sort: false, sticky: false },
        { field: 'updated_at', header: 'F. Modifico', sort: false, sticky: false, render: (rowData: ProviderDto) => {
          return rowData.updated_at ? this.datePipe.transform(rowData.updated_at, 'dd/MM/yyyy HH:mm:ss a') : '';
        }},
        { field: 'updated_at_user', header: 'U. Modifico', sort: false, sticky: false },
        { field: 'options', header: '<i class="fa-light fa-columns-3"></i>', sort: false, sticky: true, alignFrozen: 'right', thClassName: 'text-center!' },
      ];
    }

    ngAfterViewInit(): void{
      const s = this.ctrlSearch.valueChanges.subscribe((val: string | null) => {
        this.search = val;
        this.evtOnReload();
      });
      this.subs.add(s);
      this.loadData();
    }

    ngOnDestroy(): void{
      this.subs.unsubscribe();
      this.subData?.unsubscribe();
      this.ref?.close();
    }

    // getters
    get paddedData(): (ProviderDto | {__empty: boolean})[] {
      const actual = this.data() ?? [];
      const fillerCount = this.pageSize() - actual.length;
      const fillerRows = Array.from({ length: fillerCount }, () => ({ __empty: true }));
      return [...actual, ...fillerRows];
    }

    // setters
    /** setSelected(data: ProviderDto | undefined) {
      this.selectedSubject.next(data);
    }**/

    // data
    loadData(reload: boolean = false): void {
      this.subData?.unsubscribe();
      this.selected.set(undefined);
      this.firstChange = false;
      this.loading = true;
      this.ldData.set(true);

      if(reload){
        this.pageNumber = 1;
        this.first = 0;
      }
    
      this.subData = this.api.getCollection('proveedor', this.pageNumber, this.pageSize(), this.search).subscribe({
        next: (res: TableData<ProviderDto[]>) => {
          this.data.set(res.data.map(x => {
            x.created_at = new Date(x.created_at);
            x.updated_at = x.updated_at ? new Date(x.updated_at) : null;
            x.loading_status = false;
            x.loading_update = false;
            return x;
          }));

          this.pageNumber = res.page_number;
          this.pageSize.set(res.page_size);
          this.first = (this.pageNumber - 1) * this.pageSize();
          this.totalRecords = res.total_records;
          this.ldData.set(false);
          this.cd.detectChanges();
          this.loading = false;
        },
        error: (e: HttpErrorResponse) => {
          this.ldData.set(false); 
          this.loading = false; 
          this.data.set([]);

          this.alertService.showToast({
              position: 'top-end',
              icon: "error",
              title: e.error.detalle,
              showCloseButton: true,
              timerProgressBar: true,
              timer: 4000,
              target: 'body'
          });
          
        }
      });
    }

    // Events

    evtToggleSelection(row: ProviderDto): void{
      if (this.selected() === row) {
        this.selected.set(undefined);
      } else {
        this.selected.set(row);
      }
    }

    evtNext() {
      this.first = this.first + this.pageSize();
      this.pageNumber = this.pageNumber + 1;
      this.evtOnReload(false);
    }

    evtPrev() {
      this.first = this.first - this.pageSize();
      this.pageNumber--;
      this.evtOnReload(false);
    }

    private evtOnReload(reload: boolean = false): void{
      this.selected.set(undefined);
      this.loadData(reload);
    }

    evtOnCreate(): void{
      this.ref = this.dialogService.open(MdlEntityCreate,  {
        width: '600px',
        closable: false,
        modal: true,
        draggable: false,
        position: 'top',
        header: 'Registrar Proveedor',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        templates: {
          header: MdlHeader,
        },
        inputValues: {
          role: 'proveedor'
        }
      });

      this.ref?.onChildComponentLoaded
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cmp: MdlEntityCreate) => {
        cmp?.OnCreated
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.evtOnReload();
          this.ref?.close();
        });
        cmp?.OnCanceled
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.ref?.close();
        });
      });

    }

    evtOnEdit(): void{

      if(!this.handlerValidateSelected()) return;

      this.ref = this.dialogService.open(MdlEntityEdit,  {
        width: '600px',
        closable: false,
        modal: true,
        draggable: false,
        position: 'top',
        header: 'Editar Proveedor',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        inputValues:{
          id: this.selected()?.id,
          role: 'proveedor'
        },
        templates: {
          header: MdlHeader,
        }
      });

      this.ref?.onChildComponentLoaded.subscribe((cmp: MdlEntityEdit) => {

        cmp?.OnUpdated
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(( s: EntityDto) => {
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
        cmp?.OnCanceled
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.ref?.close();
        });

      });

    }

    evtOnDelete(): void{
      if(!this.handlerValidateSelected()) return;
      this.confirmationService.confirm({
          header: '¿Quitar de la lista de proveedores?',
          message: 'Confirmar la operación.',
          accept: () => {

              /*const sub = this.api.eliminar(this.selected()!.id).subscribe({
                next: (res: EliminarConductorResponseDto) => {

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
              this.subs.add(sub);
            */
          }
      });
    }

    evtOnUpdateStatus(status: number): void{
      /*if(!this.handlerValidateSelected()) return;
      this.confirmationService.confirm({
          header: !status ? '¿Desactivar el conductor?' : '¿Activar el conductor?',
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
                id_estado: status
              } as EstadoActualizarRequestDTO;

              const sub = this.api.actualizarEstado(this.selected()!.id, request)
              .subscribe({
                next: (res: ResponseDTO<ActualizarEstadoConductorResponseDto>) => {

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
                    title: err.error?.detalle,
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
              this.subs.add(sub);
            
          }
      });*/
    }

    evtFirstChange(first: number): void{
      this.pageNumber = (first / this.pageSize()) > 0 ? ((first / this.pageSize()) + 1) : 1 ;
    }

    evtRowsChange(rows: number): void{
      this.pageNumber = this.pageSize() === rows ? this.pageNumber : 1;
      this.pageSize.set( this.pageSize() === rows ? this.pageSize() : rows );
      this.first = (this.pageNumber - 1) * this.pageSize();
      this.loadData();
    }

    evtOnRowSelect(event: TableRowSelectEvent) {
      this.selected.set(event.data);
    }

    evtShowContextMenu(event: MouseEvent, rowData: ProviderDto) {
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


    // Functions

    
    isOpenCm(rowData: ProviderDto): boolean{
      return (this.cm?.visible() && rowData === this.selected()) ?? false;
    }
    
    isLastPage(): boolean {
        return this.data() ? this.first + this.pageSize() >= this.totalRecords : true;
    }

    isFirstPage(): boolean {
        return this.data() ? this.first === 0 : true;
    }

    reload(): void{
      this.evtOnReload(true);
    }

    private buildMenuItems(selected: ProviderDto | undefined): MenuItem[] {
      return [
        { label: 'Editar', icon: 'pi pi-pencil', command: () => { this.evtOnEdit(); }, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500'},
        //{ label: 'Eliminar', icon: 'pi pi-trash ', command: () => { this.evtOnDelete(); }, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500'},
        { label: 'Activar', icon: 'pi pi-check-circle ', command: () => { this.evtOnUpdateStatus(1); }, visible: selected?.active === false, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500'},
        { label: 'Desactivar', icon: 'pi pi-ban ', command: () => { this.evtOnUpdateStatus(0); }, visible: selected?.active === true, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500' },
      ];
    }

    // Handlers

    handlerValidateSelected(): boolean{
      if(!this.selected()){
        this.alertService.showToast({
          title: "Debe seleccionar un conductor",
          icon: "error",
          timer: 4000,
          timerProgressBar: true,
          showCloseButton: true
        });

        return false;
      }

      return true;
    }
}