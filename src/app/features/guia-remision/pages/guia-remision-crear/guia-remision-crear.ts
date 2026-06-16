import { AsyncPipe, CommonModule, formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef, signal, effect } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';

import { SelectTipoGuiaComponent } from 'app/features/guia-remision/components/selects/select-tipo-guia/select-tipo-guia';
import { SunatMotivoTrasladoEnum, TipoGuiaRemisionEnum } from 'app/features/guia-remision/enums/guia-remision.enum';
import { DatePickerModule } from 'primeng/datepicker';
import { TabOrigenDestinoComponent } from 'app/features/guia-remision/components/tabs/tab-origen-destino/tab-origen-destino';
import { SectionProductoListadoComponent } from 'app/features/guia-remision/components/sections/section-producto-listado/section-producto-listado';
import { TabDatosEnvioProveedorComponent } from 'app/features/guia-remision/components/tabs/tab-datos-envio-proveedor/tab-datos-envio-proveedor';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroQuestionMarkCircleSolid } from '@ng-icons/heroicons/solid';
import { TooltipModule } from 'primeng/tooltip';
import { MdlComprobanteReferenciaComponent } from 'app/features/guia-remision/components/modals/mdl-comprobante-referencia/mdl-comprobante-referencia';
import { DialogService } from 'primeng/dynamicdialog';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { MdlEditarComprobanteReferenciaComponent } from 'app/features/guia-remision/components/modals/mdl-editar-comprobante-referencia/mdl-editar-comprobante-referencia';
import { MessageModule } from 'primeng/message';
import { TableModule } from "primeng/table";
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CardModule } from 'primeng/card';
import { GuiaSectionCabeceraComponent } from 'app/features/guia-remision/components/sections/guia-section-cabecera/guia-section-cabecera';
import { GR_EnviarGuiaRemisionResponseDto, GR_ProductoRequestDto, GuiaRemisionRemitenteRequestDto } from 'app/features/guia-remision/models/guia-remision.model';
import { GuiaRemitenteApiService } from 'app/features/guia-remitente/services/guia-remitente-api.service';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
import { LayoutService } from 'app/core/services/layout.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MdlPrevisualizarPdfComponent } from '@features/guia-remision/components/modals/mdl-previsualizar-pdf/mdl-previsualizar-pdf';
import { AlertService } from 'app/core/services/alert.service';
import { Router } from '@angular/router';
import { DividerModule } from 'primeng/divider';
import { SelectEmpresaRemitenteComponent } from '@features/empresa/components/selects/select-empresa-remitente/select-empresa-remitente';
import { MdlListadoEstablecimientoComponent } from '@features/establecimiento/components/modals/mdl-listado-establecimiento/mdl-listado-establecimiento';
import { EstablecimientoDTO } from '@features/establecimiento/models/establecimiento.model';
import { EmpresaToSelectDto } from '@features/empresa/models/empresa.model';
import { SelectMotivoTrasladoComponent } from '@features/catalogo/components/selects/select-motivo-traslado/select-motivo-traslado';
import { TextareaModule } from 'primeng/textarea';
import { SectionResponsableListadoComponent } from '@features/guia-remision/components/sections/section-responsable-listado/section-responsable-listado';
import { TypingComponent } from '@features/shared/components/typing/typing';

export interface Puerto{
    value: string;
    label: string;
}

@Component({
  selector: 'page-guia-remision-crear',
  templateUrl: './guia-remision-crear.html',
  styleUrl: './guia-remision-crear.scss',
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
    DatePickerModule,
    TabOrigenDestinoComponent,
    SectionProductoListadoComponent,
    TabDatosEnvioProveedorComponent,
    NgIcon,
    TooltipModule,
    MessageModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    CardModule,
    SelectEmpresaRemitenteComponent,
    GuiaSectionCabeceraComponent,
    AsyncPipe,
    AutoCompleteModule,
    DividerModule,
    SelectMotivoTrasladoComponent,
    TextareaModule,
    SectionResponsableListadoComponent,
    TypingComponent
],
  viewProviders: [provideIcons({ heroQuestionMarkCircleSolid })],
  providers: [DialogService, ConfirmationService],
  animations: [fadeDownAnimation]
})

