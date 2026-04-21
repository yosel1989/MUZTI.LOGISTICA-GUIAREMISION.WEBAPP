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
        { label: 'Venta con entrega a terceros', value: GuiaRemisionTipoTrasladoEnum.venta_entrega_terceros }, 
        { label: 'Traslado entre establecimientos de la misma empresa', value: GuiaRemisionTipoTrasladoEnum.traslado_establecimientos_misma_empresa }, 
        { label: 'Consignación', value: GuiaRemisionTipoTrasladoEnum.consignacion }, 
        { label: 'Devolución', value: GuiaRemisionTipoTrasladoEnum.devolucion }, 
        { label: 'Recojo de bienes transformados', value: GuiaRemisionTipoTrasladoEnum.recojo_bienes_transformados }, 
        { label: 'Importación', value: GuiaRemisionTipoTrasladoEnum.importacion }, 
        { label: 'Exportación', value: GuiaRemisionTipoTrasladoEnum.exportacion }, 
        { label: 'Otros', value: GuiaRemisionTipoTrasladoEnum.otros }, 
        { label: 'Venta sujeta a confirmación del comprador', value: GuiaRemisionTipoTrasladoEnum.venta_sujeta_confirmacion_comprador }, 
        { label: 'Traslado de bienes para transformación', value: GuiaRemisionTipoTrasladoEnum.traslado_bienes_transformacion }, 
        { label: 'Traslado emisor itinerante CP', value: GuiaRemisionTipoTrasladoEnum.traslado_emisor_itinerante_CP }, 
        { label: 'Traslado de mercancía extranjera', value: GuiaRemisionTipoTrasladoEnum.traslado_mercancia_extranjera }, 
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