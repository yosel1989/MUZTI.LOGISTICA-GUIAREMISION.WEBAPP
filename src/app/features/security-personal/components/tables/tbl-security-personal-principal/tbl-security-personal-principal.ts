import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef, inject, DestroyRef, ViewChild, signal } from '@angular/core';
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
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AlertService } from 'app/core/services/alert.service';
import { ErrorHandlerService } from '@core/handlers/error-handler.service';
import { LoaderComponent } from 'app/core/components/loaders/loader/loder.component';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ColumnsFilterDto } from 'app/core/models/filter';
import { Column } from 'app/shared/models/table';
import { SecurityPersonalApiService } from '@features/security-personal/services/security-personal-api.service';
import { SecurityPersonalDto } from '@features/security-personal/models/security-personal';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MdlHeader } from '@core/components/modals/headers/mdl-header/mdl-header';
import { PersonalDTO } from '@features/personal/models/personal.model';
import { MdlListaPersonalComponent } from '@features/personal/components/modals/mdl-lista-personal/mdl-lista-personal';
import { HttpErrorResponse } from '@angular/common/http';
import { MdlSecurityPersonalEntityBranchList } from '@features/security-personal-entity-branch/components/modals/mdl-security-personal-entity-branch-list/mdl-security-personal-entity-branch-list';
import { MdlSecurityPersonalEntityBranchSerieList } from '@features/security-personal-entity-branch-serie/components/modals/mdl-security-personal-entity-branch-serie-list/mdl-security-personal-entity-branch-serie-list';
import { Popover, PopoverModule } from 'primeng/popover';
import { MdlSecurityPersonalReasonForTransferList } from '@features/security-personal-reason-for-transfer/components/modals/mdl-security-personal-reason-for-transfer-list/mdl-security-personal-reason-for-transfer-list';

@Component({
  selector: 'app-tbl-security-personal-principal',
  templateUrl: './tbl-security-personal-principal.html',
  styleUrls: ['./tbl-security-personal-principal.scss'],
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
      ContextMenuModule,
      ConfirmDialogModule,
      LoaderComponent,
      ReactiveFormsModule,
      NgClass,
      PopoverModule
  ],
  providers: [DialogService, ConfirmationService, DatePipe],
  animations: [fadeDownAnimation]
})

export class TblSecurityPersonalPrincipal implements OnInit, AfterViewInit, OnDestroy{

    @ViewChild('cm') cm: ContextMenu | undefined;
    @ViewChild('opSeries') op!: Popover;
    @ViewChild('opEntityBranchs') opEntityBranchs!: Popover;

    public datePipe = inject(DatePipe);
    public dialogService = inject(DialogService);
    private api = inject(SecurityPersonalApiService);
    public util = inject(UtilService);
    private confirmationService = inject(ConfirmationService);
    private alertService = inject(AlertService);
    private errorHandler = inject(ErrorHandlerService);
    private destroyRef = inject(DestroyRef);

    cols: Column[] = [];

    data: SecurityPersonalDto[] = [];
    ldData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    $ldData = this.ldData.asObservable();
    selected = signal<SecurityPersonalDto | undefined>(undefined);
    private selectedSubject = new BehaviorSubject<SecurityPersonalDto | undefined>(undefined);
    items$ = this.selectedSubject.pipe(
      map(selected => this.buildMenuItems(selected))
    );
    loading: boolean = false;

