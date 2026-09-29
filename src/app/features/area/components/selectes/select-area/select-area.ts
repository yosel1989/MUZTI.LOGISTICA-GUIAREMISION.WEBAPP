import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, input, Input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorHandlerService } from '@core/handlers/error-handler.service';
import { AreaToSelectDto } from '@features/area/models/area';
import { AreaApiService } from '@features/area/services/area-api.service';
import { SelectModule } from 'primeng/select';
import { finalize, Subscription } from 'rxjs';

export interface SelectTipoTraslado{
    label: string;
    value: string;
}

@Component({
  selector: 'app-select-area',
  templateUrl: './select-area.html',
  styleUrl: './select-area.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule
  ]
})

export class SelectArea implements OnInit, AfterViewInit, OnDestroy{

    private api = inject(AreaApiService);
    private errorHandler = inject(ErrorHandlerService);

    @Input() control!: FormControl;
    @Input() defaultValue: number | null = null;
    OnSelected = output<AreaToSelectDto | undefined>();
    
    filter = input<boolean>(false);
    invalid = input<boolean>(false);
    level = input<number | null>(null);
    optionValue = input<string>('id');
    optionLabel = input<string>('name');
    placeholder = input<string>('Seleccionar...');

    selected = signal<AreaToSelectDto | undefined>(undefined);
    data = signal<AreaToSelectDto[]>([]);
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
                this.OnSelected.emit(selected);
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

    loadData(): void{
        this.loading.set(true);
        this.subs = this.api.getToSelect(this.level() ?? null)
        .pipe(finalize(() => {
            this.loading.set(false);
        }))
        .subscribe({
            next: (value: AreaToSelectDto[]) => {
                this.data.set(value);
                if(this.defaultValue){
                    this.control.patchValue(this.defaultValue);
                }
            },
            error: (err: HttpErrorResponse) => {
                this.errorHandler.handle(err);
            },
        });
    }

}