export class GuiaRemisionCrearComponent implements OnInit, AfterViewInit, OnDestroy{

    @ViewChild('selectMotivoTraslado') selectMotivoTraslado: SelectMotivoTrasladoComponent | undefined;

    @ViewChild('selectEmpresaRemitente') selectEmpresaRemitente: SelectEmpresaRemitenteComponent | undefined;
    @ViewChild('tabDatosEnvioProveedor') tabDatosEnvioProveedor: TabDatosEnvioProveedorComponent | undefined;
    @ViewChild('tabOrigenDestino') tabOrigenDestino: TabOrigenDestinoComponent | undefined;
    @ViewChild('selectTipoGuia') selectTipoGuiaComponent: SelectTipoGuiaComponent | undefined;
    @ViewChild('sectionProductoListado') sectionProductoListadoComponent: SectionProductoListadoComponent | undefined;
    @ViewChild('guiaCabecera') guiaCabecera: GuiaSectionCabeceraComponent | undefined;

    tipoGuia = TipoGuiaRemisionEnum;

    // Datos formulario
    formGroup: FormGroup = new FormGroup({});
    submitted = signal(false);
    loadingSubmit: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    $loadingSubmit = this.loadingSubmit.asObservable();

    today: Date = new Date();
    last: Date = new Date(this.today.getFullYear(), this.today.getMonth(), (this.today.getDate()-1));

    //remitenteSelected: RemitenteByIdToGuia | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modalRef: any | undefined;
    private subs = new Subscription();

    breadCrumbItems: MenuItem[] = [{ label: 'Administración', labelClass: 'text-[12px]! font-semibold text-primary!' }, { label: 'Guía de Remisión', labelClass: 'text-[12px]!', routerLink: "/administracion/guia-remision",}, { label: 'Nuevo', labelClass: 'text-[12px]!' }];

    tabRemitenteDestinatario = signal(0);

    //valueTab: any[] = [];

    minFechaEmision = new Date();
    maxFechaEmision = new Date();

    empresa = signal<EmpresaToSelectDto | null>(null);
    remitente = signal<EstablecimientoDTO | null>(null);
    destinatario = signal<EstablecimientoDTO | null>(null);

    puertos = signal<Puerto[]>([]);
    aereopuertos = signal<{value: string, label: string}[]>([]);

