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
import { AccordionModule } from 'primeng/accordion';
import { TypingComponent } from "@features/shared/components/typing/typing";
import { FieldsetModule } from "primeng/fieldset";
import { EntityBranchDto, EntityBranchListToModalDTO } from "@features/entity-branch/models/entity-branch";
import { EntityBySerieAssigned_EntityDto, EntityDto } from "@features/entity/models/entity";
import { SunatMotivoTrasladoDto } from "@features/catalogo/models/sunat-catalogo.model";
import { SunatMotivoTrasladoEnum } from "@features/guia-remision/enums/guia-remision.enum";
import { DialogService } from "primeng/dynamicdialog";
import { EntityBranchApiService } from "@features/entity-branch/services/entity-branch-api-service";
import { ErrorHandlerService } from "@core/handlers/error-handler.service";
import { MdlEntityBranchListSelect } from "@features/entity-branch/components/modals/mdl-entity-branch-list-select/mdl-entity-branch-list-select";
import { MdlHeader } from "@core/components/modals/headers/mdl-header/mdl-header";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { HttpErrorResponse } from "@angular/common/http";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";

@Component({
  selector: 'app-section-guia-remision-origen',
  templateUrl: './section-guia-remision-origen.html',
  styleUrl: './section-guia-remision-origen.scss',
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
    ConfirmDialogModule
  ],
  viewProviders: [provideIcons({ tablerAlertCircle })],
  providers: [ConfirmationService, MessageService]
})

export class SectionGuiaRemisionOrigen {
    messageService = inject(MessageService);
    alertService = inject(AlertService);
    dialogService = inject(DialogService);
    destroyRef = inject(DestroyRef);
    api = inject(EntityBranchApiService);
    errorHandler = inject(ErrorHandlerService);
  
    entitySender = input<EntityDto | EntityBySerieAssigned_EntityDto | undefined>(undefined);
    entityReceiver = input<EntityDto | undefined>(undefined);
    motivoTraslado = input.required<SunatMotivoTrasladoDto | undefined>();
    
    selected = signal<EntityBranchDto | undefined>(undefined);
    submitted = signal(false);

    enumReasonOfTransfer = SunatMotivoTrasladoEnum;
    private readonly MOTIVOS_ORIGEN_ES_DESTINATARIO = [
        this.enumReasonOfTransfer.compra,
        this.enumReasonOfTransfer.recojo_bienes_transformados,
    ];

    private readonly MOTIVOS_ORIGEN_ABIERTO = [
        this.enumReasonOfTransfer.devolucion,
        this.enumReasonOfTransfer.importacion,
        this.enumReasonOfTransfer.otros,
    ];

    originOnlyIds = computed<string[] | null>(() => {
        const codigo = this.motivoTraslado()?.codigo_sunat;
        const senderId = this.entitySender()?.id.toString();
        const receiverId = this.entityReceiver()?.id.toString();

        if (!codigo) return senderId ? [senderId] : null;

        if (this.MOTIVOS_ORIGEN_ES_DESTINATARIO.includes(codigo)) {
            return receiverId ? [receiverId] : null;
        }

        if (this.MOTIVOS_ORIGEN_ABIERTO.includes(codigo)) {
            return null; // o [senderId, receiverId].filter(Boolean) si no quieres direcciones libres
        }

        // Por defecto el origen es siempre el emisor
        return senderId ? [senderId] : null;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: any | undefined;

    get invalid(): boolean{
        return !this.selected();
    }

    get valid(): boolean {
        return !!this.selected();
    }

    evtOnSubmit(): boolean {
        this.submitted.set(true);

        if(!this.entitySender()){
            this.alertService.warning("Tiene que seleccionar la entidad emisora");
            return false;
        }

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
                _onlyIdsEntity: this.originOnlyIds()?.join(",")
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