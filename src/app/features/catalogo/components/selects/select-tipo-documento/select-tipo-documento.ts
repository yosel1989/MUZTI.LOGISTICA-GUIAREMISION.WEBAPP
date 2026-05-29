import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, inject, signal, EventEmitter, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '@core/services/alert.service';
import { TipoDocumentoDTO } from '@features/catalogo/models/catalogo.model';
import { CatalogoApiService } from '@features/catalogo/services/catalogo-api.service';
import { SelectModule } from 'primeng/select';
import { finalize, Subscription } from 'rxjs';

export interface SelectTipoDocumento{
    label: string;
    value: string;
}

@Component({
  selector: 'app-select-tipo-documento',
  templateUrl: './select-tipo-documento.html',
  styleUrl: './select-tipo-documento.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule
  ]
})

export class SelectTipoDocumentoComponent implements OnInit, AfterViewInit, OnDestroy{

    private catalogoApiService = inject(CatalogoApiService);
    private alertService = inject(AlertService);

    @Input() classLabel: string = 'text-xs';
    @Input() label: string | null = null;
    @Input() control!: FormControl;
    @Input() default: string | number | null = null;
    @Input() disabled: boolean = false;
    @Input() invalid: boolean = false;
    @Input() tipoRegimen: string | null | 'natural' | 'juridico' = null;
    @Output() selectedChange = new EventEmitter<TipoDocumentoDTO | undefined>;

    data = signal<TipoDocumentoDTO[]>([]);
    ldData = signal(false);
    selected = signal<TipoDocumentoDTO | undefined>(undefined);

    subs = new Subscription();

    constructor() {}

    ngOnInit(): void {
      this.loadData();
    }

    ngAfterViewInit(): void {
        this.control.valueChanges.subscribe((val: number | null)=>{
          if(val) {
            this.selectedChange.emit(this.data().find(x => x.id === val));
            this.selected.set(this.data().find(x => x.id === val));
          }
        });
    }

    ngOnDestroy(): void {
      this.subs.unsubscribe();
    }

    // Data

    loadData(): void{
      this.ldData.set(true);
      const s = this.catalogoApiService.getTiposDocumento(this.tipoRegimen)
      .pipe(finalize(()=>{
        this.ldData.set(false);
      }))
      .subscribe({
        next: (value: TipoDocumentoDTO[]) =>  {
          this.data.set(value);
          if(this.default) this.control.setValue(this.default);
          //this.selectedChange.emit(value.find(x => x.id === this.default));
        },
        error: (err: HttpErrorResponse) => {
          this.alertService.showToast({
            title: err.error.detalle,
            icon: 'error',
            timer: 4000,
            timerProgressBar: true,
            showCloseButton: true
          });
        },
      });
      this.subs.add(s);
    }

}