    constructor(
        private formBuilder: FormBuilder,
        public dialogService: DialogService,
        private cdr: ChangeDetectorRef,
        private confirmationService: ConfirmationService,
        private api: GuiaRemitenteApiService,
        private ls: LayoutService,
        private alertService: AlertService,
        private router: Router
    ){
        this.maxFechaEmision.setDate(this.maxFechaEmision.getDate() + 1);

        this.ls.breadCrumbItems = this.breadCrumbItems;

        this.formGroup = this.formBuilder.group({

            empresa_id: new FormControl(null, Validators.required),

            motivo_traslado_id: new FormControl(null, Validators.required),

            remitente_id: new FormControl(null, Validators.required),
            contactos_remitente: new FormControl([], [this.maxEmailsValidator(1)]),

            destinatario_id: new FormControl(null, Validators.required),
            contactos_destinatario: new FormControl([], [this.maxEmailsValidator(3)]),

            fecha_emision: new FormControl(new Date(), Validators.required),
            docs_ref: new FormArray([]),
            observacion: new FormControl(null)
        });

        this.formGroup.get('fecha_emision')?.setValue(new Date());


        // detectar el cambio en motivo traslado
        this.formGroup.get('motivo_traslado_id')?.valueChanges.subscribe(() => {
            this.tabRemitenteDestinatario.set(0);
            this.remitente.set(null);
            this.destinatario.set(null);
        });

        /*this.formGroup.get('tipo_documento_remitente')?.valueChanges.subscribe((value: string) => { 
            this.formGroup.get('numero_documento_remitente')?.clearValidators();
            this.formGroup.get('razon_social_remitente')?.clearValidators();
            this.formGroup.get('nombres_apellidos_remitente')?.clearValidators();

            if(value === 'RUC'){
                this.formGroup.get('razon_social_remitente')?.setValidators(Validators.required);
            }else{
                this.formGroup.get('nombres_apellidos_remitente')?.setValidators(Validators.required);
            }

            switch(value){
                case 'RUC':
                    this.formGroup.get('numero_documento_remitente')?.setValidators([Validators.required, Validators.minLength(11), Validators.maxLength(11)]);
                break;
                case 'DNI':
                    this.formGroup.get('numero_documento_remitente')?.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(8)]);
                break;
                case 'PASAPORTE':
                    this.formGroup.get('numero_documento_remitente')?.setValidators([Validators.required, Validators.maxLength(12)]);
                break;
                case 'CARNET DE EXTRANJERIA':
                    this.formGroup.get('numero_documento_remitente')?.setValidators([Validators.required, Validators.maxLength(12)]);
                break;
                default: 
                break;
            }

            this.cdr.markForCheck();
        });*/

        /*effect(() => {
            const remitente = this.remitente();
            //this.handlerValueRemitente(remitente);
        });*/

        effect(() => {
            this.empresa();
            this.resetRemitenteForm();
            this.resetDestinatarioForm();
        });
    }

    ngOnInit(): void{

    }

    ngAfterViewInit(): void{
        this.selectEmpresaRemitente?.onChange.subscribe((selected: EmpresaToSelectDto | null) => {
            this.empresa.set(selected);
        });
    }

    ngOnDestroy(): void{
        this.subs.unsubscribe();
    }

    // Getters

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get f(): any{
        return this.formGroup.controls;
    }

    get docs_ref(): FormArray { 
      return this.formGroup.get('docs_ref') as FormArray; 
    }

    get remitenteContactos(): FormArray {
      return this.formGroup.get('contactos_remitente') as FormArray; 
    }

    get destinatarioContactos(): string[] {
      return this.formGroup.get('contactos_destinatario')!.value as string[]; 
    }

