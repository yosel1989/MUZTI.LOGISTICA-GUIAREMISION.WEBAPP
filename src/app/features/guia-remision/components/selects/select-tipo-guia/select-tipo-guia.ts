import { Component, OnDestroy, OnInit, AfterViewInit, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TipoGuiaRemisionEnum } from 'app/features/guia-remision/enums/guia-remision.enum';
import { SelectModule } from 'primeng/select';

export interface SelectTipoGuia{
    label: string;
    value: string;
}

@Component({
  selector: 'app-select-tipo-guia',
  templateUrl: './select-tipo-guia.html',
  styleUrl: './select-tipo-guia.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule
  ]
})

export class SelectTipoGuiaComponent implements OnInit, AfterViewInit, OnDestroy{

    @Input() classLabel: string = 'text-xs';
    @Input() label: string = 'Tipo de Guía de Remisión';

    tipoGuiaSelected: TipoGuiaRemisionEnum = TipoGuiaRemisionEnum.remitente;

    frmCtrlTipoGuia = new FormControl(this.tipoGuiaSelected, Validators.required);

    data: SelectTipoGuia[] = [ 
        { label: 'Guía Remitente', value: TipoGuiaRemisionEnum.remitente }, 
        { label: 'Guía Transportista', value: TipoGuiaRemisionEnum.transportista }
    ];

    constructor() {
      this.frmCtrlTipoGuia.valueChanges.subscribe(value => {
        this.tipoGuiaSelected = value ?? TipoGuiaRemisionEnum.remitente;
      });
    }

    ngOnInit(): void {
        
    }

    ngAfterViewInit(): void {
        
    }

    ngOnDestroy(): void {
        
    }

}