    recordsTotalTable: number = 0;
    recordsTotal: number = 0;
    recordsFiltered: number = 0;
    first: number = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      private cd: ChangeDetectorRef
    ){
        this.cols = [
          { field: 'select', header: '', sort: false, sticky: false  },
          { field: 'cod', header: '#', sort: false, sticky: false  },
          { field: 'id', header: 'Código', sort: false, sticky: false },
          { field: 'person_full_name', header: 'Personal', sort: false, sticky: false },
          { field: 'person_document_number', header: 'N° Documento', sort: false, sticky: false },
          { field: 'person_role', header: 'Cargo', sort: false, sticky: false },
          { field: 'entity_branchs', header: 'Estab. Asig.', sort: false, sticky: false, tdClassName: 'text-center! font-semibold!' },
          { field: 'series', header: 'Series Asig.', sort: false, sticky: false, tdClassName: 'text-center! font-semibold!' },
          { field: 'active', header: 'Estado', sort: false, sticky: false, render: (rowData: SecurityPersonalDto)  => { 
            if (rowData.active) {
              return '<span class="uppercase w-25 text-green-700 text-center flex items-center justify-center bg-green-100 p-1 px-2 rounded-lg! font-medium">Activo</span>';
            }
            return '<span class="uppercase w-25 text-gray-700 text-center flex items-center justify-center bg-gray-100 p-1 px-2 rounded-lg! font-medium">Inactivo</span>';
          }},
          { field: 'created_at', header: 'F. Registro', sort: false, sticky: false, render: (rowData: SecurityPersonalDto) => {
            return this.datePipe.transform(rowData.created_at, 'dd/MM/yyyy HH:mm:ss a');
          }},
          { field: 'created_at_user', header: 'U. Registro', sort: false, sticky: false },
          { field: 'updated_at', header: 'F. Modifico', sort: false, sticky: false, render: (rowData: SecurityPersonalDto) => {
            return rowData.updated_at ? this.datePipe.transform(rowData.updated_at, 'dd/MM/yyyy HH:mm:ss a') : '';
          }},
          { field: 'updated_at_user', header: 'U. Modifico', sort: false, sticky: false },
          { field: 'options', header: '<i class="fa-light fa-columns-3"></i>', sort: false, sticky: true, alignFrozen: 'right', thClassName: 'text-center!' },
        ];
    }

    ngOnInit(): void{
      this.items = [
          { label: 'Activar', icon: 'pi pi-check-circle text-green-500!', command: () => { this.evtOnToggleActive(true); }},
          { label: 'Desactivar', icon: 'pi pi-ban text-gray-500!', command: () => { this.evtOnToggleActive(false); }},
      ];
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get paddedData(): any[] {
      const actual = this.data ?? [];
      const fillerCount = this.pageSize - actual.length;
      const fillerRows = Array.from({ length: fillerCount }, () => ({ __empty: true }));
      return [...actual, ...fillerRows];
    }

    // setters
    setSelected(data: SecurityPersonalDto | undefined) {
      this.selectedSubject.next(data);
    }

    // data
    loadData(reload: boolean = false): void {
      this.subData?.unsubscribe();
      if(reload){ this.selected.set(undefined) };
      this.firstChange = false;
      this.loading = true;
      this.ldData.next(true);

      if(reload){
        this.pageNumber = 1;
        this.first = 0;
      }


      this.subData = this.api.getCollection(this.pageNumber, this.pageSize, this.search).subscribe({
        next: (res: TableData<SecurityPersonalDto[]>) => {
          
          this.data = res.data.map(x => {
            x.created_at = new Date(x.created_at);
            x.updated_at = x.updated_at ? new Date(x.updated_at) : x.updated_at;
            x.loading_update = false;
            x.loading_active = false;
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
        error: () => {
          this.ldData.next(false);
          this.loading = false; 
          this.data = [];

          this.errorHandler.showError("Ocurrio un error al obtener los registros");
        }
      });
    }

    //events
    evtToggleSelection(row: SecurityPersonalDto): void{
      if (this.selected() === row) {
        this.selected.set(undefined);
        this.setSelected(undefined);
      } else {
        this.selected.set(row);
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

    private evtOnReload(reload: boolean = true): void{
      if(reload){
        this.setSelected(undefined);
        this.selected.set(undefined);
      }
      
      this.loadData(reload);
    }

    evtShowContextMenu(event: MouseEvent, rowData: SecurityPersonalDto) {
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
      this.ref = this.dialogService.open(MdlListaPersonalComponent,  {
        width: '700px',
        closable: false,
        modal: true,
        position: 'top',
        header: '<span class="inline-flex items-center justify-center w-9! h-9! rounded-lg! bg-slate-200! me-2!"><span class="pi pi-plus text-[14px]!"></span></span> Añadir personal',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        templates: {
          header: MdlHeader
        }
      });

      this.ref.onChildComponentLoaded.subscribe((cmp: MdlListaPersonalComponent) => {
        cmp?.OnSelect
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((value: PersonalDTO) => {
          this.handlerAddPerson(value);
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
      /*console.log(this.selected);
      this.ref = this.dialogService.open(MdlEditarPerfilComponent,  {
        width: '700px',
        closable: true,
        modal: true,
        position: 'top',
        header: 'Editar Perfil',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        inputValues:{
          id: this.selected!.id
        }
      });

      const sub = this.ref.onChildComponentLoaded.subscribe((cmp: MdlEditarPerfilComponent) => {
        const sub2 = cmp?.OnCreated.subscribe(( s: SecurityPersonalDto) => {
          this.selected!.ld_update = true;
          this.cd.detectChanges();

          setTimeout(() => {
            const idx = this.data.findIndex(x => x.id === this.selected!.id);
            if (idx > -1) {
              this.data[idx] = { ...this.selected!, ...s, ld_update: false };
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

      this.subs.add(sub);*/
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

    evtOnToggleActive(active: boolean): void{
      /*this.confirmationService.confirm({
          header: !status ? '¿Desactivar el establecimiento?' : '¿Activar el establecimiento?',
          message: 'Confirmar la operación.',
          accept: () => {

              this.selected!.ld_estado = true;
              this.cd.detectChanges();

              const request = {
                id_estado: status,
                usuario_modifico: 'SA'
              } as ActualizarEstadoPerfilRequestDTO;

              const subs = this.api.actualizarEstado(this.selected!.id, request).subscribe({
                next: (res: ActualizarEstadoPerfilResponseDTO) => {

                  this.alertService.success(res.detalle);

                  this.selected!.ld_estado = false;
                  this.selected!.id_estado = res.id_estado;
                  this.selected!.estado = res.estado;
                  this.selected!.usuario_modifico = res.usuario_modifico;
                  this.selected!.fecha_modifico = res.fecha_modifico;
                  this.cd.detectChanges();
                },
                error: (err: HttpErrorResponse) => {

                  this.selected!.ld_estado = false;
                  this.cd.detectChanges();

                  this.errorHandler.handle(err);
                }
              });
              this.subs.add(subs);
          },
          reject: () => {
              
          },
      });*/
    }

    evtFirstChange(first: number): void{
      this.pageNumber = (first / this.pageSize) > 0 ? ((first / this.pageSize) + 1) : 1 ;
    }

    evtRowsChange(rows: number): void{
      this.pageNumber = this.pageSize === rows ? this.pageNumber : 1;
      this.pageSize = this.pageSize === rows ? this.pageSize : rows;
      this.pageSize$.next(this.pageSize === rows ? this.pageSize : rows);
      this.first = (this.pageNumber - 1) * this.pageSize
      this.loadData(false);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    evtOnRowSelect(event: any) {
      this.selected.set(event.data);
      this.setSelected(event.data);
    }

    evtShowEntityBranchList(): void{
      this.ref = this.dialogService.open(MdlSecurityPersonalEntityBranchList,  {
        width: '700px',
        closable: false,
        draggable: false,
        modal: true,
        position: 'top',
        header: '<span class="inline-flex items-center justify-center w-9! h-9! rounded-lg! bg-slate-200! me-2!"><span class="fa-regular fa-house text-[14px]!"></span></span> Establecimientos asignados',
        styleClass: 'max-h-none! slide-down-dialog overflow-hidden!',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        templates: {
          header: MdlHeader
        },
        inputValues: {
          securityPersonal: this.selected()!
        },
        contentStyle: {
          padding: '0rem'
        }
      });

      this.ref.onChildComponentLoaded.subscribe((cmp: MdlSecurityPersonalEntityBranchList) => {
        cmp?.OnUpdateData
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.evtOnReload(false);
          })
      });
    }


    evtShowEntityBranchSerieList(): void{
      this.ref = this.dialogService.open(MdlSecurityPersonalEntityBranchSerieList,  {
        width: '700px',
        closable: false,
        draggable: false,
        modal: true,
        position: 'top',
        header: '<span class="inline-flex items-center justify-center w-9! h-9! rounded-lg! bg-slate-200! me-2!"><span class="fa-regular fa-hashtag text-[14px]!"></span></span> Series asignadas',
        styleClass: 'max-h-none! slide-down-dialog overflow-hidden!',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        templates: {
          header: MdlHeader
        },
        inputValues: {
          securityPersonal: this.selected()!
        },
        contentStyle: {
          padding: '0rem'
        }
      });

      this.ref.onChildComponentLoaded.subscribe((cmp: MdlSecurityPersonalEntityBranchSerieList) => {
        cmp?.OnUpdateSeries
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.evtOnReload(false);
          })
      });
    }

    evtShowReasonForTransferList(): void{
      this.ref = this.dialogService.open(MdlSecurityPersonalReasonForTransferList,  {
        width: '700px',
        closable: false,
        draggable: false,
        modal: true,
        position: 'top',
        header: '<span class="inline-flex items-center justify-center w-9! h-9! rounded-lg! bg-slate-200! me-2!"><span class="fa-regular fa-hashtag text-[14px]!"></span></span> Motivos de traslado asignados',
        styleClass: 'max-h-none! slide-down-dialog overflow-hidden!',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        templates: {
          header: MdlHeader
        },
        inputValues: {
          securityPersonal: this.selected()!
        },
        contentStyle: {
          padding: '0rem'
        }
      });

      this.ref.onChildComponentLoaded.subscribe((cmp: MdlSecurityPersonalEntityBranchSerieList) => {
        cmp?.OnUpdateSeries
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.evtOnReload(false);
          })
      });
    }


    evtToggleOpSeries(event: PointerEvent, rowData: SecurityPersonalDto) {
        this.selected.set(rowData);
        this.op.toggle(event);
    }

    evtToggleOpEntityBranchs(event: PointerEvent, rowData: SecurityPersonalDto) {
        this.selected.set(rowData);
        this.opEntityBranchs.toggle(event);
    }


    //functions

    isOpenCm(rowData: SecurityPersonalDto): boolean{
      return (this.cm?.visible() && rowData === this.selected()) ?? false;
    }

    isLastPage(): boolean {
      return this.data ? this.first >= this.recordsTotalTable : true;
    }

    isFirstPage(): boolean {
      return this.data ? this.first === 0 : true;
    }

    reload(): void{
      this.evtOnReload();
    }

    private buildMenuItems(selected: SecurityPersonalDto | undefined): MenuItem[] {
      return [
        { label: 'Establecimientos', icon: 'fa-light fa-house', command: () => { this.evtShowEntityBranchList(); }, linkClass: 'h-8!', iconClass: 'text-[14px]!', labelClass: 'text-sm! font-medium! text-slate-500'},
        { label: 'Series', icon: 'fa-light fa-hashtag', command: () => { this.evtShowEntityBranchSerieList(); }, linkClass: 'h-8!', iconClass: 'text-[14px]!', labelClass: 'text-sm! font-medium! text-slate-500'},
        { label: 'Motivos de traslado', icon: 'fa-light fa-hashtag', command: () => { this.evtShowReasonForTransferList(); }, linkClass: 'h-8!', iconClass: 'text-[14px]!', labelClass: 'text-sm! font-medium! text-slate-500'},
        { label: 'Activar', icon: 'fa-light fa-circle-check ', command: () => {  }, visible: selected?.active === false, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500'},
        { label: 'Desactivar', icon: 'fa-light fa-ban ', command: () => {  }, visible: selected?.active === true, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm!' }
      ];
    }

    // Handlers

    handlerAddPerson(value: PersonalDTO): void{
      this.api.create({person_id: value.id})
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.evtOnReload();
          },
          error: (err: HttpErrorResponse) => {
            this.errorHandler.handle(err);
          },
        })
    }

}