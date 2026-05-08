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
import { ConductorDto, ConductorSugeridoDto } from '@features/conductor/models/conductor.model';
import { ConductorApiService } from '@features/conductor/services/conductor-api.service';
import { AlertService } from '@core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-mdl-lista-conductor',
  templateUrl: './mdl-lista-conductor.html',
  styleUrls: ['./mdl-lista-conductor.scss'],                          
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

export class MdlListaConductorComponent implements OnInit, AfterViewInit, OnDestroy{

  private alertService = inject(AlertService);

  @Output() OnSelect: EventEmitter<ConductorDto> = new EventEmitter<ConductorDto>();
  @Output() OnClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  data = signal<ConductorSugeridoDto[]>([]);
  selected: ConductorSugeridoDto | undefined;
  cols: TableColumn[] = []
  ldData = signal<boolean>(false);
  ldSelected = signal<boolean>(false);
  sbData: Subscription | undefined;
  search = new FormControl(null);

  constructor(
    private cdr: ChangeDetectorRef,
    private api: ConductorApiService,
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
      { field: 'nombres', header: 'Nombre', sort: true},
      { field: 'apellidos', header: 'Apellido', sort: true},
      { field: 'cargo', header: 'Cargo', sort: true},
      { field: 'licencia', header: 'N° Licencia', sort: true},
      { field: 'tipo', header: 'Tipo', sort: true},
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
      { numero_documento: i.toString() } as ConductorSugeridoDto
    )) );
    this.sbData?.unsubscribe();
    this.sbData = this.api.buscarSugerido(this.search.value)
    .pipe(finalize(() => this.ldData.set(false)))
    .subscribe({
      next: (value: ConductorSugeridoDto[]) => {
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


  getDataById(): void{
    this.ldSelected.set(true);
    this.sbData = this.api.buscarPorId(this.selected!.id)
    .pipe(finalize(() => { 
      this.ldSelected.set(false);
      this.ldData.set(false);
    }))
    .subscribe({
      next: (value: ConductorDto) => {
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
  }


  // events

  evtOnClose(): void{
    this.OnClose.emit(true);
  }

}