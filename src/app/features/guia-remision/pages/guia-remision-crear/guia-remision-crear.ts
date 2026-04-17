import { AsyncPipe, CommonModule, formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { SelectMotivoTrasladoComponent } from 'app/features/guia-remision/components/selects/select-motivo-traslado/select-motivo-traslado';
import { SelectTipoGuiaComponent } from 'app/features/guia-remision/components/selects/select-tipo-guia/select-tipo-guia';
import { TipoGuiaRemisionEnum, GuiaRemisionTipoTrasladoEnum } from 'app/features/guia-remision/enums/guia-remision.enum';
import { SelectTipoDocumentoComponent } from 'app/features/guia-remision/components/selects/select-tipo-documento/select-tipo-documento';
import { OnlyNumberDirective } from 'app/core/directives/only-numbers.directive';
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
import { SelectEmpresaRemitenteComponent } from 'app/features/guia-remision/components/selects/select-empresa-remitente/select-empresa-remitente';
import { RemitenteByIdToGuia } from 'app/features/remitente/models/remitente';
import { GuiaSectionCabeceraComponent } from 'app/features/guia-remision/components/sections/guia-section-cabecera/guia-section-cabecera';
import { GR_EnviarGuiaRemisionResponseDto, GuiaRemisionRemitenteRequestDto } from 'app/features/guia-remision/models/guia-remision.model';
import { GuiaRemitenteApiService } from 'app/features/guia-remitente/services/guia-remitente-api.service';
import { DocumentoService } from 'app/features/documento/service/DocumentoService';
import { fadeDownAnimation } from 'app/core/animations/page-animation';
import { LayoutService } from 'app/core/services/layout.service';
import { SelectDepartamentoComponent } from '@features/ubigeo/components/selects/select-departamento/select-departamento';
import { SelectProvinciaComponent } from '@features/ubigeo/components/selects/select-provincia/select-provincia';
import { SelectDistritoComponent } from '@features/ubigeo/components/selects/select-distrito/select-distrito';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MdlPrevisualizarPdfComponent } from '@features/guia-remision/components/modals/mdl-previsualizar-pdf/mdl-previsualizar-pdf';
import { AlertService } from 'app/core/services/alert.service';
import { Router } from '@angular/router';
import { MdlListaDestinatariosComponent } from '@features/destinatario/components/modals/mdl-lista-destinatarios/mdl-lista-destinatarios';
import { DestinatarioDto } from '@features/destinatario/models/destinatario';

interface Type {
    name: string;
    code: string | null;
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
    AutoCompleteModule
],
  viewProviders: [provideIcons({ heroQuestionMarkCircleSolid })],
  providers: [DialogService, ConfirmationService],
  animations: [fadeDownAnimation]
})

export class GuiaRemisionCrearComponent implements OnInit, AfterViewInit, OnDestroy{

    @ViewChild('selectEmpresaRemitente') selectEmpresaRemitente: SelectEmpresaRemitenteComponent | undefined;
    @ViewChild('tabDatosEnvioProveedor') tabDatosEnvioProveedor: TabDatosEnvioProveedorComponent | undefined;
    @ViewChild('tabOrigenDestino') tabOrigenDestino: TabOrigenDestinoComponent | undefined;
    @ViewChild('selectTipoGuia') selectTipoGuiaComponent: SelectTipoGuiaComponent | undefined;
    @ViewChild('sectionProductoListado') sectionProductoListadoComponent: SectionProductoListadoComponent | undefined;
    
    @ViewChild('departamentoDestinatario') departamentoDestinatario: SelectDepartamentoComponent | undefined;
    @ViewChild('provinciaDestinatario') provinciaDestinatario: SelectProvinciaComponent | undefined;
    @ViewChild('distritoDestinatario') distritoDestinatario: SelectDistritoComponent | undefined;
    @ViewChild('guiaCabecera') guiaCabecera: GuiaSectionCabeceraComponent | undefined;

    tipoGuia = TipoGuiaRemisionEnum;

    // Datos formulario
    formGroup: FormGroup = new FormGroup({});
    submitted: boolean = false;
    loadingSubmit: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    $loadingSubmit = this.loadingSubmit.asObservable();

    today: Date = new Date();
    last: Date = new Date(this.today.getFullYear(), this.today.getMonth(), (this.today.getDate()-1));

