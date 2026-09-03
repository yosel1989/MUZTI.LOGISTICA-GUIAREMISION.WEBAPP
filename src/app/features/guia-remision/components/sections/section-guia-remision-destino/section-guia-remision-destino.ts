import { Component, inject, Input, signal} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";

import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { provideIcons } from "@ng-icons/core";

import { tablerAlertCircle } from "@ng-icons/tabler-icons";
import { MessageService } from 'primeng/api';
import { MessageModule } from "primeng/message";
import { GR_DestinoRequestDto } from "app/features/guia-remision/models/guia-remision.model";
import { AlertService } from "app/core/services/alert.service";
import { TypingComponent } from "@features/shared/components/typing/typing";
import { AccordionModule } from 'primeng/accordion';
import { FieldsetModule } from "primeng/fieldset";
import { EntityBranchDto } from "@features/establecimiento/models/entity-branch";

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
    FieldsetModule
  ],
  viewProviders: [provideIcons({ tablerAlertCircle })],
  providers: [MessageService]
})

export class SectionGuiaRemisionDestino {
    messageService = inject(MessageService);
    alertService = inject(AlertService);

    private _destinatario = signal<EntityBranchDto | null>(null);
    @Input() set destinatario(value: EntityBranchDto | null) {
        if (this._destinatario() !== value) {
            this._destinatario.set(value);
        }
    }

    submitted = signal(false);

    get invalid(): boolean{
        return !this.destinatario;
    }

    get valid(): boolean {
        return !!(this.destinatario);
    }


    get getFormData(): GR_DestinoRequestDto {
        return {
            ubigeo_id: this.destinatario!.ubigeo_id,
            direccion: this.destinatario!.address,
            pais: this.destinatario!.pais,
        }
    }

    get destinatario(): EntityBranchDto | null {
        return this._destinatario();
    }

    evtOnSubmit(): boolean {
        this.submitted.set(true);

        if(!this.destinatario){
            console.log('Invalido: Datos de Destino');
            this.alertService.showToast({
                position: 'top-end',
                icon: "warning",
                title: "Se tiene que completar los datos obligatorios en la sección de punto de llegada.",
                showCloseButton: true,
                timerProgressBar: true,
                timer: 4000
            });
            return false;
        }

        return true;
    }


}