import { Component, OnDestroy, OnInit, AfterViewInit, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GuiaRemisionTipoTrasladoEnum } from 'app/features/guia-remision/enums/guia-remision.enum';
import { SelectModule } from 'primeng/select';

export interface SelectTipoTraslado{
    label: string;
    value: string;
}

@Component({
  selector: 'app-select-motivo-traslado',
  templateUrl: './select-motivo-traslado.html',
  styleUrl: './select-motivo-traslado.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule
  ]
})

export class SelectMotivoTrasladoComponent implements OnInit, AfterViewInit, OnDestroy{
    @Input() classLabel: string = '';
    @Input() label: string = 'Motivo de traslado';
    @Input() control!: FormControl;

    data: SelectTipoTraslado[] = [ 
        { label: 'Venta', value: GuiaRemisionTipoTrasladoEnum.venta }, 
        { label: 'Traslado', value: GuiaRemisionTipoTrasladoEnum.traslado }, 
        { label: 'Compra', value: GuiaRemisionTipoTrasladoEnum.compra } 
    ];

    constructor() {}

    ngOnInit(): void {
        
    }

    ngAfterViewInit(): void {
        
    }

    ngOnDestroy(): void {
        
    }

}