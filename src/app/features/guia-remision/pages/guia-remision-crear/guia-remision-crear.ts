import { AsyncPipe, CommonModule, formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef, signal, effect } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { SelectMotivoTrasladoComponent } from 'app/features/guia-remision/components/selects/select-motivo-traslado/select-motivo-traslado';
import { SelectTipoGuiaComponent } from 'app/features/guia-remision/components/selects/select-tipo-guia/select-tipo-guia';
import { TipoGuiaRemisionEnum, GuiaRemisionTipoTrasladoEnum } from 'app/features/guia-remision/enums/guia-remision.enum';
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
import { RemitenteByIdToGuia } from 'app/features/remitente/models/remitente';
import { GuiaSectionCabeceraComponent } from 'app/features/guia-remision/components/sections/guia-section-cabecera/guia-section-cabecera';
import { GR_EnviarGuiaRemisionResponseDto, GuiaRemisionRemitenteRequestDto } from 'app/features/guia-remision/models/guia-remision.model';
import { GuiaRemitenteApiService } from 'app/features/guia-remitente/services/guia-remitente-api.service';
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
import { DividerModule } from 'primeng/divider';
import { SelectEmpresaRemitenteComponent } from '@features/empresa/components/selects/select-empresa-remitente/select-empresa-remitente';
import { MdlListadoEstablecimientoComponent } from '@features/establecimiento/components/modals/mdl-listado-establecimiento/mdl-listado-establecimiento';
import { EstablecimientoDTO } from '@features/establecimiento/models/establecimiento.model';
import { EmpresaToSelectDto } from '@features/empresa/models/empresa.model';
import { SelectTipoDocumentoComponent } from '@features/catalogo/components/selects/select-tipo-documento/select-tipo-documento';

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
    AutoCompleteModule,
    DividerModule,

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
    
    @ViewChild('departamentoRemitente') departamentoRemitente: SelectDepartamentoComponent | undefined;
    @ViewChild('provinciaRemitente') provinciaRemitente: SelectProvinciaComponent | undefined;
    @ViewChild('distritoRemitente') distritoRemitente: SelectDistritoComponent | undefined;

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

    breadCrumbItems: MenuItem[] = [{ label: 'Administración', labelClass: 'text-[12px]! font-semibold text-primary!' }, { label: 'Guía de Remisión', labelClass: 'text-[12px]!', routerLink: "/administracion/guia-remision",}, { label: 'Nuevo', labelClass: 'text-[12px]!' }];

    tabRemitenteDestinatario = new BehaviorSubject<number>(0);
    tabRemitenteDestinatario$ = this.tabRemitenteDestinatario.asObservable();

    valueTab: any[] = [];

    minFechaEmision = new Date();
    maxFechaEmision = new Date();

    empresa = signal<EmpresaToSelectDto | null>(null);
    remitente = signal<EstablecimientoDTO | null>(null);
    destinatario = signal<EstablecimientoDTO | null>(null);

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

            motivo_traslado: new FormControl(GuiaRemisionTipoTrasladoEnum.venta, Validators.required),

            remitente_id: new FormControl(null, Validators.required),
            tipo_documento_remitente: new FormControl({value: 'RUC', disabled: true}, Validators.required),
            numero_documento_remitente: new FormControl({value: null, disabled: true}, Validators.required),
            razon_social_remitente: new FormControl({value: null, disabled: true}, Validators.required),
            nombres_apellidos_remitente: new FormControl({value: null, disabled: true}),
            direccion_remitente: new FormControl({value: null, disabled: true}),
            departamento_remitente: new FormControl({value: null, disabled: true}),
            provincia_remitente: new FormControl({value: null, disabled: true}),
            distrito_remitente: new FormControl({value: null, disabled: true}),
            contactos_remitente: new FormControl([], [this.maxEmailsValidator(1)]),

            destinatario_id: new FormControl(null, Validators.required),
            tipo_documento_destinatario: new FormControl({value: 'RUC', disabled: true}, Validators.required),
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


        // detectar el cambio en motivo traslado
        this.formGroup.get('motivo_traslado')?.valueChanges.subscribe(value => {
            this.tabRemitenteDestinatario.next(0);
            this.remitente.set(null);
            this.destinatario.set(null);
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

        effect(() => {
            const remitente = this.remitente();
            this.handlerValueRemitente(remitente);
        });

        effect(() => {
            const destinatario = this.destinatario();
            this.handlerValueDestinatario(destinatario);
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
        //console.log('proveedor', this.tabDatosEnvioProveedor?.data.proveedor);
        return {
            tipo_transporte: this.tabDatosEnvioProveedor?.data.datosEnvio.tipo_transporte ?? 'PRIVADO',
            tipo_traslado: this.f.motivo_traslado.value,
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
                remitente_id: this.f.remitente_id.value,
                numero_documento: this.remitente()!.ruc,
                descripcion: this.remitente()!.descripcion,
                nombre_empresa: this.remitente()!.razon_social,
                direccion: this.remitente()!.direccion,
                departamento: this.remitente()!.departamento,
                provincia: this.remitente()!.provincia,
                distrito: this.remitente()!.distrito,
                serie_numero: "",
            },

            destinatario: {
                destinatario_id: this.f.destinatario_id.value,
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

            proveedor: (!this.mostrarProveedor) ? null : {
                proveedor_id: this.tabDatosEnvioProveedor?.data.proveedor.proveedor_id,
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

    get mostrarSeleccionarDestinatario(): boolean {
        const motivos_traslado = [
            GuiaRemisionTipoTrasladoEnum.compra,
            GuiaRemisionTipoTrasladoEnum.traslado_establecimientos_misma_empresa,
            GuiaRemisionTipoTrasladoEnum.recojo_bienes_transformados
        ];
        return !motivos_traslado.includes(this.f.motivo_traslado.value);
    }

    get mostrarProveedor(): boolean{
      const motivosTraslado = [
        GuiaRemisionTipoTrasladoEnum.compra,
        GuiaRemisionTipoTrasladoEnum.recojo_bienes_transformados,
        GuiaRemisionTipoTrasladoEnum.otros
      ];
      return motivosTraslado.includes(this.f.motivo_traslado.value);
    }


    // Events
    evtOnSubmit(): void{

        console.log('envio_proveedor_invalid', this.tabDatosEnvioProveedor?.invalid);

        this.tabDatosEnvioProveedor?.evtOnSubmit();
        this.tabOrigenDestino?.evtOnSubmit();
        this.sectionProductoListadoComponent?.evtOnSubmit();

        if(
            this.tabDatosEnvioProveedor?.invalid ||
            this.tabOrigenDestino?.invalid ||
            this.sectionProductoListadoComponent?.invalid
        ){
            return;
        }

        //console.log('request', this.request);

        this.loadingSubmit.next(true);
        this.api.saveRemisionRemitente(this.request, this.selectEmpresaRemitente?.selected()?.ruc! ).subscribe({
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
               this.router.navigate(['/administracion/guia-remision']);
            },
            error: (error) => {
                this.alertService.showToast({
                    icon: "error",
                    text: error.error.detalle
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


    evtOnShowEstablecimiento( to: string ): void{
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
                ruc: this.empresa()?.ruc
            }
        });


        const sub = this.modalRef.onChildComponentLoaded.subscribe((cmp: MdlListadoEstablecimientoComponent) => {
            const sub2 = cmp?.OnSelected.subscribe(( s: EstablecimientoDTO) => {
                (to === 'remitente' ? this.remitente : this.destinatario).set(s);
                this.modalRef?.close();
            });

            const sub3 = cmp?.OnClose.subscribe((_: any) => {
                this.modalRef?.close();
            });
            this.subs.add(sub2);
            this.subs.add(sub3);
        });


        this.subs.add(sub);
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
                    destinatario_id: s.id,
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
                /*this.distritoDestinatario!.valueEdit = this.selectEmpresaRemitente!.selected()!.ubigeo_id;
                const subDistrito1 = this.distritoDestinatario?.loading.subscribe((res: any) => {
                    this.formGroup.get('distrito_destinatario')?.setValue(s.ubigeo_id);
                });*/
                subProvincia1?.unsubscribe();
                //subDistrito1?.unsubscribe();

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

    handlerValueRemitente(s: EstablecimientoDTO | null): void{
        if(!s){
            this.resetRemitenteForm();
            return;
        }

        this.formGroup.patchValue({
            remitente_id: s.id,
            tipo_documento_remitente: 'RUC',
            numero_documento_remitente: s.ruc,
            razon_social_remitente: `${s.razon_social} (${s.descripcion})`,
            nombres_apellidos_remitente: s.razon_social,
            direccion_remitente: s.direccion,
            departamento_remitente: s.ubigeo_id.substring(0, 2)
        });
        this.provinciaRemitente!.valueEdit = s.ubigeo_id!.substring(0,4);
        const subProvincia1 = this.provinciaRemitente?.loading.subscribe(res => {
            this.formGroup.get('provincia_remitente')?.setValue(s.ubigeo_id.substring(0,4));
        });
        this.distritoRemitente!.valueEdit = s.ubigeo_id;
        const subDistrito1 = this.distritoRemitente?.loading.subscribe((res: any) => {
            this.formGroup.get('distrito_remitente')?.setValue(s.ubigeo_id);
        });
        subProvincia1?.unsubscribe();
        subDistrito1?.unsubscribe();
    }

    handlerValueDestinatario(s: EstablecimientoDTO | null): void{
        if(!s){
            this.resetDestinatarioForm();
            return;
        }

        this.formGroup.patchValue({
            destinatario_id: s.id,
            tipo_documento_destinatario: 'RUC',
            numero_documento_destinatario: s.ruc,
            razon_social_destinatario: `${s.razon_social} (${s.descripcion})`,
            nombres_apellidos_destinatario: s.razon_social,
            direccion_destinatario: s.direccion,
            departamento_destinatario: s.ubigeo_id.substring(0, 2)
        });
        this.provinciaDestinatario!.valueEdit = s.ubigeo_id!.substring(0,4);
        const subProvincia1 = this.provinciaDestinatario?.loading.subscribe(res => {
            this.formGroup.get('provincia_destinatario')?.setValue(s.ubigeo_id.substring(0,4));
        });
        this.distritoDestinatario!.valueEdit = s.ubigeo_id;
        const subDistrito1 = this.distritoDestinatario?.loading.subscribe((res: any) => {
            this.formGroup.get('distrito_destinatario')?.setValue(s.ubigeo_id);
        });
        subProvincia1?.unsubscribe();
        subDistrito1?.unsubscribe();
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

    resetDestinatarioForm(): void{
        this.formGroup.patchValue({
            destinatario_id: null,
            tipo_documento_destinatario: 'RUC',
            numero_documento_destinatario: null,
            razon_social_destinatario: null,
            nombres_apellidos_destinatario: null,
            direccion_destinatario: null,
            departamento_destinatario: null,
            provincia_destinatario: null,
            distrito_destinatario: null,
            contactos_destinatario: [],
        });
        //(this.formGroup.get('docs_ref') as FormArray).clear();
    }

    resetRemitenteForm(): void{
        this.formGroup.patchValue({
            remitente_id: null,
            tipo_documento_remitente: 'RUC',
            numero_documento_remitente: null,
            razon_social_remitente: null,
            nombres_apellidos_remitente: null,
            direccion_remitente: null,
            departamento_remitente: null,
            provincia_remitente: null,
            distrito_remitente: null,
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