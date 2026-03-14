import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UbigeoDistritoDto } from 'app/features/ubigeo/models/ubigeo.model';
import { UbigeoApiService } from 'app/features/ubigeo/services/ubigeo-api.service';
import { SelectModule } from 'primeng/select';
import { BehaviorSubject, Subscriber, Subscription } from 'rxjs';

@Component({
  selector: 'app-select-distrito',
  templateUrl: './select-distrito.html',
  styleUrl: './select-distrito.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule,
    AsyncPipe
  ]
})

export class SelectDistritoComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges{
    @Input() idUbigeoProvincia: string | null = null;
    @Input() classLabel: string = '';
    @Input() label: string = 'Distrito';
    @Input() placeholder: string = 'Seleccionar...';
    @Input() placeholderLoading: string = 'Cargando...';
    @Input() control!: FormControl;
    @Input() invalid: boolean = false;
    @Input() inputId: string = '';

    @Output() isLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();

    collection: UbigeoDistritoDto[] = [];
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
        if (changes['idUbigeoProvincia']) {
            this.getData();
        }
    }

    // Data
    getData(): void {
        this.control.patchValue(null);
        this.collection = [];
        this.loading.next(false);
        if (!this.idUbigeoProvincia) {
            return;
        }

        this.loading.next(true);
        this.isLoading = true;
        const sub = this.ubigeoService.getDistritosByProvincia(this.idUbigeoProvincia).subscribe({
            next: (response) => {
                this.collection = response;
                this.loading.next(false);
                this.isLoading = false;
                this.isLoaded.emit(true);
            },
            error: (error) => {
                this.loading.next(false);
                this.isLoading = false;
            }
        })
        this.subs.add(sub);
    }

}