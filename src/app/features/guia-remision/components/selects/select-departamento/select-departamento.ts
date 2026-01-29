import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UbigeoDepartamentoDto } from 'app/features/ubigeo/models/ubigeo.model';
import { UbigeoApiService } from 'app/features/ubigeo/services/ubigeo-api.service';
import { SelectModule } from 'primeng/select';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-select-departamento',
  templateUrl: './select-departamento.html',
  styleUrl: './select-departamento.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule,
    AsyncPipe
  ]
})

export class SelectDepartamentoComponent implements OnInit, AfterViewInit, OnDestroy{
    @Input() classLabel: string = '';
    @Input() label: string = 'Departamento';
    @Input() placeholder: string = 'Seleccionar...';
    @Input() placeholderLoading: string = 'Cargando...';
    @Input() inputId: string = '';
    @Input() invalid: boolean = false;
    @Input() control!: FormControl;

    ubigeoDepartamentos: UbigeoDepartamentoDto[] = [];
    loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    $loading = this.loading.asObservable();

    constructor(
        private ubigeoService: UbigeoApiService
    ) {}

    ngOnInit(): void {
        this.getData();
    }

    ngAfterViewInit(): void {
        
    }

    ngOnDestroy(): void {
        
    }

    // Data
    getData(): void {
        this.loading.next(true);
        this.ubigeoService.getDepartamentos().subscribe({
            next: (response) => {
                this.ubigeoDepartamentos = response;
                this.loading.next(false);
            },
            error: (error) => {
                this.loading.next(false);
            }
        });
    }

}