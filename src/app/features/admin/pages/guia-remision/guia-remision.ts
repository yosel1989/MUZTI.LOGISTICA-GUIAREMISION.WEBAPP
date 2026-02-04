import { CommonModule, formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { SelectMotivoTrasladoComponent } from 'app/features/guia-remision/components/selects/select-motivo-traslado/select-motivo-traslado';
import { SelectTipoGuiaComponent } from 'app/features/guia-remision/components/selects/select-tipo-guia/select-tipo-guia';
import { TipoGuiaRemisionEnum } from 'app/features/guia-remision/enums/guia-remision.enum';
import { SelectTipoDocumentoComponent } from 'app/features/guia-remision/components/selects/select-tipo-documento/select-tipo-documento';
import { OnlyNumberDirective } from 'app/core/directives/only-numbers.directive';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectDepartamentoComponent } from 'app/features/guia-remision/components/selects/select-departamento/select-departamento';
import { SelectProvinciaComponent } from 'app/features/guia-remision/components/selects/select-provincia/select-provincia';
import { SelectDistritoComponent } from 'app/features/guia-remision/components/selects/select-distrito/select-distrito';
import { TabOrigenDestinoComponent } from 'app/features/guia-remision/components/tabs/tab-origen-destino/tab-origen-destino';
import { SectionProductoListadoComponent } from 'app/features/guia-remision/components/sections/section-producto-listado/section-producto-listado';
import { TabDatosEnvioProveedorComponent } from 'app/features/guia-remision/components/tabs/tab-datos-envio-proveedor/tab-datos-envio-proveedor';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroQuestionMarkCircleSolid } from '@ng-icons/heroicons/solid';

interface Type {
    name: string;
    code: string | null;
}

@Component({
  selector: 'page-guia-remision',
  templateUrl: './guia-remision.html',
  styleUrl: './guia-remision.scss',
  imports: [
    CommonModule, 
    SelectModule, 
    FormsModule, 
    FloatLabelModule, 
    InputTextModule, 
    ButtonModule, 
    TabsModule,
    ReactiveFormsModule,
    SelectTipoGuiaComponent,
    SelectMotivoTrasladoComponent,
    SelectTipoDocumentoComponent,
    OnlyNumberDirective,
    DatePickerModule,
    SelectDepartamentoComponent,
    SelectProvinciaComponent,
    SelectDistritoComponent,
    TabOrigenDestinoComponent,
    SectionProductoListadoComponent,
    TabDatosEnvioProveedorComponent,
    NgIcon
  ],
  viewProviders: [provideIcons({ heroQuestionMarkCircleSolid })],
})

export class GuiaRemisionComponent implements OnInit, AfterViewInit, OnDestroy{

    @ViewChild('tabOrigenDestino') tabOrigenDestino: TabOrigenDestinoComponent | undefined;
    @ViewChild('selectTipoGuia') selectTipoGuiaComponent: SelectTipoGuiaComponent | undefined;
    @ViewChild('sectionProductoListado') sectionProductoListadoComponent: SectionProductoListadoComponent | undefined;

    tipoGuia = TipoGuiaRemisionEnum;

    // Datos formulario
    fromGroup: FormGroup = new FormGroup({});

    today: Date = new Date();
    last: Date = new Date(this.today.getFullYear(), this.today.getMonth(), (this.today.getDate()-1));

    constructor(
        private formBuilder: FormBuilder
    ){
        this.fromGroup = this.formBuilder.group({
            tipo_traslado: new FormControl('VENTA'),
            tipo_documento: new FormControl({value: 'DNI', disabled: true}),
            departamento: new FormControl(null),
            provincia: new FormControl(null),
            distrito: new FormControl(null),

            fecha_emision: new FormControl(new Date(), Validators.required),
        });
        
        console.log(this.fromGroup.get('fecha_emision')?.value, this.today);
    }


    ngOnInit(): void{
    }

    ngAfterViewInit(): void{
    }

    ngOnDestroy(): void{
    }

    // Getters
    get f(): any{
        return this.fromGroup.controls;
    }

    /*get request(): GuiaRemisionRequestDto{
        return {
            productos: this.sectionProductoListadoComponent?.getFormData.items ?? [],
            origen: this.tabOrigenDestino!.getFormData.origen,
            destino: [this.tabOrigenDestino!.getFormData.destino]
        }
    }*/

    // Events
    evtOnSubmit(): void{
        
        this.tabOrigenDestino?.evtOnSubmit();
        this.sectionProductoListadoComponent?.evtOnSubmit();


        if(this.sectionProductoListadoComponent?.invalid){
            
        }

        console.log('lista de items', this.sectionProductoListadoComponent?.getFormData);
    }

}