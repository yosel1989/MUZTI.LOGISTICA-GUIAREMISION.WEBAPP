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
import { finalize, Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { TableData } from 'app/core/models/table';
import { UtilService } from 'app/core/services/util.service';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AlertService } from 'app/core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoaderComponent } from 'app/core/components/loaders/loader/loder.component';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ColumnsFilterDto } from 'app/core/models/filter';
import { TransportistaDto } from '@features/transportista/models/transportista';
import { TransportistaApiService } from '@features/transportista/services/transportista-api.service';
import { ActualizarEstadoResponseDto, EliminarResponseDto, ResponseDTO } from '@features/shared/models/shared';
import { MdlRegistrarTransportistaComponent } from '../../modals/mdl-registrar-transportista/mdl-registrar-transportista.component';
import { MdlEditarTransportistaComponent } from '../../modals/mdl-editar-transportista/mdl-editar-transportista.component';
import { EstadoActualizarRequestDTO } from 'app/shared/models/request';
import { MdlHeader } from '@core/components/modals/headers/mdl-header/mdl-header';

@Component({
  selector: 'app-tbl-transportista-principal',
  templateUrl: './tbl-transportista-principal.html',
  styleUrl: './tbl-transportista-principal.scss',
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
  providers: [DialogService, ConfirmationService],
  animations: [fadeDownAnimation]
})

export class TableTransportistaPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    @ViewChild('cm') cm: ContextMenu | undefined;

    public util = inject(UtilService);
    private confirmationService = inject(ConfirmationService);
    private alertService = inject(AlertService);
    public dialogService =  inject(DialogService);
    private api =  inject(TransportistaApiService);

    cols: Column[] = [];

    data = signal<TransportistaDto[]>([]);
    ldData = signal(true);
    selected = signal<TransportistaDto | undefined>(undefined);
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

    menuOpened = signal(false);

    constructor( private cd: ChangeDetectorRef ){ }

    ngOnInit(): void{
      this.cols = [
          { field: 'select', header: '', sort: false, sticky: false  },
          { field: 'cod', header: '#', sort: false, sticky: false  },
          { field: 'id', header: 'Código', sort: false, sticky: false },
          { field: 'tipo_documento', header: 'Tipo Doc.', sort: false, sticky: false },
          { field: 'numero_documento', header: 'N° Doc.', sort: false, sticky: false },
          { field: 'razon_social', header: 'Razón Social', sort: false, sticky: false },
          { field: 'departamento', header: 'Departamento', sort: false, sticky: false },
          { field: 'provincia', header: 'Provincia', sort: false, sticky: false },
          { field: 'distrito', header: 'Distrito', sort: false, sticky: false },
          { field: 'direccion', header: 'Dirección', sort: false, sticky: false },
          { field: 'codigo_sunat', header: 'Cod. Sunat', sort: false, sticky: false },
          { field: 'registro_mtc', header: 'Reg. MTC', sort: false, sticky: false },
          { field: 'email_contacto', header: 'Email Contacto', sort: false, sticky: false },
          { field: 'estado', header: 'Estado', sort: false, sticky: false },
          { field: 'fecha_registro', header: 'F. Registro', sort: false, sticky: false },
          { field: 'usuario_registro', header: 'U. Registro', sort: false, sticky: false },
          { field: 'fecha_modifico', header: 'F. Modifico', sort: false, sticky: false },
          { field: 'usuario_modifico', header: 'U. Modifico', sort: false, sticky: false },
          { field: 'options', header: '<i class="fa-light fa-columns-3"></i>', sort: false, sticky: true, alignFrozen: 'right' },
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
      this.ref?.close();
    }

    // getters
    get paddedData(): (TransportistaDto | { __empty: boolean })[] {
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

      this.subData = this.api.obtenerTodo(this.pageNumber(), this.pageSize(), this.search)
      .pipe(finalize(() => {
          this.ldData.set(false); 
          this.loading.set(false); 
      }))
      .subscribe({
        next: (res: TableData<TransportistaDto[]>) => {
          
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
        },
        error: (e: HttpErrorResponse) => {
          console.error(e);
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
    evtToggleSelection(row: TransportistaDto): void{
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
      this.ref = this.dialogService.open(MdlRegistrarTransportistaComponent,  {
        width: '700px',
        closable: false,
        draggable: false,
        modal: true,
        position: 'top',
        header: 'Registrar Transportista',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        templates: {
          header: MdlHeader
        }
      });

      const sub = this.ref.onChildComponentLoaded.subscribe((cmp: MdlRegistrarTransportistaComponent) => {
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

      if(!this.handlerValidateSelected()) return;

      this.ref = this.dialogService.open(MdlEditarTransportistaComponent,  {
        width: '700px',
        closable: false,
        draggable: false,
        modal: true,
        position: 'top',
        header: 'Editar Transportista',
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

      const sub = this.ref.onChildComponentLoaded.subscribe((cmp: MdlEditarTransportistaComponent) => {
        const sub2 = cmp?.OnCreated.subscribe(( s: TransportistaDto) => {
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
      if(!this.handlerValidateSelected()) return;
      this.confirmationService.confirm({
          header: '¿Eliminar Empresa Transportista?',
          message: 'Confirmar la operación.',
          accept: () => {

              const subs = this.api.eliminar(this.selected()!.id).subscribe({
                next: (res: EliminarResponseDto) => {

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
            
          }
      });
    }

    evtOnUpdateStatus(status: number): void{
      if(!this.handlerValidateSelected()) return;

      this.confirmationService.confirm({
          header: !status ? '¿Desactivar al transportista?' : '¿Activar al transportista?',
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

              const subs = this.api.actualizarEstado(this.selected()!.id, request).subscribe({
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
      this.pageNumber.set(this.pageSize() === rows ? this.pageNumber() : 1);
      this.pageSize.set(this.pageSize() === rows ? this.pageSize() : rows);
      this.first = (this.pageNumber() - 1) * this.pageSize();
      this.loadData();
    }


    evtOnRowSelect(event: TableRowSelectEvent) {
      this.selected.set(event.data);
    }

    evtShowContextMenu(event: MouseEvent, rowData: TransportistaDto) {
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

    isOpenCm(rowData: TransportistaDto): boolean{
      return (this.cm?.visible() && rowData === this.selected()) ?? false;
    }

    isLastPage(): boolean {
      return this.data() ? this.first >= this.recordsTotalTable : true;
    }

    isFirstPage(): boolean {
      return this.data() ? this.first === 0 : true;
    }

    reload(): void{
      this.evtOnReload();
    }

    private buildMenuItems(selected: TransportistaDto | undefined): MenuItem[] {
      return [
        { label: 'Editar', icon: 'pi pi-pencil', command: () => { this.evtOnEdit(); }, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500'},
        { label: 'Eliminar', icon: 'pi pi-trash', command: () => { this.evtOnDelete(); }, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500'},
        { label: 'Activar', icon: 'pi pi-check-circle', command: () => { this.evtOnUpdateStatus(1); }, visible: selected?.id_estado === 0, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500' },
        { label: 'Desactivar', icon: 'pi pi-ban', command: () => { this.evtOnUpdateStatus(0); }, visible: selected?.id_estado === 1, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500' },
      ];
    }


    // Handlers

    handlerValidateSelected(): boolean{
      if(!this.selected()){
        this.alertService.showToast({
          title: "Debe seleccionar un transportista",
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