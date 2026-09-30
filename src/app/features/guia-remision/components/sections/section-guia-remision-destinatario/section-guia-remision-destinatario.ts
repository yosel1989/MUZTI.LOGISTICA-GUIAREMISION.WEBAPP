import { Component, computed, DestroyRef, effect, inject, input, signal } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";

import { provideIcons } from "@ng-icons/core";
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';

import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MdlHeader } from "@core/components/modals/headers/mdl-header/mdl-header";
import { SunatMotivoTrasladoDto } from "@features/catalogo/models/sunat-catalogo.model";
import { MdlEntityList } from "@features/entity/components/modals/mdl-entity-list/mdl-entity-list";
import { EntityBySerieAssigned_EntityDto, EntityDto } from "@features/entity/models/entity";
import { SunatMotivoTrasladoEnum } from "@features/guia-remision/enums/guia-remision.enum";
import { TypingComponent } from "@features/shared/components/typing/typing";
import { tablerAlertCircle } from "@ng-icons/tabler-icons";
import { AlertService } from "app/core/services/alert.service";
import { AccordionModule } from 'primeng/accordion';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogService } from "primeng/dynamicdialog";
import { FieldsetModule } from "primeng/fieldset";
import { MessageModule } from "primeng/message";
import { TooltipModule } from "primeng/tooltip";

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

export class SectionGuiaRemisionDestinatario{
    messageService = inject(MessageService);
    private alertService = inject(AlertService);
    dialogService = inject(DialogService);
    destroyRef = inject(DestroyRef);

    entitySender = input<EntityDto | EntityBySerieAssigned_EntityDto | undefined>(undefined);
    selected = signal<EntityDto | undefined>(undefined);
    motivoTraslado = input.required<SunatMotivoTrasladoDto | undefined>(); 
    entity = input<EntityDto | EntityBySerieAssigned_EntityDto | undefined>(); 

    submitted = signal(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modalRef: any | undefined;
    enumReasonOfTransfer = SunatMotivoTrasladoEnum;

    private readonly MOTIVOS_DESTINATARIO_ES_REMITENTE = [this.enumReasonOfTransfer.compra, this.enumReasonOfTransfer.traslado_establecimientos_misma_empresa, this.enumReasonOfTransfer.recojo_bienes_transformados];

    onlyId = computed(() => {
        const codigo = this.motivoTraslado()?.codigo_sunat;
        if (codigo && this.MOTIVOS_DESTINATARIO_ES_REMITENTE.includes(codigo)) {
            return this.entitySender()?.id;
        }
        return null;
    });
    
    constructor(){
        effect(() =>{
            this.motivoTraslado();
            this.fncReset();
        })
    }
  
    get invalid(): boolean{
        return !this.selected();
    }

    get valid(): boolean {
        return !!this.selected();
    }
    
    // Events

    evtOnSubmit(): boolean {
        this.submitted.set(true);

        if(!this.entitySender()){
            this.alertService.warning("Debe seleccionar el emisor.");
            return false;
        }

        if(!this.selected()){
            this.alertService.warning("Debe seleccionar el destinatario / cliente.");
            return false;
        }

        return true;
    }

    evtOnShowList(): void{
        
        if(!this.motivoTraslado()){
            this.alertService.warning(`Debe seleccionar el motivo de traslado`);
            return;
        }

        if(!this.entitySender()){
            this.alertService.warning(`Debe seleccionar el emisor`);
            return;
        }

        this.modalRef = this.dialogService.open(MdlEntityList, {
            width: '700px',
            closable: false,
            draggable: false,
            modal: true,
            position: 'top',
            header: 'Seleccionar destinatario / cliente ',
            styleClass: 'max-h-none! slide-down-dialog',
            maskStyleClass: 'py-4',
            appendTo: 'body',
            templates: {
                header: MdlHeader
            },
            inputValues: {
                _hasBranch: true,
                _onlyId: this.onlyId()
            }
        });

        this.modalRef?.onChildComponentLoaded
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((childComponent: MdlEntityList) => {
            childComponent.OnSelected
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((entity: EntityDto) => {
                this.selected.set(entity);
                this.alertService.success('Destinatario seleccionado con éxito.');
                this.modalRef?.close();
            });
            childComponent.OnClose
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.modalRef?.close();
            });
        });
    }

    evtRemove(): void{
        this.selected.set(undefined);
    }

    // Functions

    fncReset(): void{
        this.selected.set(undefined);
    }

}