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
import { BehaviorSubject, Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { TableData } from 'app/core/models/table';
import { UtilService } from 'app/core/services/util.service';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { ConductorApiService } from '@features/conductor/services/conductor-api.service';
import { MdlRegistrarConductorComponent } from '../../modals/mdl-registrar-conductor/mdl-registrar-conductor';
import { MdlEditarConductorComponent } from '../../modals/mdl-editar-conductor/mdl-editar-conductor';
import { ConductorDto } from '@features/conductor/models/conductor.model';

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
        ContextMenuModule 
  ],
  providers: [DialogService]
})

export class TableConductorPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    cols: Column[] = [];

    data: ConductorDto[] = [];
    ldData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    $ldData = this.ldData.asObservable();
    selected: ConductorDto | undefined;
    loading: boolean = false;

    recordsTotalTable: number = 0;
    recordsTotal: number = 0;
    recordsFiltered: number = 0;
    first: number = 0;

    ref: any | undefined;
    private subs = new Subscription();

    pageNumber: number = 0;
    pageSize: number = 5;
    totalRecords: number = 0;

    items: MenuItem[] | undefined;

    constructor(
      public dialogService: DialogService,
      private api: ConductorApiService,
      private cd: ChangeDetectorRef,
      public util: UtilService
    ){
        this.cols = [
          { field: 'select', header: '', sort: false, sticky: false  },
          { field: 'id', header: '#', sort: false, sticky: false },
          { field: 'tipo_documento', header: 'T. Documento', sort: true, sticky: false },
          { field: 'numero_documento', header: 'N° Documento', sort: true, sticky: false },
          { field: 'nombres', header: 'Nombres', sort: true, sticky: false },
          { field: 'apellidos', header: 'Apellidos', sort: true, sticky: false },
          { field: 'cargo', header: 'Cargo', sort: true, sticky: false },
          { field: 'licencia', header: 'Distrito', sort: true, sticky: false },
          { field: 'fecha_creacion', header: 'F. Registro', sort: true, sticky: false },
          { field: 'empleado_nombre_creacion', header: 'U. Registro', sort: true, sticky: false },
          { field: 'fecha_ultima_edicion', header: 'F. Modifico', sort: true, sticky: false },
          { field: 'empleado_nombre_edicion', header: 'U. Modifico', sort: true, sticky: false },
          { field: 'estado', header: 'Estado', sort: true, sticky: false },
        ];
    }

    ngOnInit(): void{
      this.items = [
          { label: 'Editar', icon: 'pi pi-pencil text-amber-500!', command: () => { this.evtOnEdit(); }}
      ];
    }

    ngAfterViewInit(): void{
      this.loadData();
    }

    ngOnDestroy(): void{

    }

    // getters
    get paddedData(): any[] {
      const actual = this.data ?? [];
      const fillerCount = this.pageSize - actual.length;
      const fillerRows = Array.from({ length: fillerCount }, () => ({ __empty: true }));
      return [...actual, ...fillerRows];
    }

    // data
    loadData(): void {
      this.loading = true;
      this.ldData.next(true);
      this.api.obtenerTodo(this.pageNumber + 1, this.pageSize).subscribe({
        next: (res: TableData<ConductorDto[]>) => {
          this.data = res.data.map(x => {
            x.fecha_creacion = new Date(x.fecha_creacion);
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
          console.log('dd');
          console.log(e);
          this.ldData.next(false); 
          this.loading = false; 
        }
      });
    }

    //events
    evtToggleSelection(row: ConductorDto): void{
      if (this.selected === row) {
        this.selected = undefined; // deselecciona si ya estaba seleccionado
      } else {
        this.selected = row; // selecciona nuevo
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
      this.selected = undefined;
      this.loadData();
    }

    evtOnFilter(value: string){
      this.evtOnReload();
    }

    evtOnCreate(): void{
      this.ref = this.dialogService.open(MdlRegistrarConductorComponent,  {
        width: '1000px',
        closable: true,
        modal: true,
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
        width: '1000px',
        closable: true,
        modal: true,
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

    evtRowsChange(rows: number): void{
      this.pageSize = rows;
      this.loadData();
    }

    evtOnRowSelect(event: any) {
      this.selected = event.data;
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

}