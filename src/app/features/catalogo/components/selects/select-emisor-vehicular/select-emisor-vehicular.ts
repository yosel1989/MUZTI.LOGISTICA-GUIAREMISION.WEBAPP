import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '@core/services/alert.service';
import { EmisorVehicularDto } from '@features/catalogo/models/catalogo.model';
import { CatalogoApiService } from '@features/catalogo/services/catalogo-api.service';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { finalize, Subscription } from 'rxjs';

@Component({
  selector: 'app-select-emisor-vehicular',
  templateUrl: './select-emisor-vehicular.html',
  styleUrl: './select-emisor-vehicular.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule,
    SkeletonModule
  ]
})

export class SelectEmisorVehicularComponent implements OnInit, AfterViewInit, OnDestroy{

    private api = inject(CatalogoApiService);
    private alertService = inject(AlertService);

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
    loading = signal(false);

    selected: EmisorVehicularDto | undefined = undefined;

    private subs = new Subscription();

    ngOnInit(): void {
        this.getData();
    }

    ngAfterViewInit(): void {
        this.control.valueChanges.subscribe( (res: any) => {
            this.selected = undefined;
            if(res){
                this.selected = this.data.find(x => x.codigo === res);
            }
        });
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    // Data

    getData(): void {
        this.loading.set(true);
        const sub = this.api.getEmisorVehicular()
        .pipe(finalize(()=>{this.loading.set(false);}))
        .subscribe({
            next: (response: EmisorVehicularDto[]) => {
                this.data = response;
                this.isLoaded.emit(true);
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