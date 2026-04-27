import { Component, OnDestroy, OnInit, AfterViewInit, Input, ChangeDetectorRef, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroQuestionMarkCircleSolid } from '@ng-icons/heroicons/solid';
import { heroArrowTurnDownLeftMini } from '@ng-icons/heroicons/mini';
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
import { GuiaRemisionTipoTrasladoEnum, TipoGuiaRemisionEnum } from 'app/features/guia-remision/enums/guia-remision.enum';
import { FAKE_FREIGHT_PAYER } from 'app/fake/items/data/fakeFreightPayer';
import { FreightPayer, IssuingEntity } from 'app/features/items/models/freight-payer';
import { EnumPagadorFlete } from 'app/features/guia-remision/enums/pagador-flete.enum';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { FAKE_ISSUING_ENTITY } from 'app/fake/items/data/fakeIssuingEntity';
import { DocumentEntityType } from 'app/features/items/models/document-entity-type';
import { FAKE_DOCUMENT_TYPE_PERSON, FAKE_DOCUMENT_TYPE_PROVIDER } from 'app/fake/items/data/fakeDocumenType';
import { MessageModule } from 'primeng/message';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { tablerAlertCircle } from '@ng-icons/tabler-icons';
import { AlertService } from 'app/core/services/alert.service';
import { ConductorApiService } from 'app/features/conductor/services/conductor-api.service';
import { DialogService } from 'primeng/dynamicdialog';
import { UnidadTransporteDto } from '@features/unidad-transporte/models/unidad-transporte.model';
import { MdlListaUnidadTransporteComponent } from '@features/unidad-transporte/components/modals/mdl-lista-unidad-transporte/mdl-lista-unidad-transporte';
import { Subscription } from 'rxjs';
import { MdlListaConductorComponent } from '@features/conductor/components/modals/mdl-lista-conductor/mdl-lista-conductor';
import { ConductorDto } from '@features/conductor/models/conductor.model';
import { MdlListaProveedorComponent } from '@features/proveedor/components/modals/mdl-lista-proveedor/mdl-lista-proveedor';
import { ProveedorDto } from '@features/proveedor/models/proveedor';
import { SelectDepartamentoComponent } from '@features/ubigeo/components/selects/select-departamento/select-departamento';
import { SelectProvinciaComponent } from '@features/ubigeo/components/selects/select-provincia/select-provincia';
import { SelectDistritoComponent } from '@features/ubigeo/components/selects/select-distrito/select-distrito';
import { RemitenteToSelect } from '@features/remitente/models/remitente';
import { OnlyNumberDirective } from "app/core/directives/only-numbers.directive";
import { EmpresaToSelectDto } from '@features/empresa/models/empresa.model';

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
    CheckboxModule,
    SelectDepartamentoComponent,
    SelectProvinciaComponent,
    SelectDistritoComponent,
    OnlyNumberDirective
],
  viewProviders: [provideIcons({ heroQuestionMarkCircleSolid, tablerAlertCircle, heroArrowTurnDownLeftMini })],
  providers: [ConfirmationService, MessageService]
})


export class TabDatosEnvioProveedorComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges{

    @ViewChild('departamentoProveedor') departamentoProveedor: SelectDepartamentoComponent | undefined;
    @ViewChild('provinciaProveedor') provinciaProveedor: SelectProvinciaComponent | undefined;
    @ViewChild('distritoProveedor') distritoProveedor: SelectDistritoComponent | undefined;

    @Input() tipoGuia: string = TipoGuiaRemisionEnum.remitente;
    @Input() motivoTraslado!: GuiaRemisionTipoTrasladoEnum;
    @Input() emisora: EmpresaToSelectDto | undefined;

    formDatosEnvio: FormGroup = new FormGroup({});
    formDatosProveedor: FormGroup = new FormGroup({});
    submitted = false;

    grossWeightUnits: GrossWeightUnit[] = FAKE_GROSS_WEIGHT_UNIT;
    freightPayers: FreightPayer[] = FAKE_FREIGHT_PAYER;
    ussuingEntities: IssuingEntity[] = FAKE_ISSUING_ENTITY;
    documentEntityTypes: DocumentEntityType[] = FAKE_DOCUMENT_TYPE_PERSON;
    documentEntityProviderTypes: DocumentEntityType[] = FAKE_DOCUMENT_TYPE_PROVIDER;
    modalRef: any | undefined;

