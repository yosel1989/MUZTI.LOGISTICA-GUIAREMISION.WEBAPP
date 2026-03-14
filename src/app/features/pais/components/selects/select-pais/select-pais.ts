import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaisDto } from '@features/pais/models/pais.model';
import { PaisApiService } from '@features/pais/services/pais-api.service';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-select-pais',
  templateUrl: './select-pais.html',
  styleUrl: './select-pais.scss',
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
    @Input() label: string = 'País';
    @Input() placeholder: string = 'Seleccionar...';
    @Input() placeholderLoading: string = 'Cargando...';
    @Input() inputId: string = '';
    @Input() invalid: boolean = false;
    @Input() control!: FormControl;
    @Input() skeleton: boolean = false;

    @Output() isLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();

    data: PaisDto[] = [];
    loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    $loading = this.loading.asObservable();

    private subs = new Subscription();

    constructor(
        private api: PaisApiService
    ) {}

    ngOnInit(): void {
        this.getData();
    }

    ngAfterViewInit(): void {
        
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    // Data
    getData(): void {
        this.loading.next(true);
        const sub = this.api.getPaises().subscribe({
            next: (response) => {
                this.data = response;
                this.loading.next(false);
                this.isLoaded.emit(true);
            },
            error: (error) => {
                this.loading.next(false);
            }
        });
        this.subs.add(sub);
    }

}