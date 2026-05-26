import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '@core/services/alert.service';
import { UbigeoDepartamentoDto } from 'app/features/ubigeo/models/ubigeo.model';
import { UbigeoApiService } from 'app/features/ubigeo/services/ubigeo-api.service';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { finalize, Subscription } from 'rxjs';

@Component({
  selector: 'app-select-departamento',
  templateUrl: './select-departamento.html',
  styleUrl: './select-departamento.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule,
    SkeletonModule
  ]
})

export class SelectDepartamentoComponent implements OnInit, AfterViewInit, OnDestroy{

    private alertService = inject(AlertService);
    private ubigeoService = inject(UbigeoApiService);

    @Input() classLabel: string = '';
    @Input() label: string = 'Departamento';
    @Input() placeholder: string = 'Seleccionar...';
    @Input() placeholderLoading: string = 'Cargando...';
    @Input() inputId: string = '';
    @Input() invalid: boolean = false;
    @Input() readonly: boolean = false;
    @Input() control!: FormControl;
    @Input() skeleton: boolean = false;

    @Output() isLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();

    ubigeoDepartamentos: UbigeoDepartamentoDto[] = [];
    loading = signal(false);
    isLoading = signal(false);
    labelSelected: string | null = null;

    private subs = new Subscription();

    ngOnInit(): void {
        this.getData();
        this.control.valueChanges.subscribe(value => {
            if(value){
                const departamento = this.ubigeoDepartamentos.find(dep => dep.id === value);
                this.labelSelected = departamento ? departamento.departamento : null;
            }else{
                this.labelSelected = null;
            }
        });
    }

    ngAfterViewInit(): void {
        
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    // Data
    getData(): void {
        this.loading.set(true);
        this.isLoading.set(true);
        const sub = this.ubigeoService.getDepartamentos()
        .pipe(finalize(()=>{
            this.isLoading.set(false);
            this.loading.set(false);
        }))
        .subscribe({
            next: (response: UbigeoDepartamentoDto[]) => {
                this.ubigeoDepartamentos = response;
                this.isLoaded.emit(true);
            },
            error: (error: HttpErrorResponse) => {
                this.alertService.showToast({
                    title: error.error.detalle,
                    icon: 'error',
                    timer: 4000,
                    timerProgressBar: true,
                    showCloseButton: true
                });
            }
        });
        this.subs.add(sub);
    }

}