    get request(): GuiaRemisionRemitenteRequestDto{

        return {
            tipo_transporte: this.tabDatosEnvioProveedor?.data.datosEnvio.tipo_transporte ?? 'PRIVADO',
            motivo_traslado_id: parseInt(this.f.motivo_traslado_id.value, 10),
            motivo_traslado: this.selectMotivoTraslado!.selected(),
            fecha: formatDate(this.f.fecha_emision.value, 'yyyy-MM-dd', 'en-US'),
            hora: formatDate(this.f.fecha_emision.value, 'HH:mm:ss', 'en-US'),
            observacion: this.f.observacion.value ?? '',
            registro_mtc: null,

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            doc_relacionado: this.docs_ref.length ? (this.docs_ref as FormArray).controls.map((element: any) => {
                return {
                    tipo_doc_ref: element.get('tipo_comprobante')?.value,
                    numero_doc_ref: element.get('serie_correlativo')?.value,
                    ruc_doc_ref: element.get('ruc_documento')?.value
                };
            }) : null,

            remitente: this.remitente()!,
            remitente_id: this.remitente()!.id,

            destinatario: this.destinatario()!,
            destinatario_id: this.destinatario()!.id,

            proveedor: null,
            proveedor_id: !this.tabDatosEnvioProveedor?.mostrarProveedor() ? null : this.tabDatosEnvioProveedor?.data.proveedor.proveedor_id,

            datos_envio: {

                motivo_envio: this.tabDatosEnvioProveedor?.data.datosEnvio.tipo_transporte,
                fecha_envio: this.tabDatosEnvioProveedor?.data.datosEnvio.fecha_inicio_traslado ? formatDate(this.tabDatosEnvioProveedor?.data.datosEnvio.fecha_inicio_traslado, 'yyyy-MM-dd', 'en-US') : null,
                fecha_entrega_transportista: this.tabDatosEnvioProveedor?.data.datosEnvio.fecha_entrega_transportista ? formatDate(this.tabDatosEnvioProveedor?.data.datosEnvio.fecha_entrega_transportista, 'yyyy-MM-dd', 'en-US') : null,
                peso_bruto: this.tabDatosEnvioProveedor?.data.datosEnvio.peso_bruto_total,
                unidad_medida_id: this.tabDatosEnvioProveedor?.data.datosEnvio.unidad_medida_id,
                codigo_um: this.tabDatosEnvioProveedor?.data.datosEnvio.codigo_um,
                
                indicador_traslado_vehiculo_categoria: this.tabDatosEnvioProveedor?.data.datosEnvio.traslado_vehiculo_categoria,
                traslado_vehiculo_categoria_placa_vehiculo: this.tabDatosEnvioProveedor?.data.datosEnvio.traslado_vehiculo_categoria_placa_vehiculo,
                
                
                ruc_empresa_currier: this.tabDatosEnvioProveedor?.data.datosEnvio.ruc_subcontratador,
                razon_social_currier: this.tabDatosEnvioProveedor?.data.datosEnvio.nombre_rsocial_subcontratador,
                registro_mtc_currier: this.tabDatosEnvioProveedor?.data.datosEnvio.num_mtc_transportista,

                transportista: this.tabDatosEnvioProveedor?.data.datosEnvio.transportista,
                transportista_id: this.tabDatosEnvioProveedor?.transportista?.id,

                indicador_registro_vehiculo_conductor: this.tabDatosEnvioProveedor?.data.datosEnvio.indic_registrar_vehiculos_conductores,
                indicador_transbordo_programado: this.tabDatosEnvioProveedor?.data.datosEnvio.indic_transbordo_programado_adicional,
                indicador_retorno_vehiculo_vacio: this.tabDatosEnvioProveedor?.data.datosEnvio.indic_retorno_vehiculo_vacio_adicional,
                indicador_retorno_vehiculo_envases_vacios: this.tabDatosEnvioProveedor?.data.datosEnvio.indic_retorno_vehiculo_envase_vacio_adicional,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                conductor: this.tabDatosEnvioProveedor?.data.datosEnvio.conductores.length ? this.tabDatosEnvioProveedor?.data.datosEnvio.conductores.map((d: any) => {
                    return d.id
                }) : null,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                transporte: this.tabDatosEnvioProveedor?.data.datosEnvio.vehiculos.length ? this.tabDatosEnvioProveedor?.data.datosEnvio.vehiculos.map((d: any) => {
                    return d.id;
                }) : null

            },

            origen: {
                ubigeo_id: this.tabOrigenDestino!.getFormData.origen.ubigeo_id!,
                direccion: this.tabOrigenDestino!.getFormData.origen.direccion!,
                pais: 'PE'
            },

            destino: [{
                ubigeo_id: this.tabOrigenDestino!.getFormData.destino.ubigeo_id!,
                direccion: this.tabOrigenDestino!.getFormData.destino.direccion!,
                pais: 'PE'
            }],

            productos: this.sectionProductoListadoComponent!.getFormData.map((x: GR_ProductoRequestDto) => {
                return {
                    codigo: x.codigo,
                    descripcion: x.descripcion,
                    cantidad: x.cantidad.toString(),
                    unidad_medida_id: x.unidad_medida_id,
                    codigo_um: x.codigo_um,
                    codigo_sunat: x.codigo_sunat,
                    gtin: x.gtin,
                    codigo_subnacional: x.codigo_subnacional,
                    bien_normalizado: x.bien_normalizado
                };
            })
            
        }
    }