    remitenteSelected: RemitenteByIdToGuia | undefined;
    modalRef: any | undefined;
    private subs = new Subscription();

    breadCrumbItems: MenuItem[] = [{ label: 'Administración', labelClass: 'text-[12px]! font-semibold text-primary!' }, { label: 'Guía de Remisión', labelClass: 'text-[12px]!', routerLink: "/admin/guia-remision",}, { label: 'Nuevo', labelClass: 'text-[12px]!' }];

    tabRemitenteDestinatario = new BehaviorSubject<number>(0);
    tabRemitenteDestinatario$ = this.tabRemitenteDestinatario.asObservable();

    valueTab: any[] = [];

    minFechaEmision = new Date();

    constructor(
        private formBuilder: FormBuilder,
        public dialogService: DialogService,
        private cdr: ChangeDetectorRef,
        private confirmationService: ConfirmationService,
        private api: GuiaRemitenteApiService,
        private documentApi: DocumentoService,
        private ls: LayoutService,
        private alertService: AlertService,
        private router: Router
    ){
        this.minFechaEmision.setDate(this.minFechaEmision.getDate() - 1);

        this.ls.breadCrumbItems = this.breadCrumbItems;

        this.formGroup = this.formBuilder.group({

            remitente_id: new FormControl(null, Validators.required),

            tipo_traslado: new FormControl(GuiaRemisionTipoTrasladoEnum.venta, Validators.required),

            tipo_documento_remitente: new FormControl('RUC', Validators.required),
            numero_documento_remitente: new FormControl(null, Validators.required),
            razon_social_remitente: new FormControl(null, Validators.required),
            nombres_apellidos_remitente: new FormControl(null),
            direccion_remitente: new FormControl(null),
            departamento_remitente: new FormControl(null),
            provincia_remitente: new FormControl(null),
            distrito_remitente: new FormControl(null),
            contactos_remitente: new FormControl([], [this.maxEmailsValidator(1)]),

            id_destinatario: new FormControl(null, Validators.required),
            tipo_documento_destinatario: new FormControl('RUC'),
            numero_documento_destinatario: new FormControl({value: null, disabled: true}),
            razon_social_destinatario: new FormControl({value: null, disabled: true}),
            nombres_apellidos_destinatario: new FormControl({value: null, disabled: true}),
            direccion_destinatario: new FormControl({value: null, disabled: true}),
            departamento_destinatario: new FormControl({value: null, disabled: true}),
            provincia_destinatario: new FormControl({value: null, disabled: true}),
            distrito_destinatario: new FormControl({value: null, disabled: true}),
            contactos_destinatario: new FormControl([], [this.maxEmailsValidator(3)]),

            fecha_emision: new FormControl(new Date(), Validators.required),
            docs_ref: new FormArray([]),
        });

        this.formGroup.get('fecha_emision')?.setValue(new Date());

        this.formGroup.get('tipo_traslado')?.valueChanges.subscribe(value => {

            switch(value){
                case 'VENTA':
                        this.formGroup.get('tipo_documento_remitente')?.setValue('RUC');
                        this.formGroup.get('tipo_documento_remitente')?.enable();
                        this.formGroup.get('numero_documento_remitente')?.setValue(this.selectEmpresaRemitente?.selected?.ruc);
                        this.formGroup.get('razon_social_remitente')?.setValue(this.selectEmpresaRemitente?.selected?.nombre_empresa);
                        this.formGroup.get('numero_documento_remitente')?.enable();

                        this.formGroup.get('tipo_documento_destinatario')?.setValue('RUC');
                        this.formGroup.get('numero_documento_destinatario')?.setValue(null);
                        this.formGroup.get('razon_social_destinatario')?.setValue(null);

                        this.formGroup.get('contactos_destinatario')?.setValue([]);
                        this.formGroup.get('contactos_destinatario')?.clearAsyncValidators();
                        this.formGroup.get('contactos_destinatario')?.addValidators(this.maxEmailsValidator(1));
                    break;
                case 'TRASLADO': 
                        this.formGroup.get('tipo_documento_remitente')?.setValue('RUC');
                        this.formGroup.get('tipo_documento_remitente')?.disable();
                        this.formGroup.get('numero_documento_remitente')?.setValue(this.selectEmpresaRemitente?.selected?.ruc);
                        this.formGroup.get('razon_social_remitente')?.setValue(this.selectEmpresaRemitente?.selected?.nombre_empresa);
                        this.formGroup.get('numero_documento_remitente')?.disable();

                        this.formGroup.get('tipo_documento_destinatario')?.setValue('RUC');
                        this.formGroup.get('numero_documento_destinatario')?.setValue(this.selectEmpresaRemitente?.selected?.ruc);
                        this.formGroup.get('razon_social_destinatario')?.setValue(this.selectEmpresaRemitente?.selected?.nombre_empresa);

                        this.formGroup.get('direccion_destinatario')?.setValue(this.selectEmpresaRemitente?.selected?.direccion);
                        this.formGroup.get('departamento_destinatario')?.setValue(this.selectEmpresaRemitente?.selected?.ubigeo_id.substring(0,2));

                        this.provinciaDestinatario!.valueEdit = this.selectEmpresaRemitente!.selected!.ubigeo_id!.substring(0,4);
                        const subProvincia1 = this.provinciaDestinatario?.loading.subscribe(res => {
                            this.formGroup.get('provincia_destinatario')?.setValue(this.selectEmpresaRemitente?.selected?.ubigeo_id.substring(0,4));
                        });
                        this.distritoDestinatario!.valueEdit = this.selectEmpresaRemitente!.selected!.ubigeo_id;
                        const subDistrito1 = this.distritoDestinatario?.loading.subscribe((res: any) => {
                            this.formGroup.get('distrito_destinatario')?.setValue(this.selectEmpresaRemitente?.selected?.ubigeo_id);
                        });
                        subProvincia1?.unsubscribe();
                        subDistrito1?.unsubscribe();
                    break;
                case 'COMPRA':
                        this.formGroup.get('tipo_documento_remitente')?.setValue('RUC');
                        this.formGroup.get('tipo_documento_remitente')?.disable();
                        this.formGroup.get('numero_documento_remitente')?.setValue(this.selectEmpresaRemitente?.selected?.ruc);
                        this.formGroup.get('razon_social_remitente')?.setValue(this.selectEmpresaRemitente?.selected?.nombre_empresa);
                        this.formGroup.get('numero_documento_remitente')?.disable();

                        this.formGroup.get('tipo_documento_destinatario')?.setValue('RUC');
                        this.formGroup.get('numero_documento_destinatario')?.setValue(this.selectEmpresaRemitente?.selected?.ruc);
                        this.formGroup.get('numero_documento_destinatario')?.disable();
                        this.formGroup.get('razon_social_destinatario')?.setValue(this.selectEmpresaRemitente?.selected?.nombre_empresa);
                        this.formGroup.get('direccion_destinatario')?.setValue(this.selectEmpresaRemitente?.selected?.direccion);
                        this.formGroup.get('departamento_destinatario')?.setValue(this.selectEmpresaRemitente?.selected?.ubigeo_id.substring(0,2));

                        this.provinciaDestinatario!.valueEdit = this.selectEmpresaRemitente!.selected!.ubigeo_id!.substring(0,4);
                        const subProvincia = this.provinciaDestinatario?.loading.subscribe(res => {
                            this.formGroup.get('provincia_destinatario')?.setValue(this.selectEmpresaRemitente?.selected?.ubigeo_id.substring(0,4));
                        });
                        this.distritoDestinatario!.valueEdit = this.selectEmpresaRemitente!.selected!.ubigeo_id;
                        const subDistrito = this.distritoDestinatario?.loading.subscribe((res: any) => {
                            this.formGroup.get('distrito_destinatario')?.setValue(this.selectEmpresaRemitente?.selected?.ubigeo_id);
                        });
                        subProvincia?.unsubscribe();
                        subDistrito?.unsubscribe();
                    break; 
            }

        });

        this.formGroup.get('tipo_documento_remitente')?.valueChanges.subscribe((value: string) => { 
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
        });

        /*this.firstContactRemitente();*/
    }

