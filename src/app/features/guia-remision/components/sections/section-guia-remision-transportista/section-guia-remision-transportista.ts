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
import { FieldsetModule } from "primeng/fieldset";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogService } from 'primeng/dynamicdialog';
import { MdlHeader } from "@core/components/modals/headers/mdl-header/mdl-header";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TooltipModule } from "primeng/tooltip";
import { UnidadTransporteDto } from "@features/unidad-transporte/models/unidad-transporte.model";
import { MdlListaUnidadTransporteComponent } from "@features/unidad-transporte/components/modals/mdl-lista-unidad-transporte/mdl-lista-unidad-transporte";
import { TransportistaDto } from "@features/transportista/models/transportista";
import { MdlListaTransportistaComponent } from "@features/transportista/components/modals/mdl-lista-transportista/mdl-lista-transportista";

@Component({
  selector: 'app-section-guia-remision-transportista',
  templateUrl: './section-guia-remision-transportista.html',
  styleUrl: './section-guia-remision-transportista.scss',
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

export class SectionGuiaRemisionTransportista {
    destroyRef = inject(DestroyRef);
    messageService = inject(MessageService);
    alertService = inject(AlertService);
    confirmationService = inject(ConfirmationService);
    dialogService = inject(DialogService);

    private _transportista = signal<TransportistaDto | undefined>(undefined);
    @Input() set transportista(value: TransportistaDto | undefined) {
        if (value !== undefined && this._transportista() !== value) {
            this._transportista.set(value);
        }else{
            this._transportista.set(undefined);
        }
    }

    private _vehiculos = signal<UnidadTransporteDto[] | undefined>([]);
    @Input() set vehiculos(value: UnidadTransporteDto[] | undefined) {
        if (value !== undefined && this._vehiculos() !== value) {
            this._vehiculos.set(value);
        }else{
            this._vehiculos.set(undefined);
        }
    }

    private _tipoTransporte = signal<'PRIVADO' | 'PUBLICO'>('PRIVADO');
    @Input() set tipoTransporte(value: 'PRIVADO' | 'PUBLICO' | undefined) {
        this._vehiculos.set(undefined);
        this._transportista.set(undefined);

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

    invalid = computed(() => {
        switch (this._tipoTransporte()) {
            case 'PRIVADO': {
                const vehiculos = this._vehiculos();
                if (!vehiculos || vehiculos.length === 0) {
                    return 'Debe seleccionar al menos un vehículo.';
                }
                if ( !vehiculos.find(x => x.job_title === 'Principal') ) {
                    return 'Debe seleccionar un vehículo principal.';
                }
                return null;
            }
            case 'PUBLICO':
                return this._transportista() === undefined
                    ? 'Debe seleccionar un transportista.'
                    : null;
                default:
            return null;
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get getFormData(): {vehiculos: UnidadTransporteDto[] | null, transportista: TransportistaDto | null} {
        return {
            vehiculos: this.vehiculos.length ? this.vehiculos : null,
            transportista: this.transportista
        }
    }

    get vehiculos(): UnidadTransporteDto[] {
        return this._vehiculos() ?? [];
    }

    get transportista(): TransportistaDto | null {
        return this._transportista() ?? null;
    }

    get tipoTransporte(): 'PRIVADO' | 'PUBLICO' {
        return this._tipoTransporte();
    }

    vehiculoPrincipal = computed(() => {
        const vehiculos = this._vehiculos();
        return vehiculos?.find(x => x.job_title === 'Principal');
    });

    vehiculoSecundario = computed(() => {
        const vehiculos = this._vehiculos();
        return vehiculos?.filter(x => x.job_title === 'Secundario') ?? [];
    });

    // Events

    evtOnSubmit(): boolean {
        this.submitted.set(true);

        if(this.invalid()){
            console.log('Invalido: Datos de Transportista');
            this.alertService.showToast({
                position: 'top-end',
                icon: "warning",
                title: this.messageError(),
                showCloseButton: true,
                timerProgressBar: true,
                timer: 4000,
                target: 'body'
            });
            return false;
        }
        return true;
    }

    evtAddVehiculo(item: UnidadTransporteDto): void{
      this._vehiculos.update(v => {
        return [...v ?? [], item];
      });
      console.log('vehiculos', this._vehiculos());
    }

    evtRemoveVehiculo(id: number): void{
      this.handlerConfirmDialog(() => {
        this._vehiculos.update(c => {
          return c?.filter((_) => _.id !== id);
        });
      }, '¿Desea remover el vehiculo seleccionado?', 'Confirmar la operación.');
    }

    evtOnShowListaVehiculo(jobTitle: 'Principal' | 'Secundario'): void{
        this.modalRef = this.dialogService.open(MdlListaUnidadTransporteComponent, {
            width: '1000px',
            keepInViewport: false,
            closable: false,
            modal: true,
            draggable: false,
            position: 'top',
            header: `Lista de vehículos registrados`,
            styleClass: 'max-h-none!',
            maskStyleClass: 'py-4',
            appendTo: 'body',
            templates: {
                header: MdlHeader
            }
        });

        this.modalRef.onChildComponentLoaded
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((cmp: MdlListaUnidadTransporteComponent) => {
            cmp?.OnSelect
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(( c: UnidadTransporteDto) => {
                const vehiculos = this._vehiculos();
                const existe = vehiculos?.some(conduc => conduc.id === c.id);
                const principal = jobTitle === 'Principal' ? vehiculos?.some(conduc => conduc.job_title === 'Principal' ) : false;
                const secundarios = jobTitle === 'Secundario' ? vehiculos?.filter(conduc => conduc.job_title === 'Secundario').length : 0;

                if(existe || principal || secundarios === 2){
                    this.alertService.showToast({
                        text: existe ? "El vehículo ya se encuentra seleccionado" : principal ? "El vehículo principal ya se encuentra seleccionado" : "Máximo se pueden seleccionar 2 vehiculos secundarios",
                        icon: "error",
                        timer: 4000,
                        timerProgressBar: true,
                        showCloseButton: true
                    });
                }else{
                    
                    this.evtAddVehiculo({...c, job_title: jobTitle});
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

    evtOnShowListaTransportista(): void{
        this.modalRef = this.dialogService.open(MdlListaTransportistaComponent, {
            width: '1000px',
            keepInViewport: false,
            closable: false,
            modal: true,
            draggable: false,
            position: 'top',
            header: `Lista de transportistas registrados`,
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
        .subscribe((cmp: MdlListaTransportistaComponent) => {
            
            cmp?.OnSelect
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(( t: TransportistaDto) => {
                this._transportista.set(t);
                this.modalRef?.close();
            });

            cmp?.OnClose
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.modalRef?.close();
            });

        });

    }

    evtRemoveTransportista(): void{
      this.handlerConfirmDialog(() => {
        this._vehiculos.set(undefined)
      }, '¿Desea remover el transportista seleccionado?', 'Confirmar la operación.');
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