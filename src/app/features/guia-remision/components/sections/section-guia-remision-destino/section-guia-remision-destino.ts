import { Component, computed, DestroyRef, inject, input, signal} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";

import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { provideIcons } from "@ng-icons/core";

import { tablerAlertCircle } from "@ng-icons/tabler-icons";
import { ConfirmationService, MessageService } from 'primeng/api';
import { MessageModule } from "primeng/message";
import { AlertService } from "app/core/services/alert.service";
import { TypingComponent } from "@features/shared/components/typing/typing";
import { AccordionModule } from 'primeng/accordion';
import { FieldsetModule } from "primeng/fieldset";
import { EntityBranchDto, EntityBranchListToModalDTO } from "@features/entity-branch/models/entity-branch";
import { EntityBySerieAssigned_EntityDto, EntityDto } from "@features/entity/models/entity";
import { DialogService } from "primeng/dynamicdialog";
import { MdlEntityBranchListSelect } from "@features/entity-branch/components/modals/mdl-entity-branch-list-select/mdl-entity-branch-list-select";
import { MdlHeader } from "@core/components/modals/headers/mdl-header/mdl-header";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { EntityBranchApiService } from "@features/entity-branch/services/entity-branch-api-service";
import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandlerService } from "@core/handlers/error-handler.service";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { SunatMotivoTrasladoDto } from "@features/catalogo/models/sunat-catalogo.model";
import { SunatMotivoTrasladoEnum } from "@features/guia-remision/enums/guia-remision.enum";

@Component({
  selector: 'app-section-guia-remision-destino',
  templateUrl: './section-guia-remision-destino.html',
  styleUrl: './section-guia-remision-destino.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TabsModule,
    InputTextModule,
    CardModule,
    MessageModule,
    TypingComponent,
    AccordionModule,
    FieldsetModule,
    ButtonModule,
    ConfirmDialogModule
  ],
  viewProviders: [provideIcons({ tablerAlertCircle })],
  providers: [ConfirmationService, MessageService]
})

export class SectionGuiaRemisionDestino {
    messageService = inject(MessageService);
    alertService = inject(AlertService);
    dialogService = inject(DialogService);
    destroyRef = inject(DestroyRef);
    api = inject(EntityBranchApiService);
    errorHandler = inject(ErrorHandlerService);

    entitySender = input<EntityDto | EntityBySerieAssigned_EntityDto | undefined>(undefined);
    entityReceiver = input<EntityDto | undefined>(undefined);
    selected = signal<EntityBranchDto | undefined>(undefined);
    motivoTraslado = input.required<SunatMotivoTrasladoDto | undefined>();

    submitted = signal(false);
    
    enumReasonOfTransfer = SunatMotivoTrasladoEnum;
    private readonly MOTIVOS_DESTINATARIO_ES_REMITENTE = [this.enumReasonOfTransfer.compra, this.enumReasonOfTransfer.traslado_establecimientos_misma_empresa, this.enumReasonOfTransfer.recojo_bienes_transformados];

    onlyId = computed(() => {
        const codigo = this.motivoTraslado()?.codigo_sunat;
        if (codigo && this.MOTIVOS_DESTINATARIO_ES_REMITENTE.includes(codigo)) {
            return this.entitySender()?.id.toString();
        }
        return this.entityReceiver()?.id.toString();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: any | undefined;

    get invalid(): boolean{
        return !this.selected();
    }

    get valid(): boolean {
        return !!this.selected();
    }


    // Events

    evtOnSubmit(): boolean {
        this.submitted.set(true);

        if(!this.entityReceiver()){
            this.alertService.warning("Tiene que seleccionar la entidad destinataria o cliente");
            return false;
        }

        return true;
    }

    evtShowList(): void{

        if(!this.entitySender()){
            this.alertService.warning("Tiene que seleccionar la entidad emisora");
            return;
        }

        if(!this.entityReceiver()){
            this.alertService.warning("Tiene que seleccionar la entidad destinataria o cliente");
            return;
        }

        

        this.ref = this.dialogService.open(MdlEntityBranchListSelect,  {
            width: '700px',
            closable: false,
            draggable: false,
            modal: true,
            position: 'top',
            header: 'Seleccionar destino',
            styleClass: 'max-h-none! slide-down-dialog',
            maskStyleClass: 'overflow-y-auto py-4',
            appendTo: 'body',
            templates: {
                header: MdlHeader
            },
            inputValues: {
                _onlyIdsEntity: this.onlyId()
            }
        });

        this.ref.onChildComponentLoaded
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((cmp: MdlEntityBranchListSelect) => {
            
            cmp?.OnSelected
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((value: EntityBranchListToModalDTO) => {
            this.handlerSelectedEntityBranch(value);
            this.ref?.close();
            });
            
            cmp?.OnClose
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
            this.ref?.close();
            });
        });

    }

    evtRemove(): void{
        this.selected.set(undefined);
    }

    // Handlers

    handlerSelectedEntityBranch(data: EntityBranchListToModalDTO): void{
        this.api.getById(data.id)
            .pipe(
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: (value: EntityBranchDto) => {
                    this.selected.set(value);
                },
                error: (err: HttpErrorResponse) => {
                    this.errorHandler.handle(err);
                },
            })
    }

}