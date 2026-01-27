import { Component, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableColumn } from 'app/core/models/table';
import { fakeItemsToGuia } from 'app/fake/items/models/fakeItemsToGuia';
import { ItemsToGuiaDto } from 'app/features/items/models/item-to-guia';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-mdl-items-listado',
  templateUrl: './mdl-items-listado.html',
  styleUrls: ['./mdl-items-listado.scss'],                          
  imports: [
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    PaginatorModule,
    SkeletonModule,
    CurrencyPipe,
    ToggleButtonModule,
    IconFieldModule,
    InputIconModule
  ],
})


export class MdlListadoItemsComponent implements OnInit, AfterViewInit, OnDestroy{

  @ViewChild('footer') footer: any;
  @Output() OnSelect: EventEmitter<ItemsToGuiaDto[]> = new EventEmitter<ItemsToGuiaDto[]>();

  data: ItemsToGuiaDto[] = [];
  selectedItems: ItemsToGuiaDto[] = [];
  cols: TableColumn[] = []
  ldData: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    this.data = fakeItemsToGuia.map(item => ({ ...item }));
    this.cols = [
      { field: 'code', header: 'Código', sort: true },
      { field: 'description', header: 'Descripción', sort: true},
      { field: 'unit_of_measure', header: 'Tipo de unidad', sort: true, sticky: true },
      { field: 'currency', header: 'Moneda', sort: true  },
      { field: 'unit_mount', header: 'Precio Unitario', sort: true  },
      { field: 'selected', header: 'Seleccionar', sort: false  }
    ];

  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }

  // functions

  isSelected(item: ItemsToGuiaDto): boolean{
    return !!this.selectedItems.find(x => x.code === item.code);
  }

  // events

  evtToggleSelected(item: ItemsToGuiaDto, selected: boolean): void {
    item.selected = selected;

    if (selected) {
      const exists = this.selectedItems.some(x => x.code === item.code);
      if (!exists) {
        this.selectedItems = [...this.selectedItems, item];
      }
    } else {
      this.selectedItems = this.selectedItems.filter(x => x.code !== item.code);
    }
  }

  evtSelect(): void{
    this.OnSelect.emit(this.selectedItems);
  }

}