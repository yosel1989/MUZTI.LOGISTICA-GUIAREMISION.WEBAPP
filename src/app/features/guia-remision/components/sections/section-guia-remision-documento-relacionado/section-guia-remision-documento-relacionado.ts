import { Component, inject, input, signal} from "@angular/core";
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";

import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { provideIcons } from "@ng-icons/core";

import { tablerAlertCircle } from "@ng-icons/tabler-icons";
import { ConfirmationService, MessageService } from 'primeng/api';
import { MessageModule } from "primeng/message";
import { AlertService } from "app/core/services/alert.service";
import { AccordionModule } from 'primeng/accordion';
import { SelectDocumentoRelacionadoComponent } from "@features/catalogo/components/selects/select-documento-relacionado/select-documento-relacionado";
import { ButtonModule } from "primeng/button";
import { GuiaRemisionDocumentoRelacionadoDto } from "@features/guia-remision/models/guia-remision.model";

@Component({
  selector: 'app-section-guia-remision-documento-relacionado',
  templateUrl: './section-guia-remision-documento-relacionado.html',
  styleUrl: './section-guia-remision-documento-relacionado.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TabsModule,
    InputTextModule,
    CardModule,
    MessageModule,
    AccordionModule,
    SelectDocumentoRelacionadoComponent,
    ButtonModule
  ],
  viewProviders: [provideIcons({ tablerAlertCircle })],
  providers: [MessageService, ConfirmationService]
})

export class SectionGuiaRemisionDocumentoRelacionado {
    confirmationService = inject(ConfirmationService);
    messageService = inject(MessageService);
    alertService = inject(AlertService);
    
    tipo =  input<string | 'REMITENTE' | 'TRANSPORTISTA' | undefined>( undefined );

    submitted = signal(false);

    frm: FormGroup = new FormGroup({
        documentos: new FormArray([])
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get f(): any {
        return this.frm.controls;
    }

    get invalid(): boolean{
        return this.frm.invalid;
    }

    get getFormData(): [] {
        return []
    }

    get documentos(): FormArray { 
      return this.frm.get('documentos') as FormArray; 
    }

    // Events

    evtOnSubmit(): boolean {
        this.submitted.set(true);

        if(this.frm.invalid){
            this.alertService.showToast({
                position: 'top-end',
                icon: "warning",
                title: "Se tiene",
                showCloseButton: true,
                timerProgressBar: true,
                timer: 4000
            });
            return false;
        }

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newDocRef(data: GuiaRemisionDocumentoRelacionadoDto | null): FormGroup { 
      return new FormGroup({ 
        doc_relacionado_id: new FormControl(data?.doc_relacionado_id ?? null),
        tipo_doc_ref_id: new FormControl(data?.tipo_doc_ref_id ?? null, Validators.required),
        tipo_doc_ref_codigo: new FormControl(data?.tipo_doc_ref_codigo ?? null, Validators.required),
        tipo_doc_ref: new FormControl(data?.tipo_doc_ref ?? null, Validators.required),
        ruc_doc_ref: new FormControl(data?.ruc_doc_ref ?? null, Validators.required),
        numero_doc_ref: new FormControl(data?.numero_doc_ref ?? null, Validators.required)
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    evtAddDocRef(): void{
      const row = this.newDocRef(null);
      this.documentos.push(row);
    }

    evtRemoveDocRef(index: number): void{
      this.handlerConfirmDialog(() => {
        this.documentos.removeAt(index);
      }, '¿Desea remover el comprobante de referencia seleccionado?', 'Confirmar la operación.');
    }

    // Handlers

    handlerConfirmDialog(callback: () => void, header: string, message: string): void{
      this.confirmationService.confirm({
          header: header,
          message: message,
          accept: () => {
            callback();
          }
      });
    }
}