import { CommonModule, formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

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
import { SelectDepartamentoComponent } from 'app/features/guia-remision/components/selects/select-departamento/select-departamento';
import { SelectProvinciaComponent } from 'app/features/guia-remision/components/selects/select-provincia/select-provincia';
import { SelectDistritoComponent } from 'app/features/guia-remision/components/selects/select-distrito/select-distrito';
import { TabOrigenDestinoComponent } from 'app/features/guia-remision/components/tabs/tab-origen-destino/tab-origen-destino';
import { SectionProductoListadoComponent } from 'app/features/guia-remision/components/sections/section-producto-listado/section-producto-listado';
import { TabDatosEnvioProveedorComponent } from 'app/features/guia-remision/components/tabs/tab-datos-envio-proveedor/tab-datos-envio-proveedor';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroQuestionMarkCircleSolid } from '@ng-icons/heroicons/solid';
import { TooltipModule } from 'primeng/tooltip';
import { MdlComprobanteReferenciaComponent } from 'app/features/guia-remision/components/modals/mdl-comprobante-referencia/mdl-comprobante-referencia';
import { DialogService } from 'primeng/dynamicdialog';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { MdlEditarComprobanteReferenciaComponent } from 'app/features/guia-remision/components/modals/mdl-editar-comprobante-referencia/mdl-editar-comprobante-referencia';
import { MessageModule } from 'primeng/message';
import { TableModule } from "primeng/table";
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CardModule } from 'primeng/card';
import { SelectEmpresaRemitenteComponent } from 'app/features/guia-remision/components/selects/select-empresa-remitente/select-empresa-remitente';
import { RemitenteByIdToGuia } from 'app/features/remitente/models/remitente';
import { GuiaSectionCabeceraComponent } from 'app/features/guia-remision/components/sections/guia-section-cabecera/guia-section-cabecera';
import { GR_ProductoRequestDto, GuiaRemisionRemitenteRequestDto } from 'app/features/guia-remision/models/guia-remision.model';
import { GuiaRemitenteApiService } from 'app/features/guia-remitente/services/guia-remitente-api.service';

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
    NgIcon,
    TooltipModule,
    MessageModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    CardModule,
    SelectEmpresaRemitenteComponent,
    GuiaSectionCabeceraComponent
],
  viewProviders: [provideIcons({ heroQuestionMarkCircleSolid })],
  providers: [DialogService, ConfirmationService]
})

export class GuiaRemisionComponent implements OnInit, AfterViewInit, OnDestroy{

    @ViewChild('selectEmpresaRemitente') selectEmpresaRemitente: SelectEmpresaRemitenteComponent | undefined;
    @ViewChild('tabDatosEnvioProveedor') tabDatosEnvioProveedor: TabDatosEnvioProveedorComponent | undefined;
    @ViewChild('tabOrigenDestino') tabOrigenDestino: TabOrigenDestinoComponent | undefined;
    @ViewChild('selectTipoGuia') selectTipoGuiaComponent: SelectTipoGuiaComponent | undefined;
    @ViewChild('sectionProductoListado') sectionProductoListadoComponent: SectionProductoListadoComponent | undefined;

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

