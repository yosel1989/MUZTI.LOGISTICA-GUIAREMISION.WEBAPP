import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, signal, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '@core/services/alert.service';
import { UbigeoProvinciaDto } from 'app/features/ubigeo/models/ubigeo.model';
import { UbigeoApiService } from 'app/features/ubigeo/services/ubigeo-api.service';
import { SelectModule } from 'primeng/select';
import { finalize, Subscription } from 'rxjs';

@Component({
  selector: 'app-select-provincia',
  templateUrl: './select-provincia.html',
  styleUrl: './select-provincia.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule
  ]
})

export class SelectProvinciaComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges{

    private ubigeoService = inject(UbigeoApiService);
    private alertService = inject(AlertService);


    @Input() idUbigeoDepartamento: string | null = null;
    @Input() classLabel: string = '';
    @Input() label: string = 'Provincia';
    @Input() inputId: string = '';
    @Input() placeholder: string = 'Seleccionar...';
    @Input() placeholderLoading: string = 'Cargando...';
    @Input() invalid: boolean = false;
    @Input() readonly: boolean = false;
    @Input() control!: FormControl;
    @Input() valueEdit: string | null = null;

    @Output() isLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();


    collection = signal<UbigeoProvinciaDto[]>([]);
    loading = signal(false);
    private subs = new Subscription();
    isLoading = signal(false);

    labelSelected: string | null = null;
    selected = signal<UbigeoProvinciaDto | null>(null);

    ngOnInit(): void {
        this.getData();
        this.control.valueChanges.subscribe(value => {
            if(value){
                const provincia = this.collection().find(prov => prov.id === value);
                this.labelSelected = provincia ? provincia.provincia : null;
                this.selected.set(provincia || null);
            }else{
                this.labelSelected = null;
                this.selected.set(null);
            }
        });
    }

    ngAfterViewInit(): void {
        
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['idUbigeoDepartamento']) {
            this.getData();
            this.control.patchValue(null);
            this.control.updateValueAndValidity();
        }
        if (changes['valueEdit']) {
            this.getData();
        }
    }

    // Data
    getData(): void {
        this.collection.set([]);
        this.loading.set(false);
        if (!this.idUbigeoDepartamento) {
            return;
        }

        this.isLoading.set(true);
        this.loading.set(true);
            this.isLoaded.emit(true);
            this.subs.add(this.ubigeoService.getProvinciasByDepartamento(this.idUbigeoDepartamento)
            .pipe(finalize(()=>{
                this.loading.set(false);
                this.isLoading.set(false);
            }))
            .subscribe({
                next: (response) => {
                    this.collection.set(response);
                    this.isLoaded.emit(false);
                    if(this.valueEdit) this.control.setValue(this.valueEdit);
                },
                error: (error: HttpErrorResponse) => {
                    this.loading.set(false);
                    this.isLoading.set(false);
                    this.alertService.showToast({
                        title: error.error.detalle,
                        icon: 'error',
                        timer: 4000,
                        timerProgressBar: true,
                        showCloseButton: true
                    });
                }
            })
        );
    }

}