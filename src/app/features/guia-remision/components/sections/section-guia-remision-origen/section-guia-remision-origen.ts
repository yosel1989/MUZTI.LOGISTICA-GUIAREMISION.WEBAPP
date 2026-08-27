import { Component, inject, Input, signal} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";

import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { provideIcons } from "@ng-icons/core";

import { tablerAlertCircle } from "@ng-icons/tabler-icons";
import { MessageService } from 'primeng/api';
import { MessageModule } from "primeng/message";
import { GR_OrigenRequestDto } from "app/features/guia-remision/models/guia-remision.model";
import { AlertService } from "app/core/services/alert.service";
import { EstablecimientoDTO } from "@features/establecimiento/models/establecimiento.model";
import { AccordionModule } from 'primeng/accordion';
import { TypingComponent } from "@features/shared/components/typing/typing";
import { FieldsetModule } from "primeng/fieldset";

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
    FieldsetModule
  ],
  viewProviders: [provideIcons({ tablerAlertCircle })],
  providers: [MessageService]
})

export class SectionGuiaRemisionOrigen {
    messageService = inject(MessageService);
    alertService = inject(AlertService);
  

    private _remitente = signal<EstablecimientoDTO | null>(null);
    @Input() set remitente(value: EstablecimientoDTO | null) {
        if (this._remitente() !== value) {
            this._remitente.set(value);
        }
    }

    submitted = signal(false);

    get invalid(): boolean{
        return !this.remitente;
    }

    get valid(): boolean {
        return !!(this.remitente);
    }


    get getFormData(): GR_OrigenRequestDto {
        return {
            ubigeo_id: this.remitente!.ubigeo_id,
            direccion: this.remitente!.direccion,
            pais: this.remitente!.pais,
        }
    }

    get remitente(): EstablecimientoDTO | null {
        return this._remitente();
    }

    evtOnSubmit(): boolean {
        this.submitted.set(true);

        if(!this.remitente){
            console.log('Invalido: Datos de Origen');
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

}