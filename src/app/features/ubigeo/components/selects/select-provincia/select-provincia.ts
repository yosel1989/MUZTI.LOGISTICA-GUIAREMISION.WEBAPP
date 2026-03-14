import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UbigeoProvinciaDto } from 'app/features/ubigeo/models/ubigeo.model';
import { UbigeoApiService } from 'app/features/ubigeo/services/ubigeo-api.service';
import { SelectModule } from 'primeng/select';
import { BehaviorSubject, Subscriber, Subscription } from 'rxjs';

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

    @Output() isLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();


    collection: UbigeoProvinciaDto[] = [];
    loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    $loading = this.loading.asObservable();
    private subs = new Subscription();
    isLoading = false;

    constructor(
        private ubigeoService: UbigeoApiService
    ) {}

    ngOnInit(): void {
        this.getData();
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
    }

    // Data
    getData(): void {
        this.collection = [];
        this.loading.next(false);
        if (!this.idUbigeoDepartamento) {
            return;
        }

        this.isLoading = true;
        this.loading.next(true);
            this.isLoaded.emit(true);
            this.subs.add(this.ubigeoService.getProvinciasByDepartamento(this.idUbigeoDepartamento).subscribe({
                next: (response) => {
                    this.collection = response;
                    this.isLoaded.emit(false);
                    this.loading.next(false);
                    this.isLoading = false;
                },
                error: (error) => {
                    this.loading.next(false);
                    this.isLoading = false;
                }
            })
        );
    }

}