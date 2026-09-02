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
import { GR_OrigenRequestDto } from "@features/guia-remision/models/guia-remision.model";
import { DialogService } from "primeng/dynamicdialog";
import { MdlListadoEstablecimientoComponent } from "@features/establecimiento/components/modals/mdl-listado-establecimiento/mdl-listado-establecimiento";
import { MdlHeader } from "@core/components/modals/headers/mdl-header/mdl-header";
import { SunatMotivoTrasladoDto } from "@features/catalogo/models/sunat-catalogo.model";
import { EmpresaToSelectDto } from "@features/empresa/models/empresa.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { EntityBranchDto } from "@features/establecimiento/models/entity-branch";

@Component({
  selector: 'app-section-guia-remision-remitente',
  templateUrl: './section-guia-remision-remitente.html',
  styleUrl: './section-guia-remision-remitente.scss',
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

export class SectionGuiaRemisionRemitente {
    messageService = inject(MessageService);
    private alertService = inject(AlertService);
    dialogService = inject(DialogService);
    destroyRef = inject(DestroyRef);
    
    private _remitente = signal<EntityBranchDto | undefined>(undefined);
    @Input() set remitente(value: EntityBranchDto | undefined) {
        if (this._remitente() !== value) {
            this._remitente.set(value);
        }
    }
    selected = signal<EntityBranchDto | undefined>(undefined);
    motivoTraslado = input.required<SunatMotivoTrasladoDto | undefined>();
    empresa = input.required<EmpresaToSelectDto | undefined>(); 

    submitted = signal(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modalRef: any | undefined;
  
    get invalid(): boolean{
        return this.selected() === undefined;
    }

    get getFormData(): GR_OrigenRequestDto {
        return {
            ubigeo_id: this.remitente!.ubigeo_id,
            direccion: this.remitente!.address,
            pais: this.remitente!.pais,
        }
    }
    
    get remitente(): EntityBranchDto | null {
        return this._remitente() ?? null;
    }

    // Events

    evtOnSubmit(): boolean {
        this.submitted.set(true);

        if(!this.remitente){
            this.alertService.showToast({
                position: 'top-end',
                icon: "warning",
                title: "Se tiene que completar los datos obligatorios en la sección de punto de partida.",
                showCloseButton: true,
                timerProgressBar: true,
                timer: 4000
            });
            return false;
        }

        return true;
    }

    evtOnShowEstablecimiento( to: string ): void{
    
        if(!this.motivoTraslado){
            this.alertService.showToast({
                icon: 'warning',
                title: `Debe seleccionar el motivo de traslado`
            });
            return;
        }

        this.modalRef = this.dialogService.open( MdlListadoEstablecimientoComponent, {
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
                motivoTraslado: this.motivoTraslado,
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
            .subscribe(( s: EntityBranchDto) => {
                this.selected.set(s);
                this._remitente.set(s);
                this.modalRef?.close();
                this.alertService.showToast({
                    icon: 'success',
                    title: 'Remitente seleccionado con éxito.',
                    timer: 999999999,
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
        this.selected.set(undefined);
        this._remitente.set(undefined);
    }

}