    constructor(
        private formBuilder: FormBuilder,
        public dialogService: DialogService,
        private cdr: ChangeDetectorRef,
        private confirmationService: ConfirmationService,
        private api: GuiaRemitenteApiService
    ){
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
            contactos_remitente: new FormArray([]),


            tipo_documento_destinatario: new FormControl('RUC'),
            numero_documento_destinatario: new FormControl(null),
            razon_social_destinatario: new FormControl(null),
            nombres_apellidos_destinatario: new FormControl(null),
            direccion_destinatario: new FormControl(null),
            departamento_destinatario: new FormControl(null),
            provincia_destinatario: new FormControl(null),
            distrito_destinatario: new FormControl(null),
            contactos_destinatario: new FormArray([]),

            fecha_emision: new FormControl(new Date(), Validators.required),
            docs_ref: new FormArray([]),
        });

        this.formGroup.get('fecha_emision')?.setValue(new Date());
        
        this.formGroup.get('tipo_traslado')?.valueChanges.subscribe(value => {
            console.log('tipo traslado', value); 
        });

        this.formGroup.get('tipo_documento_remitente')?.valueChanges.subscribe((value: string) => { 
            this.formGroup.get('numero_documento_remitente')?.clearValidators();
            this.formGroup.get('razon_social_remitente')?.clearValidators();
            this.formGroup.get('nombres_apellidos_remitente')?.clearValidators();

            if(value === 'RUC'){
                this.formGroup.get('razon_social_remitente')?.setValidators(Validators.required);
            }else{
                console.log('dd');
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

        this.firstContactRemitente();
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

    get destinatarioContactos(): FormArray {
      return this.formGroup.get('contactos_destinatario') as FormArray; 
    }

    get request(): GuiaRemisionRemitenteRequestDto{
console.log(this.tabDatosEnvioProveedor?.data.datosEnvio.conductores);

        return {
            tipo_transporte: this.tabDatosEnvioProveedor?.data.tipo_transporte ?? 'PRIVADO',
            tipo_traslado: this.f.tipo_traslado.value,
            fecha: formatDate(this.f.fecha_emision.value, 'yyyy-MM-dd', 'en-US'),
            hora: formatDate(this.f.fecha_emision.value, 'HH:mm:ss', 'en-US'),
            observacion: this.sectionProductoListadoComponent?.getFormData.description ?? '',
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
                ruc: this.f.numero_documento_remitente.value,
                descripcion: this.f.razon_social_remitente.value,
                ubigeo_id: this.f.distrito_remitente.value,
                direccion: this.f.direccion_remitente.value,
                email: "yosel1989@gmail.com",
                pais: "PE",
                empleado_id_creacion: 1,
                empleado_nombre_creacion: "SA"
            },

            destinatario: {
                tipo_documento: this.f.tipo_documento_destinatario.value,
                numero_documento: this.f.numero_documento_destinatario.value,
                razon_social: this.f.tipo_documento_destinatario.value === 'RUC' ? this.f.razon_social_destinatario.value : this.f.nombres_apellidos_destinatario.value,
                ubigeo_id: this.f.distrito_destinatario.value,
                direccion: this.f.direccion_destinatario.value,
                pais: "PE",
                empleado_id_creacion: 1,
                empleado_nombre_creacion: "SA",
                email_destinatario: this.destinatarioContactos.length ? (this.destinatarioContactos as FormArray).controls.map((element: any) => {
                    return {
                        email: element.get('email')?.value
                    };
                }) : null,
            },

            proveedor: this.f.tipo_traslado.value !== "COMPRA" ? null : {
                tipo_documento: this.tabDatosEnvioProveedor?.data.proveedor.tipo_documento_proveedor,
                numero_documento: this.tabDatosEnvioProveedor?.data.proveedor.numero_documento_proveedor,
                razon_social: this.tabDatosEnvioProveedor?.data.proveedor.nombre_rsocial_proveedor,
                ubigeo_id: this.tabDatosEnvioProveedor?.data.proveedor.idDistrito,
                direccion: this.tabDatosEnvioProveedor?.data.proveedor.direccion_proveedor,
                email: "sistemas4@carolina-peru.com",
                pais: "PE",
                empleado_id_creacion: 1,
                empleado_nombre_creacion: "SA"
            },

            datos_envio: {

                motivo_envio: this.tabDatosEnvioProveedor?.data.datosEnvio.tipo_transporte,
                fecha_envio: formatDate(this.tabDatosEnvioProveedor?.data.datosEnvio.fecha_inicio_traslado, 'yyyy-MM-dd', 'en-US'),
                peso_bruto: this.tabDatosEnvioProveedor?.data.datosEnvio.peso_bruto_total,
                codigo_um: this.tabDatosEnvioProveedor?.data.datosEnvio.unidad_peso_bruto,
                ruc_empresa_currier: this.tabDatosEnvioProveedor?.data.datosEnvio.ruc_subcontratador,
                razon_social_currier: this.tabDatosEnvioProveedor?.data.datosEnvio.nombre_rsocial_subcontratador,
                registro_mtc_currier: this.tabDatosEnvioProveedor?.data.datosEnvio.num_mtc_transportista,

                conductor: this.tabDatosEnvioProveedor?.data.datosEnvio.conductores.length ? this.tabDatosEnvioProveedor?.data.datosEnvio.conductores.map((d: any) => {
                    return {
                        tipo_documento: d.tipo_documento_conductor,
                        numero_documento: d.numero_documento_conductor,
                        nombres: d.nombre_conductor,
                        apellidos: d.apellido_conductor,
                        cargo: "CONDUCTOR",
                        licencia: d.numero_licencia_brevete_conductor,
                        empleado_id_creacion: 1,
                        empleado_nombre_creacion: "SA"
                    };
                }) : null,


                unidad_transporte: this.tabDatosEnvioProveedor?.data.datosEnvio.vehiculos.length ? this.tabDatosEnvioProveedor?.data.datosEnvio.vehiculos.map((d: any) => {
                    return {
                        descripcion: null,
                        marca: null,
                        modelo: null,
                        placa: d.placa_vehiculo,
                        numero_registro_mtc: null,
                        tarjeta: null,
                        empleado_id_creacion: 1,
                        empleado_nombre_creacion: "SA"
                    };
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

        console.log(this.request);

        this.loadingSubmit.next(true);
        this.api.saveRemisionRemitente(this.request, this.selectEmpresaRemitente?.selected?.ruc! ).subscribe(res => {
            console.log(res);
            this.loadingSubmit.next(false);
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

    evtAddContactRemitente(): void{
        if(this.f.contactos_remitente.invalid || this.contactosEmisorhasEmpty()) return;
        const row = this.newContact();
        this.remitenteContactos.push(row);
        this.cdr.markForCheck(); 
    }

    evtRemoveContactRemitente(index: number): void{
        this.remitenteContactos.removeAt(index);
        this.cdr.markForCheck();
    }

    evtAddContactDestinatario(): void{
        if(this.f.contactos_destinatario.invalid || this.contactosDestinatariohasEmpty()) return;
        const row = this.newContact();
        this.destinatarioContactos.push(row);
        this.cdr.markForCheck(); 
    }

    evtRemoveContactDestinatario(index: number): void{
        this.destinatarioContactos.removeAt(index);
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

    firstContactRemitente(): void{
        this.remitenteContactos.push(this.newContact());
    }

    firstContactDestinatario(): void{
        this.remitenteContactos.push(this.newContact());
    }

    contactosEmisorhasEmpty(): boolean{
        // recorrer los contactos y validar si todos los controles tienen valor
        for(let i = 0; i < this.remitenteContactos.length; i++){
            const fg = this.remitenteContactos.at(i) as FormGroup;
            if(!fg.value.email) return true;
        }

        return false;
    }

    contactosDestinatariohasEmpty(): boolean{
        // recorrer los contactos y validar si todos los controles tienen valor
        for(let i = 0; i < this.destinatarioContactos.length; i++){
            const fg = this.destinatarioContactos.at(i) as FormGroup;
            if(!fg.value.email) return true;
        }

        return false;
    }

}