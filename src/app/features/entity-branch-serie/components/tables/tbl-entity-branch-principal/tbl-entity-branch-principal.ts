import { DatePipe, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, computed, DestroyRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MdlHeader } from '@core/components/modals/headers/mdl-header/mdl-header';
import { EntityBranchDto } from '@features/entity-branch/models/entity-branch';
import { EntityBranchApiService } from '@features/entity-branch/services/entity-branch-api-service';
import { ResponseDTO } from '@features/shared/models/shared';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
import { LoaderComponent } from 'app/core/components/loaders/loader/loder.component';
import { ColumnsFilterDto } from 'app/core/models/filter';
import { TableData } from 'app/core/models/table';
import { AlertService } from 'app/core/services/alert.service';
import { UtilService } from 'app/core/services/util.service';
import { DeleteResponseDto, ToggleActiveRequestDto, ToggleActiveResponseDto } from 'app/shared/models/request';
import { Column } from 'app/shared/models/table';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { DividerModule } from 'primeng/divider';
import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule, TableRowSelectEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, Subscription } from 'rxjs';
import { MdlEntityBranchCreate } from '../../modals/mdl-entity-branch-create/mdl-entity-branch-create';
import { MdlEntityBranchEdit } from '../../modals/mdl-entity-branch-edit/mdl-entity-branch-edit';

@Component({
  selector: 'app-tbl-entity-branch-principal',
  templateUrl: './tbl-entity-branch-principal.html',
  styleUrl: './tbl-entity-branch-principal.scss',
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
  providers: [DialogService, ConfirmationService, DatePipe],
  animations: [fadeDownAnimation]
})

export class TblEntityBranchPrincipal implements OnInit, AfterViewInit, OnDestroy{

    @ViewChild('cm') cm: ContextMenu | undefined;

    private datePipe = inject(DatePipe);
    private destroyRef = inject(DestroyRef);
    public dialogService = inject(DialogService);
    private api = inject(EntityBranchApiService);
    public util = inject(UtilService);
    private confirmationService = inject(ConfirmationService);
    private alertService = inject(AlertService);

    cols: Column[] = [];

    data = signal<EntityBranchDto[]>([]);
    ldData = signal(true);
    selected = signal<EntityBranchDto | undefined>(undefined);
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

    paddedData = computed<(EntityBranchDto | { __empty: boolean })[]>(() => {
      const actual = this.data() ?? [];
      const fillerCount = this.pageSize() - actual.length;
      const fillerRows = Array.from({ length: fillerCount }, () => ({ __empty: true }));
      return [...actual, ...fillerRows];
    });

    constructor( private cd: ChangeDetectorRef ){ }

