import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges, EventEmitter, Output, signal, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '@core/services/alert.service';
import { UbigeoDistritoDto } from 'app/features/ubigeo/models/ubigeo.model';
import { UbigeoApiService } from 'app/features/ubigeo/services/ubigeo-api.service';
import { SelectModule } from 'primeng/select';
import { finalize, Subscription } from 'rxjs';

@Component({
  selector: 'app-select-distrito',
  templateUrl: './select-distrito.html',
  styleUrl: './select-distrito.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule
  ]
})

export class SelectDistritoComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges{
    private ubigeoService = inject(UbigeoApiService);
    private alertService = inject(AlertService);

    @Input() idUbigeoProvincia: string | null = null;
    @Input() classLabel: string = '';
    @Input() label: string = 'Distrito';
    @Input() placeholder: string = 'Seleccionar...';
    @Input() placeholderLoading: string = 'Cargando...';
    @Input() control!: FormControl;
    @Input() invalid: boolean = false;
    @Input() readonly: boolean = false;
    @Input() inputId: string = '';
    @Input() valueEdit: string | null = null;

    @Output() isLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();

    collection = signal<UbigeoDistritoDto[]>([]);
    loading = signal(false);
    private subs = new Subscription();
    isLoading = signal(false);

    labelSelected: string | null = null;

    ngOnInit(): void {
        this.getData();
        this.control.valueChanges.subscribe(value => {
            if(value){
                const distrito = this.collection().find(dist => dist.id === value);
                this.labelSelected = distrito ? distrito.distrito : null;
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

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['idUbigeoProvincia'] || changes['valueEdit']) {
            this.getData();
        }
    }

    // Data
    getData(): void {
        this.control.patchValue(null);
        this.collection.set([]);
        this.loading.set(false);
        if (!this.idUbigeoProvincia) {
            return;
        }

        this.loading.set(true);
        this.isLoading.set(true);
        const sub = this.ubigeoService.getDistritosByProvincia(this.idUbigeoProvincia)
        .pipe(finalize(()=>{
            this.loading.set(false);
        }))
        .subscribe({
            next: (response: UbigeoDistritoDto[]) => {
                this.collection.set(response);
                this.isLoaded.emit(true);
                if(this.valueEdit) this.control.setValue(this.valueEdit);
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
        })
        this.subs.add(sub);
    }

}