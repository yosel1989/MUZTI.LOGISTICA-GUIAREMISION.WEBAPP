import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, inject, signal, EventEmitter, Output, output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '@core/services/alert.service';
import { GuiaRemisionIndicadorTrasladoToSelectDto } from '@features/guia-remision-indicador-traslado/models/guia-remision-indicador-traslado';
import { GuiaRemisionIndicadorTrasladoService } from '@features/guia-remision-indicador-traslado/services/guia-remision-indicador-traslado-service';
import { SelectModule } from 'primeng/select';
import { finalize, Subscription } from 'rxjs';

@Component({
  selector: 'app-select-guia-remision-indicador-traslado',
  templateUrl: './select-guia-remision-indicador-traslado.html',
  styleUrl: './select-guia-remision-indicador-traslado.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule 
  ]
})

export class SelectGuiaRemisionIndicadorTraslado implements OnInit, AfterViewInit, OnDestroy{

    private api = inject(GuiaRemisionIndicadorTrasladoService);
    private alertService = inject(AlertService);

    @Input() classLabel: string = 'text-xs';
    @Input() label: string | null = null;
    @Input() control!: FormControl;
    @Input() default: string | number | null = null;
    @Input() disabled: boolean = false;
    @Input() invalid: boolean = false;
    @Output() selectedChange = new EventEmitter<GuiaRemisionIndicadorTrasladoToSelectDto | undefined | null>; 
    onHide = output<void>();
    onChange = output<void>();

    data = signal<GuiaRemisionIndicadorTrasladoToSelectDto[]>([]);
    ldData = signal(false);
    selected = signal<GuiaRemisionIndicadorTrasladoToSelectDto | undefined | null>(undefined);

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
          }else{
            this.selectedChange.emit(null);
            this.selected.set(null);
          }
        });
    }

    ngOnDestroy(): void {
      this.subs.unsubscribe();
    }

    // Data

    loadData(): void{
      this.ldData.set(true);
      const s = this.api.getToSelect()
      .pipe(finalize(()=>{
        this.ldData.set(false);
      }))
      .subscribe({
        next: (value: GuiaRemisionIndicadorTrasladoToSelectDto[]) =>  {
          this.data.set(value);
          if(this.default) this.control.setValue(this.default);
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