    ngOnInit(): void{
    }

    ngAfterViewInit(): void{
    }

    ngOnDestroy(): void{
        this.subs.unsubscribe();
    }

    // Getters
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
            tipo_traslado: this.f.tipo_traslado.value,
            fecha: formatDate(this.f.fecha_emision.value, 'yyyy-MM-dd', 'en-US'),
            hora: formatDate(this.f.fecha_emision.value, 'HH:mm:ss', 'en-US'),
            observacion: this.sectionProductoListadoComponent?.getFormData.description ?? '',
            area: 'sistemas',
            registro_mtc: null,
            empleado_id_creacion: 1,
            empleado_nombre_creacion: 'SA',

            doc_relacionado: this.docs_ref.length ? (this.docs_ref as FormArray).controls.map((element: any) => {
                return {
                    tipo_doc_ref: element.get('tipo_comprobante')?.value,
                    numero_doc_ref: element.get('serie_correlativo')?.value,
                    ruc_doc_ref: element.get('ruc_documento')?.value
                };
            }) : null,

            remitente: {
                ruc: (this.f.tipo_traslado.value === 'VENTA' && this.selectTipoGuiaComponent?.tipoGuiaSelected === TipoGuiaRemisionEnum.remitente) ? this.selectEmpresaRemitente?.selected?.ruc : this.f.numero_documento_remitente.value,
                descripcion: this.selectEmpresaRemitente!.selected!.descripcion,
                nombre_empresa: this.selectEmpresaRemitente!.selected!.nombre_empresa,
                direccion: this.selectEmpresaRemitente!.selected!.direccion,
                departamento: this.selectEmpresaRemitente!.selected!.departamento,
                provincia: this.selectEmpresaRemitente!.selected!.provincia,
                distrito: this.selectEmpresaRemitente!.selected!.distrito,
                serie_numero: this.guiaCabecera!.serieNumero
            },

