import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '@core/services/alert.service';
import { PaisDto } from '@features/catalogo/models/catalogo.model';
import { CatalogoApiService } from '@features/catalogo/services/catalogo-api.service';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { finalize, Subscription } from 'rxjs';

@Component({
  selector: 'app-select-country',
  templateUrl: './select-country.html',
  styleUrl: './select-country.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule,
    SkeletonModule
  ]
})

export class SelectCountry implements OnInit, AfterViewInit, OnDestroy{

    private alertService = inject(AlertService);
    private api = inject(CatalogoApiService);

    @Input() classLabel: string = '';
    @Input() label: string = 'País';
    @Input() placeholder: string = 'Seleccionar...';
    @Input() placeholderLoading: string = 'Cargando...';
    @Input() inputId: string = '';
    @Input() invalid: boolean = false;
    @Input() control!: FormControl;
    @Input() skeleton: boolean = false;
    @Input() optionValue: string = 'code';
    @Input() default: number | null = null;

    @Output() isLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();

    data: PaisDto[] = [];
    loading = signal(false);

    private subs = new Subscription();

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
        this.loading.set(true);
        const sub = this.api.getPaises()
        .pipe(finalize(()=>{ this.loading.set(false) }))
        .subscribe({
            next: (response: PaisDto[]) => {
                this.data = response;
                this.isLoaded.emit(true);
                if(!this.control.value){
                    this.control.setValue(this.default);
                }
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
        });
        this.subs.add(sub);
    }

}