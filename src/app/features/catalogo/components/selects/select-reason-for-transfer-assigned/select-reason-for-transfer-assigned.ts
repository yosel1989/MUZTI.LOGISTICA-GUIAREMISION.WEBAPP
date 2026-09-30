import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, input, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorHandlerService } from '@core/handlers/error-handler.service';
import { SunatMotivoTrasladoDto } from '@features/catalogo/models/sunat-catalogo.model';
import { SunatCatalogoApiService } from '@features/catalogo/services/sunat-catalogo-api.service';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, Subscription } from 'rxjs';

export interface SelectTipoTraslado{
    label: string;
    value: string;
}

@Component({
  selector: 'app-select-reason-for-transfer-assigned',
  templateUrl: './select-reason-for-transfer-assigned.html',
  styleUrl: './select-reason-for-transfer-assigned.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
    TooltipModule
  ]
})

export class SelectReasonForTransferAssigned implements OnInit, AfterViewInit, OnDestroy{

    private api = inject(SunatCatalogoApiService);
    private errorHandler = inject(ErrorHandlerService);

    @Input() control!: FormControl;
    @Input() defaultValue: number | null = null;
    @Input() invalid: boolean = false;
    group = input<boolean>(false);

    selected = signal<SunatMotivoTrasladoDto | undefined>(undefined);
    data = signal<SunatMotivoTrasladoDto[]>([]);
    loading = signal(false);
    subs = new Subscription();

    constructor(){
        this.control = this.control || new FormControl(this.defaultValue);
    }

    ngOnInit(): void {
        this.control.valueChanges.subscribe(res => {
            if(res){
                const selected = this.data().find(x => x.id === res);
                this.selected.set(selected);
            }
        });
        this.loadData();
    }

    ngAfterViewInit(): void {
        
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    // data

    loadData(reload: boolean = false): void{
        if(reload){ 
            this.control.patchValue(null);
            this.selected.set(undefined);
        }
        this.loading.set(true);
        this.subs = this.api.loadReasonForTransferAssigned()
        .pipe(finalize(() => {
            this.loading.set(false);
        }))
        .subscribe({
            next: (value: SunatMotivoTrasladoDto[]) => {
                this.data.set(value.map(x => ({...x, nombre: x.nombre.toUpperCase()})));
            },
            error: (err: HttpErrorResponse) => {
                this.errorHandler.handle(err);
            },
        });
    }

}