            destinatario: {
                destinatario_id: this.f.id_destinatario.value,
                tipo_documento: this.f.tipo_documento_destinatario.value,
                numero_documento: this.f.numero_documento_destinatario.value,
                razon_social: this.f.tipo_documento_destinatario.value === 'RUC' ? this.f.razon_social_destinatario.value : this.f.nombres_apellidos_destinatario.value,
                ubigeo_id: this.f.distrito_destinatario.value,
                departamento: this.departamentoDestinatario?.labelSelected ?? null,
                provincia: this.provinciaDestinatario?.labelSelected ?? null,
                distrito: this.distritoDestinatario?.labelSelected ?? null,
                direccion: this.f.direccion_destinatario.value,
                email_destinatario: this.destinatarioContactos.length ? this.destinatarioContactos : null,
            },

            proveedor: this.f.tipo_traslado.value !== "COMPRA" ? null : {
                proveedor_id: this.tabDatosEnvioProveedor?.data.proveedor.id,
                tipo_documento: this.tabDatosEnvioProveedor?.data.proveedor.tipo_documento_proveedor,
                numero_documento: this.tabDatosEnvioProveedor?.data.proveedor.numero_documento_proveedor,
                razon_social: this.tabDatosEnvioProveedor?.data.proveedor.nombre_rsocial_proveedor,
                ubigeo_id: this.tabDatosEnvioProveedor?.data.proveedor.idDistrito,
                direccion: this.tabDatosEnvioProveedor?.data.proveedor.direccion_proveedor,
                email: "sistemas4@carolina-peru.com",
            },

            datos_envio: {

                motivo_envio: this.tabDatosEnvioProveedor?.data.datosEnvio.tipo_transporte,
                fecha_envio: this.tabDatosEnvioProveedor?.data.datosEnvio.fecha_inicio_traslado ? formatDate(this.tabDatosEnvioProveedor?.data.datosEnvio.fecha_inicio_traslado, 'yyyy-MM-dd', 'en-US') : null,
                peso_bruto: this.tabDatosEnvioProveedor?.data.datosEnvio.peso_bruto_total,
                codigo_um: this.tabDatosEnvioProveedor?.data.datosEnvio.unidad_peso_bruto,
                ruc_empresa_currier: this.tabDatosEnvioProveedor?.data.datosEnvio.ruc_subcontratador,
                razon_social_currier: this.tabDatosEnvioProveedor?.data.datosEnvio.nombre_rsocial_subcontratador,
                registro_mtc_currier: this.tabDatosEnvioProveedor?.data.datosEnvio.num_mtc_transportista,

                indicador_vehiculo_conductor: this.tabDatosEnvioProveedor?.data.datosEnvio.registrar_vehiculos_conductores,

                conductor: this.tabDatosEnvioProveedor?.data.datosEnvio.conductores.length ? this.tabDatosEnvioProveedor?.data.datosEnvio.conductores.map((d: any) => {
                    return d.id
                }) : null,

                transporte: this.tabDatosEnvioProveedor?.data.datosEnvio.vehiculos.length ? this.tabDatosEnvioProveedor?.data.datosEnvio.vehiculos.map((d: any) => {
                    return d.id;
                }) : null
            },

