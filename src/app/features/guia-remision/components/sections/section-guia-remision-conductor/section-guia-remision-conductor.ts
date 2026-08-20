import { Component, computed, DestroyRef, inject, Input, signal} from "@angular/core";
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
import { ConductorDto } from "@features/conductor/models/conductor.model";
import { FieldsetModule } from "primeng/fieldset";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogService } from 'primeng/dynamicdialog';
import { MdlListaConductorComponent } from "@features/conductor/components/modals/mdl-lista-conductor/mdl-lista-conductor";
import { MdlHeader } from "@core/components/modals/headers/mdl-header/mdl-header";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: 'app-section-guia-remision-conductor',
  templateUrl: './section-guia-remision-conductor.html',
  styleUrl: './section-guia-remision-conductor.scss',
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

export class SectionGuiaRemisionConductor {
    destroyRef = inject(DestroyRef);
    messageService = inject(MessageService);
    alertService = inject(AlertService);
    confirmationService = inject(ConfirmationService);
    dialogService = inject(DialogService);

    private _conductores = signal<ConductorDto[] | undefined>(undefined);
    @Input() set conductores(value: ConductorDto[] | undefined) {
        if (value !== undefined && this._conductores() !== value) {
            this._conductores.set(value);
        }else{
            this._conductores.set([]);
        }
    }

    submitted = signal(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modalRef: any | undefined;

    invalid = computed(() => {
        const conductores = this._conductores();
        if (!conductores || conductores.length === 0) {
            return 'Debe seleccionar al menos un conductor.';
        }
        if (!conductores.find(x => x.job_title === 'Principal')) {
            return 'Debe seleccionar un conductor principal.';
        }
        return null;
    });

    get getFormData(): ConductorDto[] | undefined {
        return this.conductores;
    }

    get conductores(): ConductorDto[] | undefined {
        return this._conductores();
    }

    conductorPrincipal = computed(() => {
        const conductores = this._conductores();
        return conductores?.find(x => x.job_title === 'Principal');
    });

    conductorSecundario = computed(() => {
        const conductores = this._conductores();
        return conductores?.filter(x => x.job_title === 'Secundario');
    });

    // Events

    evtOnSubmit(): boolean {
        this.submitted.set(true);

        if(this.invalid()){
            this.alertService.showToast({
                position: 'top-end',
                icon: "warning",
                title: this.invalid() ?? '',
                showCloseButton: true,
                timerProgressBar: true,
                timer: 4000,
                target: 'body'
            });
            return false;
        }
        return true;
    }

    evtAddConductor(item: ConductorDto): void{
      this._conductores.update(c => {
        return [...c ?? [], item];
      });
    }

    evtRemoveCoductor(id: number): void{
      this.handlerConfirmDialog(() => {
        this._conductores.update(c => {
          return c?.filter((_) => _.id !== id);
        });
      }, '¿Desea remover el conductor seleccionado?', 'Confirmar la operación.');
    }

    evtOnShowListaConductor(jobTitle: 'Principal' | 'Secundario'): void{
        this.modalRef = this.dialogService.open(MdlListaConductorComponent, {
            width: '1000px',
            keepInViewport: false,
            closable: false,
            modal: true,
            draggable: false,
            position: 'top',
            header: `Lista de conductores registrados`,
            styleClass: 'max-h-none!',
            maskStyleClass: 'py-4',
            contentStyle: {
                'padding': "0 !important"
            },
            appendTo: 'body',
            templates: {
                header: MdlHeader
            }
        });

        this.modalRef.onChildComponentLoaded
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((cmp: MdlListaConductorComponent) => {
            cmp?.OnSelect
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(( c: ConductorDto) => {
                const conductores = this._conductores();
                const existe = conductores?.some(conduc => conduc.id === c.id);
                const principal = jobTitle === 'Principal' ? conductores?.some(conduc => conduc.job_title === 'Principal' ) : false;
                const secundarios = jobTitle === 'Secundario' ? conductores?.filter(conduc => conduc.job_title === 'Secundario').length : 0;

                if(existe || principal || secundarios === 2){
                    this.alertService.showToast({
                        text: existe ? "El conductor ya se encuentra seleccionado" : principal ? "El conductor principal ya se encuentra seleccionado" : "Máximo se pueden seleccionar 2 conductores",
                        icon: "error",
                        timer: 4000,
                        timerProgressBar: true,
                        showCloseButton: true
                    });
                }else{
                    
                    this.evtAddConductor({...c, job_title: jobTitle});
                }
                this.modalRef?.close();
            });
            cmp?.OnClose
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.modalRef?.close();
            });
        });
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