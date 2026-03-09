import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ProveedorDto } from '@features/proveedor/models/proveedor';
import { ProveedorApiService } from '@features/proveedor/services/proveedor-api.service';
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
import { MdlRegistrarProveedorComponent } from '../../modals/mdl-registrar-proveedor/mdl-registrar-proveedor.component';
import { DialogService } from 'primeng/dynamicdialog';
import { AlertService } from 'app/core/services/alert.service';
import { TableData } from 'app/core/models/table';
import { MdlEditarProveedorComponent } from '../../modals/mdl-editar-proveedor/mdl-editar-proveedor.component';
import { UtilService } from 'app/core/services/util.service';

@Component({
  selector: 'app-tbl-proveedor-principal',
  templateUrl: './tbl-proveedor-principal.html',
  styleUrl: './tbl-proveedor-principal.scss',
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
        DatePipe
  ],
  providers: [DialogService]
})

export class TableProveedorPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    cols: Column[] = [];

    data: ProveedorDto[] = [];
    ldData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    $ldData = this.ldData.asObservable();
    selected: ProveedorDto | undefined;
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

    constructor(
      public dialogService: DialogService,
      private alertService: AlertService,
      private api: ProveedorApiService,
      private cd: ChangeDetectorRef,
      public util: UtilService
    ){
        this.cols = [
          { field: 'select', header: '', sort: false, sticky: true  },
          { field: 'id', header: '#', sort: false, sticky: true },
          { field: 'tipo_documento', header: 'T. Documento', sort: true, sticky: true },
          { field: 'numero_documento', header: 'N° Documento', sort: true, sticky: false },
          { field: 'razon_social', header: 'R. Social', sort: true, sticky: false },
          { field: 'departamento', header: 'Departamento', sort: true, sticky: false },
          { field: 'provincia', header: 'Provincia', sort: true, sticky: false },
          { field: 'distrito', header: 'Distrito', sort: true, sticky: false },
          { field: 'direccion', header: 'Dirección', sort: true, sticky: false },
          { field: 'email', header: 'Correo', sort: true, sticky: false },
          { field: 'pais', header: 'País', sort: true, sticky: false },
          { field: 'codigo_sunat', header: 'Cod. Sunat', sort: true, sticky: false },
          { field: 'fecha_creacion', header: 'F. Registro', sort: true, sticky: false },
          { field: 'empleado_nombre_creacion', header: 'U. Registro', sort: true, sticky: false },
          { field: 'fecha_ultima_edicion', header: 'F. Modifico', sort: true, sticky: false },
          { field: 'empleado_nombre_edicion', header: 'U. Modifico', sort: true, sticky: false },
          { field: 'estado', header: 'Estado', sort: true, sticky: false },
        ];
    }

    ngOnInit(): void{
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
        next: (res: TableData<ProveedorDto[]>) => {
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
    evtToggleSelection(row: ProveedorDto): void{
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
      this.ref = this.dialogService.open(MdlRegistrarProveedorComponent,  {
        width: '1000px',
        closable: true,
        modal: true,
        position: 'top',
        header: 'Registrar Proveedor',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body'
      });

      const sub = this.ref.onChildComponentLoaded.subscribe((cmp: MdlRegistrarProveedorComponent) => {
        const sub2 = cmp?.OnCreated.subscribe(( s: MdlRegistrarProveedorComponent) => {
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
      this.ref = this.dialogService.open(MdlEditarProveedorComponent,  {
        width: '1000px',
        closable: true,
        modal: true,
        position: 'top',
        header: 'Editar Proveedor',
        styleClass: 'max-h-none! slide-down-dialog',
        maskStyleClass: 'overflow-y-auto py-4',
        appendTo: 'body',
        inputValues:{
          id: this.selected!.id
        }
      });

      const sub = this.ref.onChildComponentLoaded.subscribe((cmp: MdlEditarProveedorComponent) => {
        const sub2 = cmp?.OnCreated.subscribe(( s: MdlEditarProveedorComponent) => {
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

    evtFirstChange(event: any): void{
      console.log(event);
    }

    evtRowsChange(event: any): void{
      console.log(event);
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