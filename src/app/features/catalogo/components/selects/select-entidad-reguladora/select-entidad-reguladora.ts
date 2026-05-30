import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, inject, signal, EventEmitter, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '@core/services/alert.service';
import { EntidadReguladoraDTO } from '@features/catalogo/models/catalogo.model';
import { CatalogoApiService } from '@features/catalogo/services/catalogo-api.service';
import { SelectModule } from 'primeng/select';
import { finalize, Subscription } from 'rxjs';

@Component({
  selector: 'app-select-entidad-reguladora',
  templateUrl: './select-entidad-reguladora.html',
  styleUrl: './select-entidad-reguladora.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule
  ]
})

export class SelectEntidadReguladoraComponent implements OnInit, AfterViewInit, OnDestroy{

    private catalogoApiService = inject(CatalogoApiService);
    private alertService = inject(AlertService);

    @Input() classLabel: string = 'text-xs';
    @Input() label: string | null = null;
    @Input() control!: FormControl;
    @Input() default: string | number | null = null;
    @Input() disabled: boolean = false;
    @Input() invalid: boolean = false;
    @Output() selectedChange = new EventEmitter<EntidadReguladoraDTO | undefined>;

    data = signal<EntidadReguladoraDTO[]>([]);
    ldData = signal(false);
    selected = signal<EntidadReguladoraDTO | undefined>(undefined);

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
      const s = this.catalogoApiService.getEntidadesReguladoras()
      .pipe(finalize(()=>{
        this.ldData.set(false);
      }))
      .subscribe({
        next: (value: EntidadReguladoraDTO[]) =>  {
          this.data.set(value);
          //if(this.default) this.control.setValue(this.default);
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