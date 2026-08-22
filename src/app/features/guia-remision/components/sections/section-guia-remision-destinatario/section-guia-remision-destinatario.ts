import { Component, DestroyRef, inject, input, Input, signal} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";

import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { provideIcons } from "@ng-icons/core";

import { tablerAlertCircle } from "@ng-icons/tabler-icons";
import { ConfirmationService, MessageService } from 'primeng/api';
import { MessageModule } from "primeng/message";
import { AlertService } from "app/core/services/alert.service";
import { AccordionModule } from 'primeng/accordion';
import { TypingComponent } from "@features/shared/components/typing/typing";
import { FieldsetModule } from "primeng/fieldset";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { TooltipModule } from "primeng/tooltip";
import { EstablecimientoDTO } from "@features/establecimiento/models/establecimiento.model";
import { GR_DestinoRequestDto, GR_OrigenRequestDto } from "@features/guia-remision/models/guia-remision.model";
import { DialogService } from "primeng/dynamicdialog";
import { MdlListadoEstablecimientoComponent } from "@features/establecimiento/components/modals/mdl-listado-establecimiento/mdl-listado-establecimiento";
import { MdlHeader } from "@core/components/modals/headers/mdl-header/mdl-header";
import { SunatMotivoTrasladoDto } from "@features/catalogo/models/sunat-catalogo.model";
import { EmpresaToSelectDto } from "@features/empresa/models/empresa.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-section-guia-remision-destinatario',
  templateUrl: './section-guia-remision-destinatario.html',
  styleUrl: './section-guia-remision-destinatario.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TabsModule,
    InputTextModule,
    CardModule,
    MessageModule,
    AccordionModule,
    TypingComponent,
    FieldsetModule,
    ButtonModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  viewProviders: [provideIcons({ tablerAlertCircle })],
  providers: [ConfirmationService, MessageService]
})

export class SectionGuiaRemisionDestinatario {
    messageService = inject(MessageService);
    private alertService = inject(AlertService);
    dialogService = inject(DialogService);
    destroyRef = inject(DestroyRef);

    private _remitente = signal<EstablecimientoDTO | undefined>(undefined);
    @Input() set remitente(value: EstablecimientoDTO | undefined) {
        if (this._remitente() !== value) {
            this._remitente.set(value);
        }
    }
    
    private _destinatario = signal<EstablecimientoDTO | undefined>(undefined);
    @Input() set destinatario(value: EstablecimientoDTO | undefined) {
        if (this._destinatario() !== value) {
            this._destinatario.set(value);
        }
    }
    
    motivoTraslado = input.required<SunatMotivoTrasladoDto | undefined>();
    empresa = input.required<EmpresaToSelectDto | undefined>(); 

    submitted = signal(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modalRef: any | undefined;
  
    get invalid(): boolean{
        return !this.destinatario;
    }

    get valid(): boolean {
        return !!this.destinatario;
    }
    
    
    get getFormData(): GR_DestinoRequestDto {
        return {
            ubigeo_id: this.destinatario!.ubigeo_id,
            direccion: this.destinatario!.direccion,
            pais: this.destinatario!.pais,
        }
    }
    
    get destinatario(): EstablecimientoDTO | null {
        return this._destinatario() ?? null;
    }

    get remitente(): EstablecimientoDTO | null {
        return this._remitente() ?? null;
    }

    // Events

    evtOnSubmit(): boolean {
        this.submitted.set(true);

        if(!this.remitente){
            this.alertService.showToast({
                position: 'top-end',
                icon: "warning",
                title: "Se tiene que completar los datos obligatorios en la sección de punto de origen.",
                showCloseButton: true,
                timerProgressBar: true,
                timer: 4000
            });
            return false;
        }

        if(!this.destinatario){
            this.alertService.showToast({
                position: 'top-end',
                icon: "warning",
                title: "Se tiene que completar los datos obligatorios en la sección de punto de destino.",
                showCloseButton: true,
                timerProgressBar: true,
                timer: 4000
            });
            return false;
        }

        return true;
    }

    evtOnShowEstablecimiento( to: string ): void{
        
        if(!this.motivoTraslado()){
            this.alertService.showToast({
                icon: 'warning',
                title: `Debe seleccionar el motivo de traslado`
            });
            return;
        }

        if(!this.remitente){
            this.alertService.showToast({
                icon: 'warning',
                title: `Debe seleccionar un remitente`
            });
            return;
        }

        this.modalRef = this.dialogService.open(MdlListadoEstablecimientoComponent, {
            width: '700px',
            keepInViewport: false,
            closable: false,
            modal: true,
            draggable: false,
            position: 'top',
            header: `Lista de establecimientos registrados`,
            styleClass: 'max-h-none! slide-down-dialog',
            maskStyleClass: 'overflow-y-auto py-4',
            contentStyle: {
                'padding': "0 !important"
            },
            appendTo: 'body',
            inputValues: {
                ruc: this.empresa()?.ruc,
                tipo: to,
                motivoTraslado: this.motivoTraslado(),
                remitente: this.remitente
            },
            templates: {
                header: MdlHeader
            }
        });


        this.modalRef.onChildComponentLoaded
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((cmp: MdlListadoEstablecimientoComponent) => {
            cmp?.OnSelected
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(( s: EstablecimientoDTO) => {
                this._destinatario.set(s);
                this.modalRef?.close();
                this.alertService.showToast({
                    icon: 'success',
                    title: 'Destinatario seleccionado con éxito.',
                    timer: 4000,
                    showCloseButton: true
                });
            });

            cmp?.OnClose
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.modalRef?.close();
            });
        });

    }

    evtRemove(): void{
        this._destinatario.set(undefined);
    }

}