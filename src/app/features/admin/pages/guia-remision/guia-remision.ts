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
import { Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { MdlEditarComprobanteReferenciaComponent } from 'app/features/guia-remision/components/modals/mdl-editar-comprobante-referencia/mdl-editar-comprobante-referencia';

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
    TooltipModule
  ],
  viewProviders: [provideIcons({ heroQuestionMarkCircleSolid })],
  providers: [DialogService, ConfirmationService]
})

export class GuiaRemisionComponent implements OnInit, AfterViewInit, OnDestroy{

    @ViewChild('tabDatosEnvioProveedor') tabDatosEnvioProveedor: TabDatosEnvioProveedorComponent | undefined;
    @ViewChild('tabOrigenDestino') tabOrigenDestino: TabOrigenDestinoComponent | undefined;
    @ViewChild('selectTipoGuia') selectTipoGuiaComponent: SelectTipoGuiaComponent | undefined;
    @ViewChild('sectionProductoListado') sectionProductoListadoComponent: SectionProductoListadoComponent | undefined;

    tipoGuia = TipoGuiaRemisionEnum;

    // Datos formulario
    formGroup: FormGroup = new FormGroup({});
    submitted: boolean = false;

    today: Date = new Date();
    last: Date = new Date(this.today.getFullYear(), this.today.getMonth(), (this.today.getDate()-1));

    modalRef: any | undefined;
    private subs = new Subscription();

    constructor(
        private formBuilder: FormBuilder,
        public dialogService: DialogService,
        private cdr: ChangeDetectorRef,
        private confirmationService: ConfirmationService,
    ){
        this.formGroup = this.formBuilder.group({
            tipo_traslado: new FormControl(GuiaRemisionTipoTrasladoEnum.venta, Validators.required),
            tipo_documento: new FormControl({value: 'DNI', disabled: true}),
            departamento: new FormControl(null),
            provincia: new FormControl(null),
            distrito: new FormControl(null),

            fecha_emision: new FormControl(new Date(), Validators.required),
            docs_ref: new FormArray([]),
        });

        this.formGroup.get('fecha_emision')?.setValue(new Date());
        
        this.formGroup.get('tipo_traslado')?.valueChanges.subscribe(value => {
            console.log('tipo traslado', value); 
        });
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

    /*get request(): GuiaRemisionRequestDto{
        return {
            tipo_transporte: this.tabDatosEnvioProveedor?.data.tipo_transporte ?? 'PRIVADO',
            tipo_traslado: this.f.tipo_traslado.value,
            fecha: formatDate(this.f.fecha_emision.value, 'yyyy-MM-dd', 'en-US'),
            hora: formatDate(this.f.fecha_emision.value, 'HH:mm:ss', 'en-US'),
            observacion: this.sectionProductoListadoComponent?.getFormData.description ?? '',

            tipo_doc_ref: this.f.

            motivo: this.f.tipo_documento.value,
            departamento: this.f.departamento.value,
            provincia: this.f.provincia.value,
            distrito: this.f.distrito.value,
            fecha_emision: this.f.fecha_emision.value,

            origen: this.tabOrigenDestino!.getFormData.origen,
            destino: [this.tabOrigenDestino!.getFormData.destino],
            productos: this.sectionProductoListadoComponent?.getFormData.items ?? [],
        }
    }*/

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

        if(this.sectionProductoListadoComponent?.invalid){}

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

}