    subs = new Subscription();

    minFechaEntregaTraslado = new Date();

    constructor(
      private fb: FormBuilder,
      private cdr: ChangeDetectorRef,
      private confirmationService: ConfirmationService,
      private alertService: AlertService,
      private conductorService: ConductorApiService,
      private dialogService: DialogService
    ){

        this.formDatosEnvio = this.fb.group({
          tipo_transporte: new FormControl('PRIVADO', Validators.required),
          fecha_inicio_traslado: new FormControl(null, Validators.required),
          fecha_entrega_transportista: new FormControl(null),
          descripcion_traslado: new FormControl(null),
          unidad_peso_bruto: new FormControl('KGM', Validators.required),
          peso_bruto_total: new FormControl(null, Validators.required),
          pagador_flete: new FormControl(EnumPagadorFlete.remitente),

          numero_bultos: new FormControl(null),
          numero_contenedor: new FormControl(null),
          numero_precinto: new FormControl(null),

          ruc_subcontratador: new FormControl(null),
          nombre_rsocial_subcontratador: new FormControl(null),
          tipo_documento_tercero: new FormControl(null),
          numero_documento_tercero: new FormControl(null),
          nombre_rsocial_tercero: new FormControl(null),

          ruc_transportista: new FormControl(null),
          rsocial_transportista: new FormControl(null),
          num_mtc_transportista: new FormControl(null),
          email_transportista: new FormControl(null),

          traslado_vehiculo_categoria: new FormControl(false),
          traslado_vehiculo_categoria_placa_vehiculo: new FormControl(null),

          registrar_vehiculos_conductores: new FormControl(false),

          vehiculos: this.fb.array([], Validators.minLength(1)),
          conductores: this.fb.array([], Validators.minLength(1)),

          cod_establecimiento_origen: new FormControl(null, [Validators.minLength(4), Validators.maxLength(4)]),
          ruc_establecimiento_origen: new FormControl({value: null, disabled: true}),
          cod_establecimiento_destino: new FormControl(null, [Validators.minLength(4), Validators.maxLength(4)]),
          ruc_establecimiento_destino: new FormControl({value: null, disabled: true}),

          num_autoriza_especial_adicional: new FormControl(null),
          ent_emisora_especial_adicional: new FormControl(null),
          indic_retorno_vehiculo_envase_adicional: new FormControl(false),
          transbordo_programado_adicional: new FormControl(false),
          indic_retorno_vehiculo_vacio_adicional: new FormControl(false),
        });

        this.formDatosProveedor = this.fb.group({
          proveedor_id: new FormControl({value: null, disabled: true}, Validators.required),
          tipo_documento_proveedor: new FormControl({value: null, disabled: true}, Validators.required),
          numero_documento_proveedor: new FormControl({value: null, disabled: true}, Validators.required),
          nombre_rsocial_proveedor: new FormControl({value: null, disabled: true}, Validators.required),
          direccion_proveedor: new FormControl({value: null, disabled: true}),
          idDepartamento : new FormControl({value: null, disabled: true}),
          idProvincia : new FormControl({value: null, disabled: true}),
          idDistrito : new FormControl({value: null, disabled: true})
        });

        this.minFechaEntregaTraslado.setDate(this.minFechaEntregaTraslado.getDate() - 1);
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

    get data(): any{
      return {
        datosEnvio: {
          tipo_transporte: this.f_datosEnvio.tipo_transporte.value,
          fecha_inicio_traslado: this.f_datosEnvio.fecha_inicio_traslado.value,
          fecha_entrega_transportista: this.f_datosEnvio.fecha_entrega_transportista.value,
          descripcion_traslado: this.f_datosEnvio.descripcion_traslado.value,
          unidad_peso_bruto: this.f_datosEnvio.unidad_peso_bruto.value,
          peso_bruto_total: this.f_datosEnvio.peso_bruto_total.value,
          pagador_flete: this.f_datosEnvio.pagador_flete.value,
          ruc_subcontratador: this.f_datosEnvio.ruc_subcontratador.value,
          nombre_rsocial_subcontratador: this.f_datosEnvio.nombre_rsocial_subcontratador.value,
          tipo_documento_tercero: this.f_datosEnvio.tipo_documento_tercero.value,
          numero_documento_tercero: this.f_datosEnvio.numero_documento_tercero.value,
          nombre_rsocial_tercero: this.f_datosEnvio.nombre_rsocial_tercero.value,

          ruc_transportista: this.f_datosEnvio.ruc_transportista.value,
          rsocial_transportista: this.f_datosEnvio.rsocial_transportista.value,
          num_mtc_transportista: this.f_datosEnvio.num_mtc_transportista.value,
          email_transportista: this.f_datosEnvio.email_transportista.value,

          traslado_vehiculo_categoria: this.f_datosEnvio.traslado_vehiculo_categoria.value,
          traslado_vehiculo_categoria_placa_vehiculo: this.f_datosEnvio.traslado_vehiculo_categoria_placa_vehiculo.value,

          registrar_vehiculos_conductores: this.f_datosEnvio.registrar_vehiculos_conductores.value,

          cod_establecimiento_origen: this.f_datosEnvio.cod_establecimiento_origen.value,
          ruc_establecimiento_origen: this.f_datosEnvio.ruc_establecimiento_origen.value,
          cod_establecimiento_destino: this.f_datosEnvio.cod_establecimiento_destino.value,
          ruc_establecimiento_destino: this.f_datosEnvio.ruc_establecimiento_destino.value,

          vehiculos: (this.vehiculos.controls as FormGroup[]).map(group => ({ 
            id: group.get('id')?.value, 
            placa_vehiculo: group.get('placa_vehiculo')?.value, 
            cert_habilitacion_vehiculo: group.get('cert_habilitacion_vehiculo')?.value, 
            entidad_emisora_autoriza_vehiculo: group.get('entidad_emisora_autoriza_vehiculo')?.value, 
            numero_autoriza_vehicular_vehiculo: group.get('numero_autoriza_vehicular_vehiculo')?.value
          })),

          conductores: (this.conductores.controls as FormGroup[]).map(group => ({ 
            id : group.get('id')?.value, 
            tipo_documento_conductor : group.get('tipo_documento_conductor')?.value, 
            numero_documento_conductor: group.get('numero_documento_conductor')?.value, 
            numero_licencia_brevete_conductor: group.get('numero_licencia_brevete_conductor')?.value, 
            nombre_conductor: group.get('nombre_conductor')?.value, 
            apellido_conductor: group.get('apellido_conductor')?.value, 
          })),

          num_autoriza_especial_adicional: this.f_datosEnvio.num_autoriza_especial_adicional.value,
          ent_emisora_especial_adicional: this.f_datosEnvio.ent_emisora_especial_adicional.value,
          indic_retorno_vehiculo_envase_adicional: this.f_datosEnvio.indic_retorno_vehiculo_envase_adicional.value,
          transbordo_programado_adicional: this.f_datosEnvio.transbordo_programado_adicional.value,
          indic_retorno_vehiculo_vacio_adicional: this.f_datosEnvio.indic_retorno_vehiculo_vacio_adicional.value
        },
        proveedor: {
          proveedor_id: this.f_datosProveedor.proveedor_id.value,
          tipo_documento_proveedor: this.f_datosProveedor.tipo_documento_proveedor.value,
          numero_documento_proveedor: this.f_datosProveedor.numero_documento_proveedor.value,
          nombre_rsocial_proveedor: this.f_datosProveedor.nombre_rsocial_proveedor.value,
          direccion_proveedor: this.f_datosProveedor.direccion_proveedor.value,
          idDepartamento : this.f_datosProveedor.idDepartamento.value,
          idProvincia : this.f_datosProveedor.idProvincia.value,
          idDistrito : this.f_datosProveedor.idDistrito.value
        }
      };
    }

    get esTransportePrivado(){
      return this.f_datosEnvio.tipo_transporte.value === 'PRIVADO';
    }

    get tieneDatosContenedor(): boolean{
      const motivosTraslado = [
        GuiaRemisionTipoTrasladoEnum.importacion,
        GuiaRemisionTipoTrasladoEnum.exportacion,
        GuiaRemisionTipoTrasladoEnum.traslado_mercancia_extranjera
      ];
      return motivosTraslado.includes(this.motivoTraslado); 
    }

    get mostrarProveedor(): boolean{
      const motivosTraslado = [
        GuiaRemisionTipoTrasladoEnum.compra,
        GuiaRemisionTipoTrasladoEnum.recojo_bienes_transformados,
        GuiaRemisionTipoTrasladoEnum.otros
      ];
      return motivosTraslado.includes(this.motivoTraslado);
    }

    get valid(): boolean{
      return this.formDatosEnvio.valid && this.formDatosProveedor.valid;
    }

    get invalid(): boolean{
      return this.formDatosEnvio.invalid || this.formDatosProveedor.invalid;
    }

    ngOnInit(): void {
      this.formDatosEnvio.get('registrar_vehiculos_conductores')?.valueChanges.subscribe(this.evtChaneValueRegistrarVehiculosConductores);

      this.formDatosEnvio.get('tipo_transporte')?.valueChanges.subscribe((res: any) => {
        this.evtChangeValueTipoTransporte(res);
      });

      /*this.formDatosEnvio.get('traslado_vehiculo_categoria')?.valueChanges.subscribe((res: boolean) => {
        this.f_datosEnvio.registrar_vehiculos_conductores.setValue(false);
        if(this.f_datosEnvio.tipo_transporte.value === 'PUBLICO'){
          this.f_datosEnvio.fecha_inicio_traslado.setValue(null);
          this.f_datosEnvio.fecha_entrega_transportista.setValue(null);

          if(res){
            this.f_datosEnvio.fecha_inicio_traslado.setValidators(Validators.required);
            this.f_datosEnvio.fecha_entrega_transportista.clearValidators();
          }else{
            this.f_datosEnvio.fecha_inicio_traslado.clearValidators();
            this.f_datosEnvio.fecha_entrega_transportista.setValidators(Validators.required);
          }
          this.cdr.markForCheck();
        }
      });*/
    }

    ngAfterViewInit(): void {
        //this.evtAddVehiculo();
        //this.evtAddConductor();
    }

    ngOnChanges(changes: SimpleChanges): void {

      if(changes['tipoGuia']){
        if(this.tipoGuia === 'TRANSPORTISTA'){
          this.f_datosEnvio.tipo_transporte.setValue('PRIVADO');
        }
        this.cdr.markForCheck();
      }

      if(changes['motivoTraslado']){
        console.log('motivo-traslado-cambio', changes['motivoTraslado'].currentValue);
        this.evtOnChangeMotivoTraslado(changes['motivoTraslado'].currentValue);
      }
    }

    ngOnDestroy(): void {

    }

    // functions
    newConductor(item: ConductorDto | null = null): FormGroup { 
      if(item){
        return this.fb.group({ 
          id: [ {value: item?.id, disabled: true}, Validators.required],
          tipo_documento_conductor: [{value: item.tipo_documento, disabled: true}, Validators.required], 
          numero_documento_conductor: [{value: item.numero_documento, disabled: true}, Validators.required], 
          numero_licencia_brevete_conductor: [{value: item.licencia, disabled: true}, Validators.required],
          nombre_conductor: [{value: item.nombres, disabled: true}, Validators.required],
          apellido_conductor: [{value: item.apellidos, disabled: true}, Validators.required],
          loading: [false]
        });
      }else{
        return this.fb.group({ 
          id: [ {value: 0, disabled: true}, Validators.required],
          tipo_documento_conductor: [ 'DNI', Validators.required], 
          numero_documento_conductor: [null, Validators.required], 
          numero_licencia_brevete_conductor: [null, Validators.required],
          nombre_conductor: [null, Validators.required],
          apellido_conductor: [null, Validators.required],
          loading: [false]
        }); 
      }
    }

    

    // events
    evtAddConductor(item: ConductorDto | null = null): void{
      const row = this.newConductor(item);
      this.conductores.push(row);
      this.cdr.markForCheck(); 
    }

    evtRemoveCoductor(index: number): void{
      this.handlerConfirmDialog(() => {
        this.conductores.removeAt(index);
        this.cdr.markForCheck();
      }, '¿Desea remover el conductor seleccionado?', 'Confirmar la operación.');
    }

    newVehiculo(vehiculo: UnidadTransporteDto | null = null): FormGroup { 
      if(vehiculo){
        return this.fb.group({ 
          id: [ {value: vehiculo?.id, disabled: true}, Validators.required], 
          placa_vehiculo: [ {value: vehiculo?.placa, disabled: true}, Validators.required], 
          cert_habilitacion_vehiculo: [{value: null, disabled: true}, this.f_datosEnvio.tipo_transporte.value === 'PUBLICO' ? [ Validators.required ] : []], 
          entidad_emisora_autoriza_vehiculo: [{value: vehiculo?.cod_emisor_vehicular, disabled: true}], 
          numero_autoriza_vehicular_vehiculo: [{value: vehiculo?.nro_autorizacion, disabled: true}]
        });
      }else{
        return this.fb.group({ 
          id: [ {value: 0, disabled: true}, Validators.required], 
          placa_vehiculo: [ {value: null, disabled: true}, Validators.required], 
          cert_habilitacion_vehiculo: [{value: null, disabled: true}, this.f_datosEnvio.tipo_transporte.value === 'PUBLICO' ? [ Validators.required ] : []], 
          entidad_emisora_autoriza_vehiculo: [{value: null, disabled: true}], 
          numero_autoriza_vehicular_vehiculo: [{value: null, disabled: true}]
        });
      }
      
    }

    // events
    evtAddVehiculo(item: UnidadTransporteDto | null = null): void{
      const row = this.newVehiculo(item);
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

      this.resetDatosEnvio();

      const pbrutoTotal = this.f_datosEnvio.peso_bruto_total.value;
      const upbrutoTotal = this.f_datosEnvio.unidad_peso_bruto.value;

      if(tipo === 'PRIVADO'){

        const pbrutoTotal = this.f_datosEnvio.peso_bruto_total.value;
        const upbrutoTotal = this.f_datosEnvio.unidad_peso_bruto.value;

        /*this.formDatosEnvio = this.fb.group({
          tipo_transporte: new FormControl('PRIVADO', Validators.required),
          fecha_inicio_traslado: new FormControl(null, Validators.required),
          fecha_entrega_transportista: new FormControl(null),
          descripcion_traslado: new FormControl(null),
          unidad_peso_bruto: new FormControl(upbrutoTotal, Validators.required),
          peso_bruto_total: new FormControl(pbrutoTotal, Validators.required),
          pagador_flete: this.tipoGuia === 'TRANSPORTISTA' ? new FormControl(EnumPagadorFlete.remitente,Validators.required) : new FormControl(null),

          traslado_vehiculo_categoria: new FormControl(false),
          traslado_vehiculo_categoria_placa_vehiculo: new FormControl(null),

          registrar_vehiculos_conductores: new FormControl(false),
          vehiculos: this.fb.array([], Validators.minLength(1)),
          conductores: this.fb.array([], Validators.minLength(1)),

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
        });*/

        //this.evtAddVehiculo();
        //this.evtAddConductor();
        
        /*this.f_datosEnvio.fecha_inicio_traslado.addValidators(Validators.required);
        this.f_datosEnvio.fecha_entrega_transportista.clearValidators();

        this.f_datosEnvio.ruc_transportista.clearValidators();
        this.f_datosEnvio.rsocial_transportista.clearValidators();*/
      }else{
        /*this.formDatosEnvio = this.fb.group({
          tipo_transporte: new FormControl('PUBLICO', Validators.required),
          fecha_inicio_traslado: new FormControl(null),
          fecha_entrega_transportista: new FormControl(null, Validators.required),
          descripcion_traslado: new FormControl(null),
          unidad_peso_bruto: new FormControl(upbrutoTotal, Validators.required),
          peso_bruto_total: new FormControl(pbrutoTotal, Validators.required),
          pagador_flete: new FormControl(null),

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
        });*/
      }

      this.cdr.markForCheck();
    }

    evtChaneValueRegistrarVehiculosConductores = (value: boolean): void => {
      this.vehiculos.clear();
      this.conductores.clear();

      if(value && this.f_datosEnvio.tipo_transporte.value === 'PUBLICO'){
        //this.evtAddVehiculo();
        //this.evtAddConductor();
      }

      this.cdr.markForCheck();
    }

    evtOnChangeTipoTransporte(tipoTrasnporte: 'PRIVADO' | 'PUBLICO'): void{
      this.f_datosEnvio.tipo_transporte.setValue(tipoTrasnporte);
    }

    evtOnChangeMotivoTraslado(motivoTraslado: GuiaRemisionTipoTrasladoEnum): void{

      // Limpiar los campos antes de manejarlos
      this.formDatosProveedor = this.fb.group({
        proveedor_id: new FormControl(null),
        tipo_documento_proveedor: new FormControl(null),
        numero_documento_proveedor: new FormControl(null),
        nombre_rsocial_proveedor: new FormControl(null),
        direccion_proveedor: new FormControl(null),
        idDepartamento : new FormControl(null),
        idProvincia : new FormControl(null),
        idDistrito : new FormControl(null)
      });
      this.formDatosProveedor.disable();
      this.formDatosProveedor.markAsUntouched();
      this.cdr.markForCheck();

      switch(this.mostrarProveedor){
        case true:
          this.formDatosProveedor = this.fb.group({
            proveedor_id: new FormControl(null, Validators.required),
            tipo_documento_proveedor: new FormControl(null, Validators.required),
            numero_documento_proveedor: new FormControl(null, Validators.required),
            nombre_rsocial_proveedor: new FormControl(null, Validators.required),
            direccion_proveedor: new FormControl(null, Validators.required),
            idDepartamento : new FormControl(null, Validators.required),
            idProvincia : new FormControl(null, Validators.required),
            idDistrito : new FormControl(null, Validators.required)
          });
          this.formDatosProveedor.disable();
          this.formDatosProveedor.markAsUntouched();
          this.cdr.markForCheck();
          break;
        case false:
          this.formDatosProveedor.reset();
          this.formDatosEnvio.get('proveedor_id')?.clearValidators();
          this.formDatosEnvio.get('tipo_documento_proveedor')?.clearValidators();
          this.formDatosEnvio.get('numero_documento_proveedor')?.clearValidators();
          this.formDatosEnvio.get('nombre_rsocial_proveedor')?.clearValidators();
          this.formDatosProveedor.disable();
          break;
        default:
          break;
      }

    }

    evtOnSubmit(): void {
        this.submitted = true;
        if(this.formDatosEnvio.invalid){
            this.alertService.showToast({
                position: 'top-end',
                icon: "warning",
                title: "Se tiene que completar los datos obligatorios en la sección de datos de envío.",
                showCloseButton: true,
                timerProgressBar: true,
                timer: 4000
            });
            console.log('invalid form', this.formDatosEnvio);
            return;
        }

        if(this.mostrarProveedor && this.formDatosProveedor.invalid){
            this.alertService.showToast({
                position: 'top-end',
                icon: "warning",
                title: "Se tiene que completar los datos obligatorios en la sección de datos del proveedor.",
                showCloseButton: true,
                timerProgressBar: true,
                timer: 4000
            });
            console.log('invalid form', this.formDatosProveedor);
            return;
        }
    }

    evtOnReset(): void {
        this.submitted = false;
        this.formDatosEnvio.reset();
        this.formDatosProveedor.reset();
    }

    evtOnSearchConductor(fg: AbstractControl, evt: any): void{
      evt.stopPropagation();
      evt.preventDefault();
      
      fg.get('loading')?.setValue(true);
      this.conductorService.getByNumeroDocumento(evt.target.value).subscribe((res) => {
        fg.get('tipo_documento_conductor')?.setValue(res.tipo_documento);
        fg.get('numero_licencia_brevete_conductor')?.setValue(res.licencia);
        fg.get('nombre_conductor')?.setValue(res.nombres);
        fg.get('apellido_conductor')?.setValue(res.apellidos);
        fg.get('loading')?.setValue(false);
      });
    }

    evtOnShowListaUnidadTransporte(): void{
        this.modalRef = this.dialogService.open(MdlListaUnidadTransporteComponent, {
            width: '1000px',
            keepInViewport: false,
            closable: true,
            modal: true,
            draggable: false,
            position: 'top',
            header: `Lista de vehiculos registrados`,
            styleClass: 'max-h-none!',
            maskStyleClass: 'py-4',
            contentStyle: {
              'padding': "0 !important"
            },
            appendTo: 'body'
        });

        const sub = this.modalRef.onChildComponentLoaded.subscribe((cmp: MdlListaUnidadTransporteComponent) => {
            const sub2 = cmp?.OnSelect.subscribe(( s: UnidadTransporteDto) => {
                const existe = this.vehiculos.controls.some(ctrl => ctrl.get('id')?.value === s.id);
                if(existe){
                  this.alertService.showToast({
                    text: "El vehiculo ya se encuentra seleccionado",
                    icon: "warning"
                  });
                }else{
                  this.evtAddVehiculo(s);
                }
                this.modalRef?.close();
            });
            const sub3 = cmp?.OnClose.subscribe(_ => {
                this.modalRef?.close();
            });
            this.subs.add(sub2);
            this.subs.add(sub3);
        });


        this.subs.add(sub);
    }

    evtOnShowListaConductor(): void{
        this.modalRef = this.dialogService.open(MdlListaConductorComponent, {
            width: '1000px',
            keepInViewport: false,
            closable: true,
            modal: true,
            draggable: false,
            position: 'top',
            header: `Lista de conductores registrados`,
            styleClass: 'max-h-none!',
            maskStyleClass: 'py-4',
            contentStyle: {
              'padding': "0 !important"
            },
            appendTo: 'body'
        });

        const sub = this.modalRef.onChildComponentLoaded.subscribe((cmp: MdlListaConductorComponent) => {
            const sub2 = cmp?.OnSelect.subscribe(( c: ConductorDto) => {
                const existe = this.conductores.controls.some(ctrl => ctrl.get('id')?.value === c.id);
                if(existe){
                  this.alertService.showToast({
                    text: "El conductor ya se encuentra seleccionado",
                    icon: "warning"
                  });
                }else{
                  this.evtAddConductor(c);
                }
                this.modalRef?.close();
            });
            const sub3 = cmp?.OnClose.subscribe(_ => {
                this.modalRef?.close();
            });
            this.subs.add(sub2);
            this.subs.add(sub3);
        });

        this.subs.add(sub);
    }

    evtOnShowListaProveedor(): void{

        this.modalRef = this.dialogService.open(MdlListaProveedorComponent, {
            width: '1000px',
            keepInViewport: false,
            closable: true,
            modal: true,
            draggable: false,
            position: 'top',
            header: `Lista de proveedores registrados`,
            styleClass: 'max-h-none!',
            maskStyleClass: 'py-4',
            contentStyle: {
              'padding': "0 !important"
            },
            appendTo: 'body'
        });

        const sub = this.modalRef.onChildComponentLoaded.subscribe((cmp: MdlListaProveedorComponent) => {
            const sub2 = cmp?.OnSelect.subscribe(( c: ProveedorDto) => {

                this.formDatosProveedor.patchValue({
                  proveedor_id: c.id,
                  tipo_documento_proveedor: c.tipo_documento,
                  numero_documento_proveedor: c.numero_documento,
                  nombre_rsocial_proveedor: c.razon_social,
                  direccion_proveedor: c.direccion,
                  idDepartamento : c.ubigeo_id?.substring(0,2)
                });
                this.provinciaProveedor!.valueEdit = c.ubigeo_id!.substring(0,4);
                const subProvincia1 = this.provinciaProveedor?.loading.subscribe(res => {
                    this.formDatosProveedor.get('idProvincia')?.setValue(c.ubigeo_id.substring(0,4));
                });
                this.distritoProveedor!.valueEdit = c.ubigeo_id;
                const subDistrito1 = this.distritoProveedor?.loading.subscribe((res: any) => {
                    this.formDatosProveedor.get('idDistrito')?.setValue(c.ubigeo_id);
                });

                subProvincia1?.unsubscribe();
                subDistrito1?.unsubscribe();

                this.modalRef?.close();
            });

            const sub3 = cmp?.OnClose.subscribe(_ => {
            this.modalRef?.close();
        });
            
            this.subs.add(sub2);
            this.subs.add(sub3);
        });

        this.subs.add(sub);
    }

    resetDatosEnvio(): void{
      this.formDatosEnvio.reset({
        tipo_transporte: this.f_datosEnvio.tipo_transporte.value,
        descripcion_traslado: this.f_datosEnvio.descripcion_traslado.value,
        peso_bruto_total: this.f_datosEnvio.peso_bruto_total.value,
        unidad_peso_bruto: this.f_datosEnvio.unidad_peso_bruto.value
      });
      (this.formDatosEnvio.get('vehiculos') as FormArray).clear();
      (this.formDatosEnvio.get('conductores') as FormArray).clear();
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