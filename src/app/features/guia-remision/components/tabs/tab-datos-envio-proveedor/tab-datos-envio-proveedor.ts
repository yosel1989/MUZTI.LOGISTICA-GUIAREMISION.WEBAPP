import { Component, OnDestroy, OnInit, AfterViewInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroQuestionMarkCircleSolid } from '@ng-icons/heroicons/solid';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { GrossWeightUnit } from 'app/features/items/models/gross-weight-unit';
import { FAKE_GROSS_WEIGHT_UNIT } from 'app/fake/items/data/fakeGrossWeightUnit';
import { InputNumberModule } from 'primeng/inputnumber';
import { TipoGuiaRemisionEnum } from 'app/features/guia-remision/enums/guia-remision.enum';
import { FAKE_FREIGHT_PAYER } from 'app/fake/items/data/fakeFreightPayer';
import { FreightPayer } from 'app/features/items/models/freight-payer';
import { EnumPagadorFlete } from 'app/features/guia-remision/enums/pagador-flete.enum';

@Component({
  selector: 'app-tab-datos-envio-proveedor',
  templateUrl: './tab-datos-envio-proveedor.html',
  styleUrls: ['./tab-datos-envio-proveedor.scss'],                          
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TabsModule,
    InputTextModule,
    NgIcon,
    TooltipModule,
    SelectButtonModule,
    ButtonModule,
    DatePickerModule,
    SelectModule,
    InputNumberModule
  ],
  viewProviders: [provideIcons({ heroQuestionMarkCircleSolid })],
})


export class TabDatosEnvioProveedorComponent implements OnInit, AfterViewInit, OnDestroy{

  @Input() tipoGuia: string = TipoGuiaRemisionEnum.remitente;

    formDatosEnvio: FormGroup = new FormGroup({}); 
    formDatosProveedor: FormGroup = new FormGroup({}); 
    submitted = false;

    grossWeightUnits: GrossWeightUnit[] = FAKE_GROSS_WEIGHT_UNIT;
    freightPayers: FreightPayer[] = FAKE_FREIGHT_PAYER;

    

    constructor(private fb: FormBuilder){
        this.formDatosEnvio = this.fb.group({
          tipo_transporte: new FormControl('PRIVADO', Validators.required),
          descripcion_traslado: new FormControl(null),
          unidad_peso_bruto: new FormControl('KGM', Validators.required),
          peso_bruto_total: new FormControl(null, Validators.required),
          pagador_flete: new FormControl(EnumPagadorFlete.remitente,Validators.required),
          ruc_subcontratador: new FormControl(null, Validators.required),
          nombre_rsocial_subcontratador: new FormControl(null, Validators.required),
          tipo_documento_tercero: new FormControl(null, Validators.required),
          numero_documento_tercero: new FormControl(null, Validators.required),
          nombre_rsocial_tercero: new FormControl(null, Validators.required),
        });
    }

    // getters
    get f_datosEnvio(): any{
      return this.formDatosEnvio.controls;
    }

    get f_datosProveedor(): any{
      return this.formDatosProveedor.controls;
    }

    ngOnInit(): void {
        
    }
    ngAfterViewInit(): void {
        
    }
    ngOnDestroy(): void {
        
    }

}