import { Component, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef, Output, EventEmitter, signal, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableColumn } from 'app/core/models/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { CommonModule } from '@angular/common';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { finalize, Subscription } from 'rxjs';
import { UtilService } from 'app/core/services/util.service';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ProveedorApiService } from '@features/proveedor/services/proveedor-api.service';
import { ProveedorDto, ProveedorSugeridoDto } from '@features/proveedor/models/proveedor';
import { AlertService } from '@core/services/alert.service';

@Component({
  selector: 'app-mdl-lista-proveedor',
  templateUrl: './mdl-lista-proveedor.html',
  styleUrls: ['./mdl-lista-proveedor.scss'],                          
  imports: [
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    PaginatorModule,
    SkeletonModule,
    ToggleButtonModule,
    IconFieldModule,
    InputIconModule,
    DynamicDialogModule
  ],
})

export class MdlListaProveedorComponent implements OnInit, AfterViewInit, OnDestroy{
  private alertService = inject(AlertService);

  @Output() OnSelect: EventEmitter<ProveedorDto> = new EventEmitter<ProveedorDto>();
  @Output() OnClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  data = signal<ProveedorSugeridoDto[]>([]);
  selected: ProveedorSugeridoDto | undefined;
  cols: TableColumn[] = [];
  ldData = signal<boolean>(false);
  ldSelected = signal<boolean>(false);
  sbData: Subscription | undefined;
  search = new FormControl(null);

  constructor(
    private cdr: ChangeDetectorRef,
    private api: ProveedorApiService,
    public util: UtilService
  ) {
    this.search.valueChanges.subscribe(res => {
      this.getData();
    });
  }

  ngOnInit(): void {
    this.cols = [
      { field: 'id', header: 'Código', sort: false },
      { field: 'numero_documento', header: 'N° Documento', sort: false },
      { field: 'razon_social', header: 'Nombre o Razón Social', sort: true},
      { field: 'direccion', header: 'Dirección', sort: true},
      { field: 'email', header: 'Email', sort: true},
      { field: 'codigo_sunat', header: 'Cod. Sunat', sort: true},
    ];
  }

  ngAfterViewInit(): void {
    this.getData();
  }

  ngOnDestroy(): void {
    this.sbData?.unsubscribe();
  }

  evtSelect(): void{
    this.getDataById();
  }

  // Data

  getData(): void{
    this.ldData.set(true);
    this.data.set( Array.from({ length: 5 }).map((_, i) => (
      { numero_documento: i.toString() } as ProveedorSugeridoDto
    )) );
    this.sbData?.unsubscribe();
    this.sbData = this.api.buscarSugerido(this.search.value)
    .pipe(finalize(() => { 
        this.ldData.set(false);
        this.cdr.markForCheck();
     }))
    .subscribe({
      next: (value: ProveedorSugeridoDto[]) => {
        this.data.set(value);
      },
      error: (err: any) => {
        this.data.set([]);
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
      },
    });
  }


  getDataById(): void{
    this.ldSelected.set(true);
    this.sbData = this.api.obtenerPorId(this.selected!.id)
    .pipe(finalize(() => { 
        this.ldData.set(false);
        this.ldSelected.set(false);
     }))
    .subscribe({
      next: (value: ProveedorDto) => {
        this.OnSelect.emit(value);
      },
      error: (err: any) => {
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
  }

  // events
  evtOnClose(): void{
    this.OnClose.emit(true);
  }

}