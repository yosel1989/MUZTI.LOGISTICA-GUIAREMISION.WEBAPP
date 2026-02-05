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
        { label: 'Compra', value: GuiaRemisionTipoTrasladoEnum.compra },
        { label: 'Traslado entre establecimientos de la misma empresa', value: GuiaRemisionTipoTrasladoEnum.traslado }, 
    ];

    constructor() {}

    ngOnInit(): void {
        this.control = this.control || new FormControl(this.data[0].value);
    }

    ngAfterViewInit(): void {
        
    }

    ngOnDestroy(): void {
        
    }

}