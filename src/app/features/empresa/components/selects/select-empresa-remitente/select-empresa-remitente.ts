import { Component, OnDestroy, OnInit, AfterViewInit, Input, signal, EventEmitter, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmpresaToSelectDto } from '@features/empresa/models/empresa.model';
import { EmpresaApiService } from '@features/empresa/services/empresa-api.service';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-select-empresa-remitente',
  templateUrl: './select-empresa-remitente.html',
  styleUrl: './select-empresa-remitente.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule,
    SkeletonModule
  ]
})

export class SelectEmpresaRemitenteComponent implements OnInit, AfterViewInit, OnDestroy{
    @Input() classLabel: string = '';
    @Input() label: string = 'Empresa';
    @Input() placeholder: string = 'Seleccionar...';
    @Input() placeholderLoading: string = 'Cargando...';
    @Input() inputId: string = '';
    @Input() invalid: boolean = false;
    @Input() control!: FormControl;

    @Output() onChange = new EventEmitter<EmpresaToSelectDto | null>();

    data: EmpresaToSelectDto[] = [];
    selected = signal<EmpresaToSelectDto | null>(null);
    loading = signal(false);

    constructor(
        private empresaApiService: EmpresaApiService
    ) {}

    ngOnInit(): void {
        this.loadData();
        this.control.valueChanges.subscribe((res: string | null) => {
            this.selected.set( res ? this.data.find(x => x.ruc === res)! : null );
            console.log('Empresa seleccionada', this.selected());
        });
    }

    ngAfterViewInit(): void {
        
    }

    ngOnDestroy(): void {
        
    }

    // Data

    loadData(): void {
        this.loading.set(true);
        this.empresaApiService.loadAllToSelect().subscribe({
            next: (response) => {
                this.data = response;
                this.control.setValue(this.data.length ? this.data[0].ruc : null);
                this.onChange.emit(this.data.length ? this.data[0] : null);
                this.loading.set(false);
            },
            error: (error) => {
                this.loading.set(false);
            }
        });
    }

    // Events

    onSelectItem(evt: any): void{
        const found = this.data.find(x => x.ruc === evt.value);
        if (found) {
            this.selected.set(found);
            this.onChange.emit(found);
        }
    }
}