            origen: {
                ubigeo_id: this.tabOrigenDestino?.getFormData.origen.ubigeo_id!,
                direccion: this.tabOrigenDestino?.getFormData.origen.direccion!,
                pais: 'PE'
            },

            destino: [{
                ubigeo_id: this.tabOrigenDestino?.getFormData.destino.ubigeo_id!,
                direccion: this.tabOrigenDestino?.getFormData.destino.direccion!,
                pais: 'PE'
            }],

            productos: this.sectionProductoListadoComponent!.getFormData.items.map((x) => {
                return {
                    codigo: x.codigo,
                    descripcion: x.descripcion,
                    cantidad: x.cantidad.toString(),
                    codigo_um: x.codigo_um
                };
            })
        }
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

        this.tabDatosEnvioProveedor?.evtOnSubmit();
        this.tabOrigenDestino?.evtOnSubmit();
        this.sectionProductoListadoComponent?.evtOnSubmit();

        if(this.sectionProductoListadoComponent?.invalid){
            return;
        }

        //console.log('request', this.request);

        this.loadingSubmit.next(true);
        this.api.saveRemisionRemitente(this.request, this.selectEmpresaRemitente?.selected?.ruc! ).subscribe({
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
                text: `Se registro la GUÍA DE REMISIÓN ${response.tipo_guia} ELECTRÓNICA\n N° ${response.numero_guia}`
               });
               this.router.navigate(['/admin/guia-remision']);
            },
            error: (error) => {
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

    evtOnShowDestinatarios(): void{
        this.modalRef = this.dialogService.open(MdlListaDestinatariosComponent, {
            width: '1000px',
            keepInViewport: false,
            closable: true,
            modal: true,
            draggable: false,
            position: 'top',
            header: `Lista de destinatarios registrados`,
            styleClass: 'max-h-none!',
            maskStyleClass: 'py-4',
            contentStyle: {
            'padding': "0 !important"
            },
            appendTo: 'body'
        });

        const sub = this.modalRef.onChildComponentLoaded.subscribe((cmp: MdlListaDestinatariosComponent) => {
            const sub2 = cmp?.OnSelect.subscribe(( s: DestinatarioDto) => {

                this.formGroup.patchValue({
                    id_destinatario: s.id,
                    tipo_documento_destinatario: s.tipo_documento,
                    numero_documento_destinatario: s.numero_documento,
                    razon_social_destinatario: s.razon_social,
                    nombres_apellidos_destinatario: s.razon_social,
                    direccion_destinatario: s.direccion,
                    departamento_destinatario: s.ubigeo_id.substring(0, 2)
                });
                this.provinciaDestinatario!.valueEdit = s.ubigeo_id!.substring(0,4);
                const subProvincia1 = this.provinciaDestinatario?.loading.subscribe(res => {
                    this.formGroup.get('provincia_destinatario')?.setValue(s.ubigeo_id.substring(0,4));
                });
                this.distritoDestinatario!.valueEdit = this.selectEmpresaRemitente!.selected!.ubigeo_id;
                const subDistrito1 = this.distritoDestinatario?.loading.subscribe((res: any) => {
                    this.formGroup.get('distrito_destinatario')?.setValue(s.ubigeo_id);
                });
                subProvincia1?.unsubscribe();
                subDistrito1?.unsubscribe();

                this.modalRef?.close();
            });
            this.subs.add(sub2);
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

    evtSelectDestEmi(val: any): void{
        this.tabRemitenteDestinatario.next(parseInt(val, 10));
        console.log(this.tabRemitenteDestinatario, this.selectTipoGuiaComponent?.tipoGuiaSelected);
    }

    evtPreview(): void{
        console.log('remitente', this.selectEmpresaRemitente!.selected!);
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

    // functions
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