    get mostrarSeleccionarDestinatario(): boolean {
        const motivos_traslado = [
            SunatMotivoTrasladoEnum.compra,
            SunatMotivoTrasladoEnum.traslado_establecimientos_misma_empresa
        ];
        return !motivos_traslado.includes(this.f.motivo_traslado_id.value);
    }

    get mostrarProveedor(): boolean{
      const motivosTraslado = [
        SunatMotivoTrasladoEnum.compra,
        SunatMotivoTrasladoEnum.otros
      ];
      return motivosTraslado.includes(this.f.motivo_traslado_id.value);
    }


    // Events
    evtOnSubmit(): void{

        this.submitted.set(true);

        if( !this.handlerValidation() ) return;

        console.log('request', this.request);

        this.loadingSubmit.next(true);
        this.api.saveRemisionRemitente(this.request, this.selectEmpresaRemitente!.selected()!.ruc! ).subscribe({
            next: (response: GR_EnviarGuiaRemisionResponseDto ) => {
                this.loadingSubmit.next(false);
                /*if(response.success && response.respuesta_facturador.codigo === '0'){
                    this.documentApi.obtenerPdfByTicketEfact(response.respuesta_facturador.descripcion)
                    .subscribe({
                        next: ({blob, filename}) => {
                            saveAs(blob, filename);
                        },
                        error: (e) => {
                            console.log('error');
                        }
                    });
                }*/
                this.alertService.showSwalAlert({
                    icon: "success",
                    title: "¡Guía de Remisión Registrada!",
                    text: `Se registro la GUÍA DE REMISIÓN ${response.tipo_guia} ELECTRÓNICA\n N° ${response.numero_guia}`,
                    timer: 3000
                }).then(() => {
                    this.router.navigate(['/administracion/guia-remision']);
                });
               //this.router.navigate(['/administracion/guia-remision']);
            },
            error: (error) => {
                this.alertService.showToast({
                    icon: "error",
                    text: error.error.detalle,
                    showCloseButton: true,
                    timer: 4000
                });
                this.loadingSubmit.next(false);
            }
        });
    }

    evtShowAddDocRef(): void{
        this.modalRef = this.dialogService.open(MdlComprobanteReferenciaComponent, {
            width: '1000px',
            keepInViewport: false,
            closable: true,
            modal: true,
            draggable: false,
            position: 'top',
            header: `Agregar comprobante de referencia`,
            styleClass: 'max-h-none!',
            maskStyleClass: 'py-4',
            contentStyle: {
            'padding': "0 !important"
            },
            appendTo: 'body'
        });

        const sub = this.modalRef.onChildComponentLoaded.subscribe((cmp: MdlComprobanteReferenciaComponent) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sub2 = cmp?.OnAdded.subscribe(( s: any) => {
                this.evtAddDocRef(s);
                this.modalRef?.close();
            });
            const sub3 = cmp?.OnCanceled.subscribe(() => {
                this.modalRef?.close();
            });

            this.subs.add(sub2);
            this.subs.add(sub3);
        });