    ngOnInit(): void{
      this.cols = [
          { field: 'select', header: '', sort: false, sticky: false  },
          { field: 'cod', header: '#', sort: false, sticky: false  },
          { field: 'entity_name', header: 'Nombre o Razón Social', sort: false, sticky: false },
          { field: 'entity_document_number', header: 'N° Documento', sort: false, sticky: false },
          { field: 'description', header: 'Descripción / Alías', sort: false, sticky: false, tdClassName: 'font-medium!' },
          { field: 'area', header: 'Area', sort: false, sticky: false },
          { field: 'ubigeo_id', header: 'Ubigeo', sort: false, sticky: false, tdClassName: 'text-center!' },
          { field: 'department', header: 'Departamento', sort: false, sticky: false },
          { field: 'province', header: 'Provincia', sort: false, sticky: false },
          { field: 'district', header: 'Distrito', sort: false, sticky: false },
          { field: 'address', header: 'Dirección', sort: false, sticky: false },
          { field: 'email', header: 'Correo', sort: false, sticky: false },
          { field: 'serie', header: 'Serie', sort: false, sticky: false },
          { field: 'code_sunat', header: 'Cod. Sunat', sort: false, sticky: false },
          { field: 'active', header: 'Estado', sort: false, sticky: false, render: (rowData: EntityBranchDto)  => { 
            if (rowData.active) {
              return '<span class="uppercase w-25 text-green-700 text-center flex items-center justify-center bg-green-100 p-1 px-2 rounded-lg! font-medium">Activo</span>';
            }
            return '<span class="uppercase w-25 text-gray-700 text-center flex items-center justify-center bg-gray-100 p-1 px-2 rounded-lg! font-medium">Inactivo</span>';
          }},
          { field: 'created_at', header: 'F. Registro', sort: false, sticky: false, render: (rowData: EntityBranchDto) => {
            return this.datePipe.transform(rowData.created_at, 'dd/MM/yyyy HH:mm:ss a');
          }},
          { field: 'created_at_user', header: 'U. Registro', sort: false, sticky: false },
          { field: 'updated_at', header: 'F. Modifico', sort: false, sticky: false, render: (rowData: EntityBranchDto) => {
            return rowData.updated_at ? this.datePipe.transform(rowData.updated_at, 'dd/MM/yyyy HH:mm:ss a') : '';
          }},
          { field: 'updated_at_user', header: 'U. Modifico', sort: false, sticky: false },
          { field: 'options', header: '<i class="fa-light fa-columns-3"></i>', sort: false, sticky: true, alignFrozen: 'right', thClassName: 'text-center!' },
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

      this.subData = this.api.getAll(this.pageNumber(), this.pageSize(), this.search)
      .pipe(finalize(() => {
        this.loading.set(false);
        this.ldData.set(false);
      }))
      .subscribe({
        next: (res: TableData<EntityBranchDto[]>) => {
          
          this.data.set(res.data.map(x => {
            x.created_at = new Date(x.created_at);
            x.updated_at = x.updated_at ? new Date(x.updated_at) : x.updated_at;
            x.loading_active = false;
            x.loading_update = false;
            return x;
          }));

          this.pageNumber.set(res.page_number);
          this.pageSize.set(res.page_size);
          this.first = (this.pageNumber() - 1) * this.pageSize();
          this.totalRecords.set(res.total_records);
        },
        error: (e: HttpErrorResponse) => {
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
    evtToggleSelection(row: EntityBranchDto): void{
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
      this.ref = this.dialogService.open(MdlEntityBranchCreate,  {
        width: '700px',
        closable: false,
        draggable: false,
        modal: true,
        position: 'top',
        header: 'Registrar Establecimiento',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        templates: {
          header: MdlHeader
        }
      });

      const sub = this.ref.onChildComponentLoaded.subscribe((cmp: MdlEntityBranchCreate) => {
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

      this.ref = this.dialogService.open(MdlEntityBranchEdit,  {
        width: '700px',
        closable: false,
        draggable: false,
        modal: true,
        position: 'top',
        header: 'Editar Establecimiento',
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

      this.ref.onChildComponentLoaded
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cmp: MdlEntityBranchEdit) => {
        
        cmp?.OnUpdated
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(( s: EntityBranchDto) => {
          this.ref?.close();

          this.selected.update(current => {
            const updated = { ...current!, ...s, loading_update: true };

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
      this.confirmationService.confirm({
          header: '¿Eliminar establecimiento?',
          message: 'Confirmar la operación.',
          accept: () => {

              const subs = this.api.delete(this.selected()!.id).subscribe({
                next: (res: ResponseDTO<DeleteResponseDto>) => {

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

    evtOnToggleActive(status: boolean): void{
      if(!this.handlerValidateSelected()) return;

      this.confirmationService.confirm({
          header: !status ? '¿Desactivar el establecimiento?' : '¿Activar el establecimiento?',
          message: 'Confirmar la operación.',
          accept: () => {
              this.selected.update(current => {
                const updated = { ...current!, loading_active: true };

                this.data.update(arr =>
                  arr.map(c => c.id === updated.id ? { ...c, loading_active: true } : c)
                );

                return updated;
              });
              
              this.cd.detectChanges();

              const request = {
                id: this.selected()!.id,
                active: status
              } as ToggleActiveRequestDto;

              this.api.toggleActive(this.selected()!.id, request)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (res: ResponseDTO<ToggleActiveResponseDto>) => {

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
                      loading_active: false,
                      loading_update: false,
                      active: res.data.active,
                      updated_at: res.data.updated_at,
                      updated_at_user: res.data.updated_at_user,
                      updated_at_user_name: res.data.updated_at_user_name
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
                    const updated = { ...current!, loading_active: false };

                    this.data.update(arr =>
                      arr.map(c => c.id === updated.id ? updated : c)
                    );

                    return updated;
                  });
                }
              });
          }
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
      this.selected.set( event.data );
    }

    evtShowContextMenu(event: MouseEvent, rowData: EntityBranchDto) {
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

    isOpenCm(rowData: EntityBranchDto): boolean{
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

    private buildMenuItems(selected: EntityBranchDto | undefined): MenuItem[] {
      return [
        { label: 'Editar', icon: 'pi pi-pencil', command: () => { this.evtOnEdit(); },  linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500'},
        { label: 'Eliminar', icon: 'pi pi-trash', command: () => { this.evtOnDelete(); },  linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500'},
        { label: 'Activar', icon: 'pi pi-check-circle', command: () => { this.evtOnToggleActive(true); }, visible: !selected?.active,  linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500' },
        { label: 'Desactivar', icon: 'pi pi-ban', command: () => { this.evtOnToggleActive(false); }, visible: selected?.active,  linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500' },
      ];
    }

    // Handlers

    handlerValidateSelected(): boolean{
      if(!this.selected()){
        this.alertService.showToast({
          title: "Debe seleccionar un establecimiento",
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