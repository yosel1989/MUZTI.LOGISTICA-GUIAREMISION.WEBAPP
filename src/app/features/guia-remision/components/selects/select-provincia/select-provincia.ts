import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UbigeoProvinciaDto } from 'app/features/ubigeo/models/ubigeo.model';
import { UbigeoApiService } from 'app/features/ubigeo/services/ubigeo-api.service';
import { SelectModule } from 'primeng/select';
import { BehaviorSubject, Subscriber } from 'rxjs';

@Component({
  selector: 'app-select-provincia',
  templateUrl: './select-provincia.html',
  styleUrl: './select-provincia.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule,
    AsyncPipe
  ]
})

export class SelectProvinciaComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges{
    @Input() idUbigeoDepartamento: string | null = null;
    @Input() classLabel: string = '';
    @Input() label: string = 'Provincia';
    @Input() inputId: string = '';
    @Input() placeholder: string = 'Seleccionar...';
    @Input() placeholderLoading: string = 'Cargando...';
    @Input() invalid: boolean = false;
    @Input() control!: FormControl;

    collection: UbigeoProvinciaDto[] = [];
    loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    $loading = this.loading.asObservable();
    sub: Subscriber<any> = new Subscriber();

    constructor(
        private ubigeoService: UbigeoApiService
    ) {}

    ngOnInit(): void {
        this.getData();
    }

    ngAfterViewInit(): void {
        
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['idUbigeoDepartamento']) {
            this.getData();
            this.control.patchValue(null);
            this.control.updateValueAndValidity();
        }
    }

    // Data
    getData(): void {
        this.collection = [];
        this.loading.next(false);
        if (!this.idUbigeoDepartamento) {
            return;
        }

        this.loading.next(true);
            this.sub?.add(this.ubigeoService.getProvinciasByDepartamento(this.idUbigeoDepartamento).subscribe({
                next: (response) => {
                    this.collection = response;
                    this.loading.next(false);
                },
                error: (error) => {
                    this.loading.next(false);
                }
            })
        );
    }

}