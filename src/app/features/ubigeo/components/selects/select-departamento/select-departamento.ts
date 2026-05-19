import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UbigeoDepartamentoDto } from 'app/features/ubigeo/models/ubigeo.model';
import { UbigeoApiService } from 'app/features/ubigeo/services/ubigeo-api.service';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-select-departamento',
  templateUrl: './select-departamento.html',
  styleUrl: './select-departamento.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule,
    AsyncPipe,
    SkeletonModule
  ]
})

export class SelectDepartamentoComponent implements OnInit, AfterViewInit, OnDestroy{
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
    loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    $loading = this.loading.asObservable();
    isLoading = false;
    labelSelected: string | null = null;

    private subs = new Subscription();

    constructor(
        private ubigeoService: UbigeoApiService
    ) {}

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
        this.loading.next(true);
        this.isLoading = true;
        const sub = this.ubigeoService.getDepartamentos().subscribe({
            next: (response) => {
                this.ubigeoDepartamentos = response;
                this.loading.next(false);
                this.isLoaded.emit(true);
                this.isLoading = false;
            },
            error: (error) => {
                this.loading.next(false);
                this.isLoading = false;
            }
        });
        this.subs.add(sub);
    }

}