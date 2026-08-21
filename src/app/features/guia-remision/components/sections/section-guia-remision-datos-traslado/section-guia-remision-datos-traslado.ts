import { Component, DestroyRef, inject, Input, OnInit, signal} from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";

import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { provideIcons } from "@ng-icons/core";

import { tablerAlertCircle } from "@ng-icons/tabler-icons";
import { ConfirmationService, MessageService } from 'primeng/api';
import { MessageModule } from "primeng/message";
import { AlertService } from "app/core/services/alert.service";
import { AccordionModule } from 'primeng/accordion';
import { FieldsetModule } from "primeng/fieldset";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogService } from 'primeng/dynamicdialog';
import { EnumPagadorFlete } from "@features/guia-remision/enums/pagador-flete.enum";
import { DatePickerModule } from "primeng/datepicker";
import { SelectUnidadMedidaComponent } from "@features/catalogo/components/selects/select-unidad-medida/select-unidad-medida";
import { InputNumberModule } from "primeng/inputnumber";
import { TooltipModule } from "primeng/tooltip";
import { SelectGuiaRemisionIndicadorTraslado } from "@features/guia-remision-indicador-traslado/components/selects/select-guia-remision-indicador-traslado/select-guia-remision-indicador-traslado";

@Component({
  selector: 'app-section-guia-remision-datos-traslado',
  templateUrl: './section-guia-remision-datos-traslado.html',
  styleUrl: './section-guia-remision-datos-traslado.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TabsModule,
    InputTextModule,
    CardModule,
    MessageModule,
    AccordionModule,
    FieldsetModule,
    ButtonModule,
    ConfirmDialogModule,
    DatePickerModule,
    SelectUnidadMedidaComponent,
    InputNumberModule,
    TooltipModule,
    SelectGuiaRemisionIndicadorTraslado 
  ],
  viewProviders: [provideIcons({ tablerAlertCircle })],
  providers: [ConfirmationService, MessageService]
})

export class SectionGuiaRemisionDatosTraslado implements OnInit{
    destroyRef = inject(DestroyRef);
    messageService = inject(MessageService);
    alertService = inject(AlertService);
    confirmationService = inject(ConfirmationService);
    dialogService = inject(DialogService);

    frm: FormGroup = new FormGroup({});

    private _tipoTransporte = signal<'PRIVADO' | 'PUBLICO'>('PRIVADO');
    @Input() set tipoTransporte(value: 'PRIVADO' | 'PUBLICO' | undefined) {
        this.frm?.get('fecha_entrega_transportista')?.setValue(null);
        this.frm?.get('fecha_entrega_transportista')?.clearValidators();

        if (value !== undefined && this._tipoTransporte() !== value) {
            this._tipoTransporte.set(value);
        }else{
            this._tipoTransporte.set('PRIVADO');
        }
    }

    messageError = signal<string | undefined>(undefined);

    submitted = signal(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modalRef: any | undefined;

    minFechaEntregaTraslado = new Date();
    
    ngOnInit(): void {
        this.frm = new FormGroup({
          fecha_inicio_traslado: new FormControl(new Date(), Validators.required),
          fecha_entrega_transportista: new FormControl(null),
          descripcion_traslado: new FormControl(null),
          unidad_medida_id: new FormControl(5, Validators.required),
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

          traslado_vehiculo_categoria: new FormControl(false),
          traslado_vehiculo_categoria_placa_vehiculo: new FormControl(null),

          cod_puerto: new FormControl(null),
          cod_aeropuerto: new FormControl(null),

          indic_registrar_vehiculos_conductores: new FormControl(false),

          cod_establecimiento_origen: new FormControl({value: null, disabled: true}, [Validators.minLength(4), Validators.maxLength(4)]),
          ruc_establecimiento_origen: new FormControl({value: null, disabled: true}),
          cod_establecimiento_destino: new FormControl({value: null, disabled: true}, [Validators.minLength(4), Validators.maxLength(4)]),
          ruc_establecimiento_destino: new FormControl({value: null, disabled: true}),

          num_autoriza_especial_adicional: new FormControl(null),
          ent_emisora_especial_adicional: new FormControl(null),

          indic_retorno_vehiculo_envase_vacio_adicional: new FormControl(false),
          indic_transbordo_programado_adicional: new FormControl(false),
          indic_retorno_vehiculo_vacio_adicional: new FormControl(false),

          indic_envio_sunat: new FormControl(null)

        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get f(): any {
        return this.frm?.controls;
    }


    get getFormData(): [] | null {
        return [];
    }

    get invalid(): boolean {
        return this.frm?.invalid ?? false;
    }

    get tipoTransporte(): 'PRIVADO' | 'PUBLICO' {
        return this._tipoTransporte();
    }

    // Events

    evtOnSubmit(): boolean {
        this.submitted.set(true);

        if(this.invalid){
            this.alertService.showToast({
                position: 'top-end',
                icon: "warning",
                title: 'Debe seleccionar el proveedor',
                showCloseButton: true,
                timerProgressBar: true,
                timer: 4000,
                target: 'body'
            });
            return false;
        }
        return true;
    }


    // Handlers

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