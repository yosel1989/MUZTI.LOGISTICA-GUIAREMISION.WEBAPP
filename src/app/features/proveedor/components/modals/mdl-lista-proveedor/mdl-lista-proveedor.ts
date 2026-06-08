import { Component, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef, Output, EventEmitter, signal, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableColumn } from 'app/core/models/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { finalize, Subscription } from 'rxjs';
import { UtilService } from 'app/core/services/util.service';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ProveedorApiService } from '@features/proveedor/services/proveedor-api.service';
import { ProveedorDto, ProveedorSugeridoDto } from '@features/proveedor/models/proveedor';
import { AlertService } from '@core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { OnlyUpperDirective } from '@core/directives/only-uppers.directive';

@Component({
  selector: 'app-mdl-lista-proveedor',
  templateUrl: './mdl-lista-proveedor.html',
  styleUrls: ['./mdl-lista-proveedor.scss'],                          
  imports: [
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
    DynamicDialogModule,
    ProgressBarModule,
    InputGroupModule,
    InputGroupAddonModule,
    OnlyUpperDirective
  ],
})

export class MdlListaProveedorComponent implements OnInit, AfterViewInit, OnDestroy{
  private alertService = inject(AlertService);
  private api = inject(ProveedorApiService);
  public util = inject(UtilService);

  @Output() OnSelect: EventEmitter<ProveedorDto> = new EventEmitter<ProveedorDto>();
  @Output() OnClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  data = signal<ProveedorSugeridoDto[]>([]);
  selected: ProveedorSugeridoDto | undefined;
  cols: TableColumn[] = [];
  ldData = signal<boolean>(false);
  ldSelected = signal<boolean>(false);
  ldDataById = signal<boolean>(false);

  sb = new Subscription();
  sbData: Subscription | undefined;
  search = new FormControl(null, Validators.required);

  constructor( private cdr: ChangeDetectorRef ) { }

  ngOnInit(): void {
    this.search.valueChanges.subscribe((value: string | null) => {
      if(!value) this.data.set([]);
    });
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
  }

  ngOnDestroy(): void {
    this.sbData?.unsubscribe();
    this.sb.unsubscribe();
  }

  evtSelect(): void{
    this.ldSelected.set(true);
    this.loadDataById();
  }

  // Data

  getData(): void{

    if(this.search.invalid){
      return;
    }

    this.data.set([]);
    this.ldData.set(true);
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
      error: (err: HttpErrorResponse) => {
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


  loadDataById(): void{
    this.ldDataById.set(true);
    const s = this.api.obtenerPorId(this.selected!.id)
    .pipe(finalize(() => { 
        this.ldDataById.set(false);
        this.ldSelected.set(false);
     }))
    .subscribe({
      next: (value: ProveedorDto) => {
        console.log('proveedor seleccionado', value);
        this.OnSelect.emit(value);
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
    this.sb.add(s);
  }

  // events
  evtOnClose(): void{
    this.OnClose.emit(true);
  }

}