        this.subs.add(sub);
    }

    evtShowEditDocRef(fg: FormGroup): void{
        const body = { 
            tipo_comprobante: fg.value.tipo_comprobante, 
            ruc_documento: fg.value.ruc_documento, 
            serie_correlativo: fg.value.serie_correlativo 
        };

        this.modalRef = this.dialogService.open(MdlEditarComprobanteReferenciaComponent, {
            width: '1000px',
            keepInViewport: false,
            closable: true,
            modal: true,
            draggable: false,
            position: 'top',
            header: `Editar comprobante de referencia`,
            styleClass: 'max-h-none!',
            maskStyleClass: 'py-4',
            contentStyle: {
                'padding': "0 !important"
            },
            appendTo: 'body',
            data: {
                row: body
            }
        });

        const sub = this.modalRef.onChildComponentLoaded.subscribe((cmp: MdlEditarComprobanteReferenciaComponent) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sub2 = cmp?.OnAdded.subscribe(( s: any) => {
                this.evtAddDocRef(s);
                this.modalRef?.close();
            });
            const sub3 = cmp?.OnCanceled.subscribe(() => {
                this.modalRef?.close();
            });

            this.subs.add(sub2);
            this.subs.add(sub3);
        });

        this.subs.add(sub);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    evtAddDocRef(data: any): void{
      const row = this.newDocRef(data);
      this.docs_ref.push(row);
      this.cdr.markForCheck(); 
    }

    evtRemoveDocRef(index: number): void{
      this.handlerConfirmDialog(() => {
        this.docs_ref.removeAt(index);
        this.cdr.markForCheck();
      }, '¿Desea remover el comprobante de referencia seleccionado?', 'Confirmar la operación.');
    }


    evtOnShowEstablecimiento( to: string ): void{

        if(!this.selectMotivoTraslado?.selected()){
            this.alertService.showToast({
                icon: 'warning',
                title: `Debe seleccionar el motivo de traslado`
            });
            return;
        }

        if(to === 'destinatario' && !this.remitente()){
            this.alertService.showToast({
                icon: 'warning',
                title: `Debe seleccionar un remitente`
            });
            return;
        }

        this.modalRef = this.dialogService.open(MdlListadoEstablecimientoComponent, {
            width: '1000px',
            keepInViewport: false,
            closable: true,
            modal: true,
            draggable: false,
            position: 'top',
            header: `Lista de establecimientos registrados`,
            styleClass: 'max-h-none!',
            maskStyleClass: 'py-4',
            contentStyle: {
                'padding': "0 !important"
            },
            appendTo: 'body',
            inputValues: {
                ruc: this.empresa()?.ruc,
                tipo: to,
                motivoTraslado: this.selectMotivoTraslado?.selected(),
                remitente: this.remitente()
            }
        });


        const sub = this.modalRef.onChildComponentLoaded.subscribe((cmp: MdlListadoEstablecimientoComponent) => {
            const sub2 = cmp?.OnSelected.subscribe(( s: EstablecimientoDTO) => {
                (to === 'remitente' ? this.remitente : this.destinatario).set(s);
                this.modalRef?.close();
                this.alertService.showToast({
                    icon: 'success',
                    title: `${to === 'remitente' ? 'Remitente' : 'Destinatario' } seleccionado con éxito.`,
                    timer: 4000,
                    showCloseButton: true
                });
            });

            const sub3 = cmp?.OnClose.subscribe(() => {
                this.modalRef?.close();
            });
            this.subs.add(sub2);
            this.subs.add(sub3);
        });


        this.subs.add(sub);
    }


    /*evtAddContactRemitente(): void{
        if(this.f.contactos_remitente.invalid || this.contactosEmisorhasEmpty()) return;
        const row = this.newContact();
        this.remitenteContactos.push(row);
        this.cdr.markForCheck(); 
    }*/

    /*evtRemoveContactRemitente(index: number): void{
        this.remitenteContactos.removeAt(index);
        this.cdr.markForCheck();
    }*/

    /*evtAddContactDestinatario(): void{
        if(this.f.contactos_destinatario.invalid || this.contactosDestinatariohasEmpty()) return;
        const row = this.newContact();
        this.destinatarioContactos.push(row);
        this.cdr.markForCheck(); 
    }*/

    /*evtRemoveContactDestinatario(index: number): void{
        this.destinatarioContactos.removeAt(index);
        this.cdr.markForCheck();
    }*/

    evtSelectDestEmi(val: string | number | undefined): void{
        if(val) this.tabRemitenteDestinatario.set(parseInt(val.toString(), 10));
    }

    evtPreview(): void{
        this.modalRef = this.dialogService.open(MdlPrevisualizarPdfComponent,  {
            width: '1200px',
            height: '90vh',
            closable: true,
            maximizable: true,
            modal: true,
            draggable: false,
            header: "Previsualización",
            styleClass: 'max-h-none! slide-down-dialog overflow-hidden',
            maskStyleClass: 'overflow-y-auto',
            contentStyle: {
                height: '100%',
                padding: '0',
                overflow: 'hide'
            },
            appendTo: 'body',
            inputValues:{
                data: this.request
            }
        });
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

    handlerValidation(): boolean{
        if(!this.f.motivo_traslado_id.value){
            this.alertService.showToast({
                title: "Debe seleccionar el motivo de traslado",
                icon: 'error',
                timer: 4000,
                timerProgressBar: true,
                showCloseButton: true
            });
            return false;
        }

        if(!this.remitente()){
            this.alertService.showToast({
                title: "Debe seleccionar el remitente",
                icon: 'error',
                timer: 4000,
                timerProgressBar: true,
                showCloseButton: true
            });
            return false;
        }

        if(!this.destinatario()){
            this.alertService.showToast({
                title: "Debe seleccionar el destinatario",
                icon: 'error',
                timer: 4000,
                timerProgressBar: true,
                showCloseButton: true
            });
            return false;
        }

        if(!this.tabDatosEnvioProveedor?.evtOnSubmit()) return false;
        if(!this.tabOrigenDestino?.evtOnSubmit()) return false;
        if(!this.sectionProductoListadoComponent?.evtOnSubmit()) return false;

        return true;
    }

  
    // functions

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newDocRef(data: any): FormGroup { 
      return this.formBuilder.group({ 
        tipo_comprobante: new FormControl(data.tipo_comprobante, Validators.required),
        ruc_documento: new FormControl(data.ruc_documento, Validators.required),
        serie_correlativo: new FormControl(data.serie_correlativo, Validators.required)
      });
    }

    newContact(): FormGroup { 
      return this.formBuilder.group({ 
        email: new FormControl(null, [Validators.email])
      });
    }

    resetDestinatarioForm(): void{
        this.destinatario.set(null);
        this.formGroup.patchValue({
            destinatario_id: null,
            contactos_destinatario: [],
        });
        //(this.formGroup.get('docs_ref') as FormArray).clear();
    }

    resetRemitenteForm(): void{
        this.remitente.set(null);
        this.formGroup.patchValue({
            remitente_id: null,
            contactos_remitente: [],
        });
        //(this.formGroup.get('docs_ref') as FormArray).clear();
    }

    /*firstContactRemitente(): void{
        this.remitenteContactos.push(this.newContact());
    }

    firstContactDestinatario(): void{
        this.remitenteContactos.push(this.newContact());
    }*/

    /*contactosEmisorhasEmpty(): boolean{
        // recorrer los contactos y validar si todos los controles tienen valor
        for(let i = 0; i < this.remitenteContactos.length; i++){
            const fg = this.remitenteContactos.at(i) as FormGroup;
            if(!fg.value.email) return true;
        }

        return false;
    }*/

    /*contactosDestinatariohasEmpty(): boolean{
        // recorrer los contactos y validar si todos los controles tienen valor
        for(let i = 0; i < this.destinatarioContactos.length; i++){
            const fg = this.destinatarioContactos.at(i) as FormGroup;
            if(!fg.value.email) return true;
        }

        return false;
    }*/


    maxEmailsValidator(max: number = 3): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;

            if (!value || !Array.isArray(value)) {
            return null;
            }

            // Validar cantidad máxima
            if (value.length > max) {
            return { maxEmails: { requiredMax: max, actual: value.length } };
            }

            // Validar formato de cada correo
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const invalidEmails = value.filter((email: string) => !emailRegex.test(email));

            if (invalidEmails.length > 0) {
            return { invalidEmails: invalidEmails };
            }

            return null;
        };
    }

}