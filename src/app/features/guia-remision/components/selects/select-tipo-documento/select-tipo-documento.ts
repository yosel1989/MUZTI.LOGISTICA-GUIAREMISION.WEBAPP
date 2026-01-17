import { Component, OnDestroy, OnInit, AfterViewInit, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TipoDocumentoEnum } from 'app/features/guia-remision/enums/tipo-documento.enum';
import { SelectModule } from 'primeng/select';

export interface SelectTipoDocumento{
    label: string;
    value: string;
}

@Component({
  selector: 'app-select-tipo-documento',
  templateUrl: './select-tipo-documento.html',
  styleUrl: './select-tipo-documento.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule
  ]
})

export class SelectTipoDocumentoComponent implements OnInit, AfterViewInit, OnDestroy{
    @Input() classLabel: string = 'text-xs';
    @Input() label: string = 'Tipo de Documento';
    @Input() control!: FormControl;

    data: SelectTipoDocumento[] = [ 
        { label: 'DNI', value: TipoDocumentoEnum.dni }, 
        { label: 'Carnet de Extranjería', value: TipoDocumentoEnum.carnet_extranjeria }, 
        { label: 'RUC', value: TipoDocumentoEnum.ruc },
        { label: 'Pasaporte', value: TipoDocumentoEnum.pasaporte },
    ];

    constructor() {}

    ngOnInit(): void {
        
    }

    ngAfterViewInit(): void {
        
    }

    ngOnDestroy(): void {
        
    }

}