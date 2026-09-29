import { DatePipe, NgClass } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, computed, DestroyRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MdlHeader } from '@core/components/modals/headers/mdl-header/mdl-header';
import { ErrorHandlerService } from '@core/handlers/error-handler.service';
import { AreaDto } from '@features/area/models/area';
import { AreaApiService } from '@features/area/services/area-api.service';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
import { LoaderComponent } from 'app/core/components/loaders/loader/loder.component';
import { ColumnsFilterDto } from 'app/core/models/filter';
import { TableData } from 'app/core/models/table';
import { AlertService } from 'app/core/services/alert.service';
import { UtilService } from 'app/core/services/util.service';
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
import { PopoverModule } from 'primeng/popover';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule, TableRowSelectEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { MdlAreaCreate } from '../../modals/mdl-area-create/mdl-area-create';
import { MdlAreaEdit } from '../../modals/mdl-area-edit/mdl-area-edit';
import { ToggleActiveResponseDto } from 'app/shared/models/request';
import { ResponseDTO } from '@features/shared/models/shared';
import { HttpErrorResponse } from '@angular/common/http';
import { AppendHtmlDirective } from '@core/directives/append-html.directive';

@Component({
  selector: 'app-tbl-area-principal',
  templateUrl: './tbl-area-principal.html',
  styleUrls: ['./tbl-area-principal.scss'],
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
      PopoverModule,
      NgClass,
      AppendHtmlDirective
  ],
  providers: [DialogService, ConfirmationService, DatePipe],
  animations: [fadeDownAnimation]
})

export class TblAreaPrincipal implements OnInit, AfterViewInit, OnDestroy{

    @ViewChild('cm') cm: ContextMenu | undefined;

    public datePipe = inject(DatePipe);
    public dialogService = inject(DialogService);
    private api = inject(AreaApiService);
    public util = inject(UtilService);
    private confirmationService = inject(ConfirmationService);
    private alertService = inject(AlertService);
    private errorHandler = inject(ErrorHandlerService);
    private destroyRef = inject(DestroyRef);

    cols: Column[] = [];

    data = signal<AreaDto[]>([]);
    ldData = signal<boolean>(true);
    selected = signal<AreaDto | undefined>(undefined);
    items = computed(() : MenuItem[] | undefined => {
      const selected = this.selected();
      return this.buildMenuItems(selected)
    });
    loading = signal<boolean>(false);

