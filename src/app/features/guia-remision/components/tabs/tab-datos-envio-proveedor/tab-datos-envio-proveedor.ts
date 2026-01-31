import { Component, OnDestroy, OnInit, AfterViewInit, Input, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { FreightPayer, IssuingEntity } from 'app/features/items/models/freight-payer';
import { EnumPagadorFlete } from 'app/features/guia-remision/enums/pagador-flete.enum';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { FAKE_ISSUING_ENTITY } from 'app/fake/items/data/fakeIssuingEntity';
import { DocumentEntityType } from 'app/features/items/models/document-entity-type';
import { FAKE_DOCUMENT_TYPE_PERSON } from 'app/fake/items/data/fakeDocumenType';
import { MessageModule } from 'primeng/message';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';

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
    InputNumberModule,
    DividerModule,
    FieldsetModule,
    MessageModule,
    ConfirmDialogModule,
    CheckboxModule
],
  viewProviders: [provideIcons({ heroQuestionMarkCircleSolid })],
  providers: [ConfirmationService]
})


export class TabDatosEnvioProveedorComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges{

    @Input() tipoGuia: string = TipoGuiaRemisionEnum.remitente;

    formDatosEnvio: FormGroup = new FormGroup({}); 
    formDatosProveedor: FormGroup = new FormGroup({}); 
    submitted = false;

    grossWeightUnits: GrossWeightUnit[] = FAKE_GROSS_WEIGHT_UNIT;
    freightPayers: FreightPayer[] = FAKE_FREIGHT_PAYER;
    ussuingEntities: IssuingEntity[] = FAKE_ISSUING_ENTITY;
    documentEntityTypes: DocumentEntityType[] = FAKE_DOCUMENT_TYPE_PERSON;

    constructor(
      private fb: FormBuilder,
      private cdr: ChangeDetectorRef,
      private confirmationService: ConfirmationService
    ){
        this.formDatosEnvio = this.fb.group({
          tipo_transporte: new FormControl('PRIVADO', Validators.required),
          fecha_inicio_traslado: new FormControl(null, Validators.required),
          fecha_entrega_transportista: new FormControl(null),
          descripcion_traslado: new FormControl(null),
          unidad_peso_bruto: new FormControl('KGM', Validators.required),
          peso_bruto_total: new FormControl(null, Validators.required),
          pagador_flete: new FormControl(EnumPagadorFlete.remitente,Validators.required),
          ruc_subcontratador: new FormControl(null, Validators.required),
          nombre_rsocial_subcontratador: new FormControl(null, Validators.required),
          tipo_documento_tercero: new FormControl(null, Validators.required),
          numero_documento_tercero: new FormControl(null, Validators.required),
          nombre_rsocial_tercero: new FormControl(null, Validators.required),

          ruc_transportista: new FormControl(null),
          rsocial_transportista: new FormControl(null),
          num_mtc_transportista: new FormControl(null),
          email_transportista: new FormControl(null),

          traslado_vehiculo_categoria: new FormControl(false),
          traslado_vehiculo_categoria_placa_vehiculo: new FormControl(null),

          registrar_vehiculos_conductores: new FormControl(false),

          vehiculos: this.fb.array([]),
          conductores: this.fb.array([]),

          num_autoriza_especial_adicional: new FormControl(null),
          ent_emisora_especial_adicional: new FormControl(null),
          indic_retorno_vehiculo_envase_adicional: new FormControl(false),
          transbordo_programado_adicional: new FormControl(false),
          indic_retorno_vehiculo_vacio_adicional: new FormControl(false),
        });
    }

    // getters
    get f_datosEnvio(): any{
      return this.formDatosEnvio.controls;
    }

    get f_datosProveedor(): any{
      return this.formDatosProveedor.controls;
    }

    get conductores(): FormArray { 
      return this.formDatosEnvio.get('conductores') as FormArray; 
    }

    get vehiculos(): FormArray { 
      return this.formDatosEnvio.get('vehiculos') as FormArray; 
    }

    ngOnInit(): void {
      this.formDatosEnvio.get('registrar_vehiculos_conductores')?.valueChanges.subscribe(this.evtChaneValueRegistrarVehiculosConductores);
      this.formDatosEnvio.get('tipo_transporte')?.valueChanges.subscribe((res: any) => {
        this.evtChangeValueTipoTransporte(res);
      });
      this.formDatosEnvio.get('traslado_vehiculo_categoria')?.valueChanges.subscribe((res) => {
        this.f_datosEnvio.registrar_vehiculos_conductores.patchValue(false);
      });
    }
    ngAfterViewInit(): void {
        this.evtAddVehiculo();
        this.evtAddConductor();
    }
    ngOnChanges(changes: SimpleChanges): void {
      if(changes['tipoGuia']){
        if(this.tipoGuia === 'TRANSPORTISTA'){
          this.f_datosEnvio.tipo_transporte.setValue('PRIVADO');
        }

        this.cdr.markForCheck();
      }
    }
    ngOnDestroy(): void {

    }

