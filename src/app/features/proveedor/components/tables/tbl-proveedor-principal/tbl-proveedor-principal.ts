import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
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
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-tbl-proveedor-principal',
  templateUrl: './tbl-proveedor-principal.html',
  styleUrl: './tbl-proveedor-principal.scss',
  imports: [
        CommonModule,
        TableModule,
        SkeletonModule,
        TagModule,
        ToolbarModule,
        ButtonModule,
        DividerModule,
        IconFieldModule,
        InputIconModule,
        TooltipModule,
        InputTextModule
  ],
  providers: []
})

export class TableProveedorPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    cols: Column[] = [];

    data: ProveedorDto[] = [];
    ldData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    $ldData = this.ldData.asObservable();
    selected: ProveedorDto | undefined;


    recordsTotalTable: number = 0;
    recordsTotal: number = 0;
    recordsFiltered: number = 0;
    first: number = 0;

    constructor(
      private api: ProveedorApiService
    ){
        
    }

    ngOnInit(): void{
      this.cols = [
        { field: 'select', header: '', sort: false },
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
        { field: 'codigoSunat', header: 'Cod. Sunat', sort: true, sticky: false },
        { field: 'fechaCreacion', header: 'F. Creación', sort: true, sticky: false },
      ];


      this.loadData();
    }

    ngAfterViewInit(): void{

    }

    ngOnDestroy(): void{

    }

    // data
    loadData(): void{
      this.ldData.next(true);
      this.api.obtenerTodo().subscribe({
        next: (value: ProveedorDto[]) => {
          this.data = value;
          this.ldData.next(false);
        },
        error: (e: any) => {
          this.ldData.next(false);
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