    recordsFiltered = signal<number>(0);
    first = signal<number>(0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: any | undefined;
    private subs = new Subscription();

    pageNumber = signal<number>(1);
    pageSize = signal<number>(10);
    totalRecords = signal<number>(0);

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
          { field: 'code', header: 'Código', sort: false, sticky: false },
          { field: 'name', header: 'Nombre', sort: false, sticky: false, tdClassName: 'font-semibold!' },
          { field: 'level', header: 'Nivel', sort: false, sticky: false, render: (rowData: AreaDto) => {
            return rowData.level === 1 ? 'Principal' : 'Subárea';
          }},
          { field: 'active', header: 'Estado', sort: false, sticky: false, render: (rowData: AreaDto)  => { 
            if (rowData.active) {
              return '<span class="uppercase w-25 text-green-700 text-center flex items-center justify-center bg-green-100 p-1 px-2 rounded-lg! font-medium">Activo</span>';
            }
            return '<span class="uppercase w-25 text-gray-700 text-center flex items-center justify-center bg-gray-100 p-1 px-2 rounded-lg! font-medium">Inactivo</span>';
          }},
          { field: 'created_at', header: 'F. Registro', sort: false, sticky: false, render: (rowData: AreaDto) => {
            return this.datePipe.transform(rowData.created_at, 'dd/MM/yyyy HH:mm:ss a');
          }},
          { field: 'created_at_user', header: 'U. Registro', sort: false, sticky: false },
          { field: 'updated_at', header: 'F. Modifico', sort: false, sticky: false, render: (rowData: AreaDto) => {
            return rowData.updated_at ? this.datePipe.transform(rowData.updated_at, 'dd/MM/yyyy HH:mm:ss a') : '';
          }},
          { field: 'updated_at_user', header: 'U. Modifico', sort: false, sticky: false },
          { field: 'options', header: '<i class="fa-light fa-columns-3"></i>', sort: false, sticky: true, alignFrozen: 'right', thClassName: 'text-center!' },
        ];
    }

    ngOnInit(): void{
    }

    ngAfterViewInit(): void{
      this.ctrlSearch.valueChanges.subscribe((val: string | null) => {
        this.search = val;
        this.evtOnReload();
      });
      this.loadData(true);
    }

    ngOnDestroy(): void{
      this.subs.unsubscribe();
      this.subData?.unsubscribe();
    }

    // getters

    paddedData = computed(() => {
      const actual = this.data() ?? [];
      const fillerCount = Math.max(0, this.pageSize() - actual.length);
      const fillerRows = Array.from({ length: fillerCount }, () => ({ __empty: true }));
      return [...actual, ...fillerRows];
    });

    // setters
    setSelected(data: AreaDto | undefined) {
      this.selected.set(data);
    }

    // data
    loadData(reload: boolean = false): void {
      this.subData?.unsubscribe();
      if(reload){ this.selected.set(undefined) };
      this.firstChange = false;
      this.loading.set(true);
      this.ldData.set(true);

      if(reload){
        this.pageNumber.set(1);
        this.first.set(0);
      }


      this.subData = this.api.getCollection(this.pageNumber(), this.pageSize(), this.search).subscribe({
        next: (res: TableData<AreaDto[]>) => {
          
          this.data.set(res.data.map(x => {
            x.created_at = new Date(x.created_at);
            x.updated_at = x.updated_at ? new Date(x.updated_at) : null;
            x.loading_active = false;
            x.loading_update = false;
            return x;
          }));

          this.pageNumber.set(res.page_number);
          this.pageSize.set(res.page_size);
          this.first.set( (this.pageNumber() - 1) * this.pageSize() );
          this.totalRecords.set( res.total_records );
          this.ldData.set(false);
          this.cd.detectChanges();
          this.loading.set( false );
        },
        error: () => {
          this.ldData.set(false);
          this.loading.set(false); 
          this.data.set([]);

          this.errorHandler.showError("Ocurrio un error al obtener los registros");
        }
      });
    }

    //events
    evtToggleSelection(row: AreaDto): void{
      if (this.selected() === row) {
        this.selected.set(undefined);
        this.setSelected(undefined);
      } else {
        this.selected.set(row);
        this.setSelected(row);
      }
    }

    evtNext() {
      this.first.set( this.first() + this.pageSize() );
      this.pageNumber.set( this.pageNumber() + 1 );
      this.evtOnReload(false);
    }

    evtPrev() {
      this.first.set( this.first() - this.pageSize() );
      this.pageNumber.update(current => current - 1);
      this.evtOnReload(false);
    }

    private evtOnReload(reload: boolean = true): void{
      if(reload){
        this.setSelected(undefined);
        this.selected.set(undefined);
      }
      
      this.loadData(reload);
    }

    evtShowContextMenu(event: MouseEvent, rowData: AreaDto) {
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


    evtOnCreate(): void{
      this.ref = this.dialogService.open(MdlAreaCreate,  {
        width: '500px',
        closable: false,
        draggable: false,
        modal: true,
        position: 'top',
        header: '<span class="inline-flex items-center justify-center w-9! h-9! rounded-lg! bg-slate-200! me-2!"><span class="pi pi-plus text-[14px]!"></span></span> Nueva área',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        templates: {
          header: MdlHeader
        }
      });

      this.ref.onChildComponentLoaded.subscribe((cmp: MdlAreaCreate) => {
        cmp?.OnCreated
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.evtOnReload();
          this.ref?.close();
        });
        cmp?.OnClose
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => { 
          this.ref?.close();
        });
      });
    }

    evtOnEdit(): void{
      this.ref = this.dialogService.open(MdlAreaEdit,  {
        width: '500px',
        closable: true,
        draggable: false,
        modal: true,
        position: 'top',
        header: '<span class="inline-flex items-center justify-center w-9! h-9! rounded-lg! bg-slate-200! me-2!"><span class="pi pi-pencil text-[14px]!"></span></span> Editar área',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        templates: {
          header: MdlHeader
        },
        inputValues:{
          id: this.selected()!.id
        }
      });

      this.ref.onChildComponentLoaded
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((cmp: MdlAreaEdit) => {

          cmp?.OnUpdated
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((s: AreaDto) => {
              this.ref?.close();

              const updated = { ...this.selected()!, ...s, loading_update: true };
              this.handlerReplaceRow(updated);
              this.selected.set(updated);

              setTimeout(() => {
                this.handlerReplaceRow(s);
                this.selected.set(s);
              }, 100);
            });
          
      });
    }

    evtOnDelete(): void{
      /*this.confirmationService.confirm({
          header: '¿Eliminar establecimiento?',
          message: 'Confirmar la operación.',
          accept: () => {

              const subs = this.api.delete(this.selected!.id).subscribe({
                next: (res: EliminarPerfilResponseDTO) => {

                  this.alertService.success(res.detalle);

                  this.loadData();
                },
                error: (err: HttpErrorResponse) => {

                  this.errorHandler.handle(err);
                }
              });
              this.subs.add(subs);
            
          },
          reject: () => {
              
          },
      });*/
    }

    evtOnToggleActive(status: boolean): void{
      if(!this.handlerValidateSelected()) return;

      this.confirmationService.confirm({
          header: !status ? '¿Desactivar el área?' : '¿Activar el área?',
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
              this.api.toogleActive(this.selected()!.id, status)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (res: ResponseDTO<ToggleActiveResponseDto>) => {

                  this.alertService.success(res.detalle);

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

                  this.errorHandler.handle(err);

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
      this.first.set( (this.pageNumber() - 1) * this.pageSize() );
      this.loadData();
    }

    evtOnRowSelect(event: TableRowSelectEvent) {
      this.selected.set(event.data);
    }


    //functions

    isOpenCm(rowData: AreaDto): boolean{
      return (this.cm?.visible() && rowData === this.selected()) ?? false;
    }

    isLastPage(): boolean {
      const lastPage = this.data() ? this.first() >= this.totalRecords() : true;
      return lastPage;
    }

    isFirstPage(): boolean {
      return this.data() ? this.first() === 0 : true;
    }

    reload(): void{
      this.evtOnReload();
    }

    private buildMenuItems(selected: AreaDto | undefined): MenuItem[] {
      return [
        { label: 'Editar', icon: 'pi pi-pencil', command: () => { this.evtOnEdit(); }, linkClass: 'h-8!', iconClass: 'text-[14px]!', labelClass: 'text-sm! font-medium! text-slate-500'},
        { label: 'Activar', icon: 'fa-light fa-circle-check ', command: () => { this.evtOnToggleActive(true)  }, visible: selected?.active === false, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500'},
        { label: 'Desactivar', icon: 'fa-light fa-ban ', command: () => { this.evtOnToggleActive(false) }, visible: selected?.active === true, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm!' }
      ];
    }

    // Handlers

    handlerValidateSelected(): boolean{
      if(!this.selected()){
        this.alertService.error("Debe seleccionar un área");

        return false;
      }

      return true;
    }


  private handlerReplaceRow(row: AreaDto) {
    this.data.update(arr => {
      const idx = this.data().findIndex(x => x.id === row.id);
      if (idx === -1) {
        console.warn('No se encontró la fila', row.id, arr.map(c => c.id));
        return arr;
      }
      const copy = [...arr];
      copy[idx] = row;
      return copy;
    });
  }

}