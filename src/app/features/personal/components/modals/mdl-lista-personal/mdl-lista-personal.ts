import { Component, OnDestroy, OnInit, AfterViewInit, Output, EventEmitter, signal, inject } from '@angular/core';
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
import { AlertService } from '@core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PersonalApiService } from '@features/personal/services/personal-api.service';
import { PersonalDTO, PersonalSugeridoDTO } from '@features/personal/models/personal.model';

@Component({
  selector: 'app-mdl-lista-personal',
  templateUrl: './mdl-lista-personal.html',
  styleUrls: ['./mdl-lista-personal.scss'],                          
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

export class MdlListaPersonalComponent implements OnInit, AfterViewInit, OnDestroy{

  private alertService = inject(AlertService);
  private api = inject(PersonalApiService);
  public util = inject(UtilService);

  @Output() OnSelect: EventEmitter<PersonalDTO> = new EventEmitter<PersonalDTO>();
  @Output() OnClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  data = signal<PersonalSugeridoDTO[]>([]);
  selected : PersonalSugeridoDTO | undefined = undefined;
  cols: TableColumn[] = []
  ldData = signal<boolean>(false);
  ldSelected = signal<boolean>(false);
  sbData: Subscription | undefined;
  search = new FormControl(null);

  ngOnInit(): void {
    this.search.valueChanges.subscribe(() => {
      this.getData();
    });
    this.cols = [
      { field: 'id', header: 'Código', sort: false },
      { field: 'nombre', header: 'Nombre', sort: false },
      { field: 'apellido', header: 'Apellido', sort: true},
      { field: 'cargo', header: 'Cargo', sort: true}
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
    this.sbData?.unsubscribe();
    this.sbData = this.api.getPersonalSugerido(this.search.value)
    .pipe(finalize(() => this.ldData.set(false)))
    .subscribe({
      next: (value: PersonalSugeridoDTO []) => {
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
        this.OnClose.emit();
      },
    });
  }


  getDataById(): void{
    this.ldSelected.set(true);
    this.sbData = this.api.getPersonalPorId(this.selected!.id)
    .pipe(finalize(() => { 
      this.ldSelected.set(false);
      this.ldData.set(false);
    }))
    .subscribe({
      next: (value: PersonalDTO) => {
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