    // functions
    newConductor(): FormGroup { 
      return this.fb.group({ 
        tipo_documento_conductor: [ 'DNI', Validators.required], 
        numero_documento_conductor: [null, Validators.required], 
        numero_licencia_brevete_conductor: [null, Validators.required],
        nombre_conductor: [null, Validators.required],
        apellido_conductor: [null, Validators.required]
      }); 
    }

    

    // events
    evtAddConductor(): void{
      const row = this.newConductor();
      this.conductores.push(row);
      this.cdr.markForCheck(); 
    }

    evtRemoveCoductor(index: number): void{
      this.handlerConfirmDialog(() => {
        this.conductores.removeAt(index);
        this.cdr.markForCheck();
      }, '¿Desea remover el conductor seleccionado?', 'Confirmar la operación.');
    }

    newVehiculo(): FormGroup { 
      return this.fb.group({ 
        placa_vehiculo: [ null, Validators.required], 
        cert_habilitacion_vehiculo: [null, this.f_datosEnvio.tipo_transporte.value === 'PUBLICO' ? [ Validators.required ] : []], 
        entidad_emisora_autoriza_vehiculo: [null], 
        numero_autoriza_vehicular_vehiculo: [null]
      }); 
    }

    // events
    evtAddVehiculo(): void{
      const row = this.newVehiculo();
      this.vehiculos.push(row);
      this.cdr.markForCheck(); 
    }

    evtRemoveVehiculo(index: number): void{
      this.handlerConfirmDialog(() => {
        this.vehiculos.removeAt(index);
        this.cdr.markForCheck(); 
      }, '¿Desea remover el vehículo seleccionado?', 'Confirmar la operación.');
    }

    evtChangeValueTipoTransporte = (tipo: 'PRIVADO' | 'PUBLICO') => {
      /*this.formDatosEnvio.markAsUntouched();
      Object.values(this.formDatosEnvio.controls).forEach(control => {
        control.markAsUntouched();
      });

      this.vehiculos.clear();
      this.conductores.clear();
      this.f_datosEnvio.traslado_vehiculo_categoria.setValue(false);
      this.f_datosEnvio.num_autoriza_especial_adicional.setValue(null);
      this.f_datosEnvio.ent_emisora_especial_adicional.setValue(null);*/

      if(tipo === 'PRIVADO'){

        this.formDatosEnvio = this.fb.group({
          tipo_transporte: new FormControl('PRIVADO', Validators.required),
          fecha_inicio_traslado: new FormControl(null, Validators.required),
          fecha_entrega_transportista: new FormControl(null),
          descripcion_traslado: new FormControl(null),
          unidad_peso_bruto: new FormControl('KGM', Validators.required),
          peso_bruto_total: new FormControl(null, Validators.required),
          pagador_flete: this.tipoGuia === 'TRANSPORTISTA' ? new FormControl(EnumPagadorFlete.remitente,Validators.required) : new FormControl(null),

          traslado_vehiculo_categoria: new FormControl(false),
          traslado_vehiculo_categoria_placa_vehiculo: new FormControl(null),

          registrar_vehiculos_conductores: new FormControl(false),
          vehiculos: this.fb.array([]),
          conductores: this.fb.array([]),

          ruc_subcontratador: new FormControl(null),
          nombre_rsocial_subcontratador: new FormControl(null),
          tipo_documento_tercero: new FormControl(null),
          numero_documento_tercero: new FormControl(null),
          nombre_rsocial_tercero: new FormControl(null),

          ruc_transportista: new FormControl(null),
          rsocial_transportista: new FormControl(null),
          num_mtc_transportista: new FormControl(null),
          email_transportista: new FormControl(null),

          num_autoriza_especial_adicional: new FormControl(null),
          ent_emisora_especial_adicional: new FormControl(null),
          indic_retorno_vehiculo_envase_adicional: new FormControl(false),
          transbordo_programado_adicional: new FormControl(false),
          indic_retorno_vehiculo_vacio_adicional: new FormControl(false),
        });

        this.evtAddVehiculo();
        this.evtAddConductor();
        
        /*this.f_datosEnvio.fecha_inicio_traslado.addValidators(Validators.required);
        this.f_datosEnvio.fecha_entrega_transportista.clearValidators();

        this.f_datosEnvio.ruc_transportista.clearValidators();
        this.f_datosEnvio.rsocial_transportista.clearValidators();*/
      }else{
        /*this.f_datosEnvio.fecha_inicio_traslado.clearValidators();
        this.f_datosEnvio.fecha_entrega_transportista.addValidators(Validators.required);

        this.f_datosEnvio.ruc_transportista.addValidators(Validators.required);
        this.f_datosEnvio.rsocial_transportista.addValidators(Validators.required);*/
      }

      this.cdr.markForCheck();
    }

    evtChaneValueRegistrarVehiculosConductores = (value: boolean): void => {
      this.vehiculos.clear();
      this.conductores.clear();

      if(value && this.f_datosEnvio.tipo_transporte.value === 'PUBLICO'){
        this.evtAddVehiculo();
        this.evtAddConductor();
      }

      this.cdr.markForCheck();
    }

    // handlers
    handlerConfirmDialog(callback: () => void, header: string, message: string): void{
      this.confirmationService.confirm({
          header: header,
          message: message,
          accept: () => {
            callback();
          },
          reject: () => {
              
          },
      });
    }

}