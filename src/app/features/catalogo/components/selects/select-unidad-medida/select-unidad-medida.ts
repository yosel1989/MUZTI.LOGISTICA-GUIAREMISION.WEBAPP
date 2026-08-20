import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, inject, signal, EventEmitter, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '@core/services/alert.service';
import { UnidadMedidaDTO } from '@features/catalogo/models/catalogo.model';
import { CatalogoApiService } from '@features/catalogo/services/catalogo-api.service';
import { SelectModule } from 'primeng/select';
import { finalize, Subscription } from 'rxjs';

@Component({
  selector: 'app-select-unidad-medida',
  templateUrl: './select-unidad-medida.html',
  styleUrl: './select-unidad-medida.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule
  ]
})

export class SelectUnidadMedidaComponent implements OnInit, AfterViewInit, OnDestroy{

    private catalogoApiService = inject(CatalogoApiService);
    private alertService = inject(AlertService);

    @Input() classLabel: string = 'text-xs';
    @Input() label: string | null = null;
    @Input() control!: FormControl;
    @Input() default: string | number | null = null;
    @Input() disabled: boolean = false;
    @Input() invalid: boolean = false;
    @Input() optionLabel = 'descripcion_corta';
    @Input() tipo: string | null | 'peso' | 'volumen' | 'longitud' | 'conteo' = null;
    @Output() selectedChange = new EventEmitter<UnidadMedidaDTO | undefined>;

    data = signal<UnidadMedidaDTO[]>([]);
    ldData = signal(false);
    selected = signal<UnidadMedidaDTO | undefined>(undefined);

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
      const s = this.catalogoApiService.getUnidadesMedida(this.tipo)
      .pipe(finalize(()=>{
        this.ldData.set(false);
      }))
      .subscribe({
        next: (value: UnidadMedidaDTO[]) =>  {
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