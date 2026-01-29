import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UbigeoDistritoDto } from 'app/features/ubigeo/models/ubigeo.model';
import { UbigeoApiService } from 'app/features/ubigeo/services/ubigeo-api.service';
import { SelectModule } from 'primeng/select';
import { BehaviorSubject, Subscriber } from 'rxjs';

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
    @Input() placeholder: string = '--SELECCIONAR--';
    @Input() placeholderLoading: string = 'CARGANDO...';
    @Input() control!: FormControl;
    @Input() invalid: boolean = false;

    collection: UbigeoDistritoDto[] = [];
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
        if (changes['idUbigeoProvincia']) {
            this.getData();
        }
    }

    // Data
    getData(): void {
        this.collection = [];
        this.loading.next(false);
        if (!this.idUbigeoProvincia) {
            return;
        }

        this.loading.next(true);
            this.sub?.add(this.ubigeoService.getDistritosByProvincia(this.idUbigeoProvincia).subscribe({
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