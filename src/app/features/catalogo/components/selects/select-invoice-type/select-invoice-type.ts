import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, inject, signal, EventEmitter, Output, input, effect } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorHandlerService } from '@core/handlers/error-handler.service';
import { InvoiceTypeToSelectDto } from '@features/catalogo/models/catalogo.model';
import { SunatCatalogoApiService } from '@features/catalogo/services/sunat-catalogo-api.service';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { finalize, Subscription } from 'rxjs';

export interface SelectTipoDocumento{
    label: string;
    value: string;
}

@Component({
  selector: 'app-select-invoice-type',
  templateUrl: './select-invoice-type.html',
  styleUrl: './select-invoice-type.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule,
    SkeletonModule
  ]
})

export class SelectInvoiceTypeComponent implements OnInit, AfterViewInit, OnDestroy{

    private catalogoApiService = inject(SunatCatalogoApiService);
    private errorHandler = inject(ErrorHandlerService);

    @Input() classLabel: string = 'text-xs';
    @Input() label: string | null = null;
    @Input() control!: FormControl;
    @Input() default: string | number | null = null;
    @Input() disabled: boolean = false;
    @Input() invalid: boolean = false;
    @Input() loading: boolean = false;

    @Input() optionLabel: string = 'name';
    @Input() optionValue: string = 'id';

    @Output() selectedChange = new EventEmitter<InvoiceTypeToSelectDto | undefined>;

    data = signal<InvoiceTypeToSelectDto[]>([]);
    ldData = signal(false);
    selected = signal<InvoiceTypeToSelectDto | undefined>(undefined);

    subs = new Subscription();

    constructor() {
      effect(() => {
        this.loadData();
      });
    }

    ngOnInit(): void {
      this.loadData();
    }

    ngAfterViewInit(): void {
        this.control.valueChanges.subscribe((val: number | null)=>{
          if(val) {
            this.selectedChange.emit(this.data().find(x => x.id === val));
            this.selected.set(this.data().find(x => x.id === val));
          }
        });
    }

    ngOnDestroy(): void {
      this.subs.unsubscribe();
    }

    // Data

    loadData(): void{
      this.ldData.set(true);
      const s = this.catalogoApiService.loadInvoiceTypes()
      .pipe(finalize(()=>{
        this.ldData.set(false);
      }))
      .subscribe({
        next: (value: InvoiceTypeToSelectDto[]) =>  {
          this.data.set(value);
          if(this.default){
            this.control.setValue(this.default);
          }else{
            this.control.setValue(value[0].id)
          }

          //this.selectedChange.emit(value.find(x => x.id === this.default));
        },
        error: (err: HttpErrorResponse) => {
          this.errorHandler.handle(err);
        },
      });
      this.subs.add(s);
    }

}