import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmisorVehicularDto } from '@features/catalogo/models/catalogo.model';
import { CatalogoApiService } from '@features/catalogo/services/catalogo-api.service';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-select-emisor-vehicular',
  templateUrl: './select-emisor-vehicular.html',
  styleUrl: './select-emisor-vehicular.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule,
    AsyncPipe,
    SkeletonModule
  ]
})

export class SelectEmisorVehicularComponent implements OnInit, AfterViewInit, OnDestroy{
    @Input() classLabel: string = '';
    @Input() label: string = 'Emisor Vehicular';
    @Input() placeholder: string = 'Seleccionar...';
    @Input() placeholderLoading: string = 'Cargando...';
    @Input() inputId: string = '';
    @Input() invalid: boolean = false;
    @Input() control!: FormControl;
    @Input() skeleton: boolean = false;

    @Output() isLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();

    data: EmisorVehicularDto[] = [];
    loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    $loading = this.loading.asObservable();

    private subs = new Subscription();

    constructor(
        private api: CatalogoApiService
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
        const sub = this.api.getEmisorVehicular().subscribe({
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