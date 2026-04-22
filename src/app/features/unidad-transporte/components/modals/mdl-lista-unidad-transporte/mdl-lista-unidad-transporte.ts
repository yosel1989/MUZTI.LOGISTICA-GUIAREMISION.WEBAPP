import { Component, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef, Output, EventEmitter, signal } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { UtilService } from 'app/core/services/util.service';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { UnidadTransporteDto, UnidadTransporteSugeridoDto } from '@features/unidad-transporte/models/unidad-transporte.model';
import { UnidadTransporteApiService } from '@features/unidad-transporte/services/unidad-transporte-api.service';

@Component({
  selector: 'app-mdl-lista-unidad-transporte',
  templateUrl: './mdl-lista-unidad-transporte.html',
  styleUrls: ['./mdl-lista-unidad-transporte.scss'],                          
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


export class MdlListaUnidadTransporteComponent implements OnInit, AfterViewInit, OnDestroy{

  @Output() OnSelect: EventEmitter<UnidadTransporteDto> = new EventEmitter<UnidadTransporteDto>();
  @Output() OnClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  data = signal<UnidadTransporteSugeridoDto[]>([]);
  selected: UnidadTransporteSugeridoDto | undefined;
  cols: TableColumn[] = []
  ldData = signal<boolean>(false);
  ldSelected = signal<boolean>(false);
  sbData: Subscription | undefined;
  search = new FormControl(null);


  constructor(
    private cdr: ChangeDetectorRef,
    private api: UnidadTransporteApiService,
    public util: UtilService
  ) {
    this.search.valueChanges.subscribe(res => {
      this.getData();
    });
  }

  ngOnInit(): void {
    this.cols = [
      { field: 'id', header: 'Código', sort: false },
      { field: 'placa', header: 'Placa', sort: false },
      { field: 'tarjeta', header: 'N° Tarjeta', sort: true},
      { field: 'tipo', header: 'Tipo', sort: true}
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
      { placa: i.toString() } as UnidadTransporteSugeridoDto
    )) );
    this.sbData?.unsubscribe();
    this.sbData = this.api.buscar(this.search.value).subscribe({
      next: (value: UnidadTransporteSugeridoDto[]) => {
        this.data.set(value);
        this.ldData.set(false);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.data.set([]);
        this.ldData.set(false);
      },
    });
  }


  getDataById(): void{
    this.ldSelected.set(true);
    this.sbData = this.api.getById(this.selected!.id).subscribe({
      next: (value: UnidadTransporteDto) => {
        this.OnSelect.emit(value);
        this.ldSelected.set(false);
      },
      error: (err: any) => {
        this.data.set([]);
        this.ldData.set(false);
        this.ldSelected.set(false);
      }
    });
  }


  // events

  evtOnClose(): void{
    this.OnClose.emit(true);
  }

}