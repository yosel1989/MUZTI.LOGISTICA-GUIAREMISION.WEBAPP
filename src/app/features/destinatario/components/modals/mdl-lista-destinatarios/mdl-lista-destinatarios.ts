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
import { DestinatarioDto, DestinatarioSugeridoDto } from '@features/destinatario/models/destinatario';
import { DestinatarioApiService } from '@features/destinatario/services/destinatario-api.service';
import { Subscription } from 'rxjs';
import { UtilService } from 'app/core/services/util.service';
import { DynamicDialogModule } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-mdl-lista-destinatarios',
  templateUrl: './mdl-lista-destinatarios.html',
  styleUrls: ['./mdl-lista-destinatarios.scss'],                          
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


export class MdlListaDestinatariosComponent implements OnInit, AfterViewInit, OnDestroy{

  @Output() OnSelect: EventEmitter<DestinatarioDto> = new EventEmitter<DestinatarioDto>();

  data = signal<DestinatarioSugeridoDto[]>([]);
  selected: DestinatarioSugeridoDto | undefined;
  cols: TableColumn[] = []
  ldData = signal<boolean>(false);
  ldSelected = signal<boolean>(false);
  sbData: Subscription | undefined;
  search = new FormControl(null);


  constructor(
    private cdr: ChangeDetectorRef,
    private api: DestinatarioApiService,
    public util: UtilService
  ) {
    this.search.valueChanges.subscribe(res => {
      this.getData();
    });
  }

  ngOnInit(): void {
    this.cols = [
      //{ field: 'tipo_documento', header: 'T. Documento', sort: false },
      { field: 'numero_documento', header: 'N° Documento', sort: false },
      { field: 'razon_social', header: 'Nombre o Razón Social', sort: true},
      { field: 'codigo_sunat', header: 'Código Sunat', sort: true, sticky: true }
    ];
  }

  ngAfterViewInit(): void {
    this.getData();
  }

  ngOnDestroy(): void {
    this.sbData?.unsubscribe();
  }

  // functions

  /*isSelected(item: ItemsToAddGuiaDto): boolean{
    return !!this.selectedItems.find(x => x.code === item.code);
  }*/

  // events

  /*evtToggleSelected(item: ItemsToAddGuiaDto, selected: boolean): void {
    item.selected = selected;

    if (selected) {
      const exists = this.selectedItems.some(x => x.code === item.code);
      if (!exists) {
        this.selectedItems = [...this.selectedItems, item];
      }
    } else {
      this.selectedItems = this.selectedItems.filter(x => x.code !== item.code);
    }
  }*/

  evtSelect(): void{
    this.getDataById();
  }

  // Data

  getData(): void{
    this.ldData.set(true);
    this.data.set( Array.from({ length: 5 }).map((_, i) => (
      { numero_documento: i.toString() } as DestinatarioSugeridoDto
    )) );
    this.sbData?.unsubscribe();
    this.sbData = this.api.buscar(this.search.value).subscribe({
      next: (value: DestinatarioSugeridoDto[]) => {
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
      next: (value: DestinatarioDto) => {
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

}