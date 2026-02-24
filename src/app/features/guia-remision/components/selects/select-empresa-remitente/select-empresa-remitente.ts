import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RemitenteToSelect } from 'app/features/remitente/models/remitente';
import { RemitenteApiService } from 'app/features/remitente/services/remitente-api.service';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-select-empresa-remitente',
  templateUrl: './select-empresa-remitente.html',
  styleUrl: './select-empresa-remitente.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule,
    SkeletonModule,
    AsyncPipe
  ]
})

export class SelectEmpresaRemitenteComponent implements OnInit, AfterViewInit, OnDestroy{
    @Input() classLabel: string = '';
    @Input() label: string = 'Departamento';
    @Input() placeholder: string = 'Seleccionar...';
    @Input() placeholderLoading: string = 'Cargando...';
    @Input() inputId: string = '';
    @Input() invalid: boolean = false;
    @Input() control!: FormControl;

    data: RemitenteToSelect[] = [];
    selected: RemitenteToSelect | undefined;
    loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    $loading = this.loading.asObservable();

    constructor(
        private remitenteService: RemitenteApiService
    ) {}

    ngOnInit(): void {
        this.getData();
        this.control.valueChanges.subscribe(res => {
            console.log('dd');
        });
    }

    ngAfterViewInit(): void {
        
    }

    ngOnDestroy(): void {
        
    }

    // Data
    getData(): void {
        this.loading.next(true);
        this.remitenteService.getToSelect().subscribe({
            next: (response) => {
                this.data = response;
                this.control.setValue(this.data.length ? this.data[0].remitente_id : null);
                this.loading.next(false);
            },
            error: (error) => {
                this.loading.next(false);
            }
        });
    }

    // Events
    onSelectItem(evt: any): void{
        this.selected = this.data.find(x => x.remitente_id === evt.value);
    }
}