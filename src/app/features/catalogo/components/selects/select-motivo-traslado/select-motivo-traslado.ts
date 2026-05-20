import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, inject, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '@core/services/alert.service';
import { SunatMotivoTrasladoDto } from '@features/catalogo/models/sunat-catalogo.model';
import { SunatCatalogoApiService } from '@features/catalogo/services/sunat-catalogo-api.service';
import { SelectModule } from 'primeng/select';
import { finalize, Subscription } from 'rxjs';

export interface SelectTipoTraslado{
    label: string;
    value: string;
}

@Component({
  selector: 'app-select-motivo-traslado',
  templateUrl: './select-motivo-traslado.html',
  styleUrl: './select-motivo-traslado.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule
  ]
})

export class SelectMotivoTrasladoComponent implements OnInit, AfterViewInit, OnDestroy{

    private api = inject(SunatCatalogoApiService);
    private alertService = inject(AlertService);

    @Input() control!: FormControl;
    @Input() defaultValue: number | null = null;
    @Input() invalid: boolean = false;

    selected = signal<SunatMotivoTrasladoDto | undefined>(undefined);
    data: SunatMotivoTrasladoDto[] = [];
    loading = signal(false);
    subs = new Subscription();

    constructor(){
        this.control = this.control || new FormControl(this.defaultValue);
    }

    ngOnInit(): void {
        this.control.valueChanges.subscribe(res => {
            if(res){
                const selected = this.data.find(x => x.id === res);
                this.selected.set(selected);
            }
        });
        this.loadData();
    }

    ngAfterViewInit(): void {
        
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    // data

    loadData(): void{
        this.loading.set(true);
        this.subs = this.api.loadMotivosTraslado()
        .pipe(finalize(() => {
            this.loading.set(false);
        }))
        .subscribe({
            next: (value: SunatMotivoTrasladoDto[]) => {
                this.data = value;
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
    }

}