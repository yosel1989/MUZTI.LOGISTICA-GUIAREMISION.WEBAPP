import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef, inject, signal, computed } from '@angular/core';
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
import { ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ConductorApiService } from '@features/conductor/services/conductor-api.service';
import { MdlRegistrarConductorComponent } from '../../modals/mdl-registrar-conductor/mdl-registrar-conductor';
import { MdlEditarConductorComponent } from '../../modals/mdl-editar-conductor/mdl-editar-conductor';
import { ActualizarEstadoConductorResponseDto, ConductorDto, EliminarConductorResponseDto } from '@features/conductor/models/conductor.model';
import { AlertService } from 'app/core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LoaderComponent } from 'app/core/components/loaders/loader/loder.component';
import { ColumnsFilterDto } from 'app/core/models/filter';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EstadoActualizarRequestDTO } from 'app/shared/models/request';
import { ResponseDTO } from '@features/shared/models/shared';

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
      DatePipe,
      ContextMenuModule,
      ConfirmDialogModule,
      LoaderComponent,
      ReactiveFormsModule
  ],
  providers: [DialogService, ConfirmationService]
})

export class TableConductorPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    public util = inject(UtilService);
    private confirmationService = inject(ConfirmationService);
    private alertService = inject(AlertService);
    public dialogService = inject(DialogService);
    private api = inject(ConductorApiService);

    cols: Column[] = [];

    data = signal<ConductorDto[]>([]);

    ldData = signal(true);

    selected = signal<ConductorDto | undefined>(undefined);
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
        { field: 'id', header: 'Código', sort: false, sticky: false },
        { field: 'tipo_documento', header: 'T. Documento', sort: false, sticky: false },
        { field: 'numero_documento', header: 'N° Documento', sort: false, sticky: false },
        { field: 'nombres', header: 'Nombres', sort: false, sticky: false },
        { field: 'apellidos', header: 'Apellidos', sort: false, sticky: false },
        { field: 'cargo', header: 'Cargo', sort: false, sticky: false },
        { field: 'licencia', header: 'Distrito', sort: false, sticky: false },
        { field: 'tipo', header: 'Tipo', sort: false, sticky: false },
        { field: 'estado', header: 'Estado', sort: false, sticky: false },
        { field: 'fecha_registro', header: 'F. Registro', sort: false, sticky: false },
        { field: 'usuario_registro', header: 'U. Registro', sort: false, sticky: false },
        { field: 'fecha_modifico', header: 'F. Modifico', sort: false, sticky: false },
        { field: 'usuario_modifico', header: 'U. Modifico', sort: false, sticky: false },
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
    }

    // getters
    get paddedData(): (ConductorDto | {__empty: boolean})[] {
      const actual = this.data() ?? [];
      const fillerCount = this.pageSize() - actual.length;
      const fillerRows = Array.from({ length: fillerCount }, () => ({ __empty: true }));
      return [...actual, ...fillerRows];
    }

    // setters
    /** setSelected(data: ConductorDto | undefined) {
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
    
      this.subData = this.api.obtenerTodo(this.pageNumber, this.pageSize(), this.search).subscribe({
        next: (res: TableData<ConductorDto[]>) => {
          this.data.set(res.data.map(x => {
            x.fecha_registro = new Date(x.fecha_registro);
            x.fecha_modifico = x.fecha_modifico ? new Date(x.fecha_modifico) : null;
            x.ld_estado = false;
            x.ld_update = false;
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
              customClass: {
                container: 'z-[9999]!',
                popup: 'z-[9999]!'
              }
          });
          
        }
      });
    }

    // Events

    evtToggleSelection(row: ConductorDto): void{
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
      this.ref = this.dialogService.open(MdlRegistrarConductorComponent,  {
        width: '600px',
        closable: true,
        modal: true,
        draggable: false,
        position: 'top',
        header: 'Registrar Conductor',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body'
      });

      const sub = this.ref?.onChildComponentLoaded.subscribe((cmp: MdlRegistrarConductorComponent) => {
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

      this.ref = this.dialogService.open(MdlEditarConductorComponent,  {
        width: '600px',
        closable: true,
        modal: true,
        draggable: false,
        position: 'top',
        header: 'Editar Conductor',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        inputValues:{
          id: this.selected()?.id
        }
      });
      const sub = this.ref?.onChildComponentLoaded.subscribe((cmp: MdlEditarConductorComponent) => {

        const sub2 = cmp?.OnCreated.subscribe(( s: ConductorDto) => {
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

        const sub4 = cmp?.OnSubmited.subscribe(( v: boolean) => {
          const current = this.selected()!;
          this.selected.set({ ...current, ld_update: v });
        });

        this.subs.add(sub2);
        this.subs.add(sub3);
        this.subs.add(sub4);
      });

      this.subs.add(sub);
    }

    evtOnDelete(): void{
      this.confirmationService.confirm({
          header: '¿Eliminar conductor?',
          message: 'Confirmar la operación.',
          accept: () => {

              const sub = this.api.eliminar(this.selected()!.id).subscribe({
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
            
          }
      });
    }

    evtOnUpdateStatus(status: number): void{
      if(!this.handlerValidateSelected()) return;
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
      });
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

    // Functions
    
    isLastPage(): boolean {
        return this.data() ? this.first + this.pageSize() >= this.totalRecords : true;
    }

    isFirstPage(): boolean {
        return this.data() ? this.first === 0 : true;
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