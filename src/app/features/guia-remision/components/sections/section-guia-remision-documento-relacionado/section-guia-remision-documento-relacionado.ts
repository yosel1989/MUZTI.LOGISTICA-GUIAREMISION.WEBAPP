import { Component, inject, input, OnInit, signal} from "@angular/core";
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
import { ButtonModule } from "primeng/button";
import { GuiaRemisionDocumentoRelacionadoDto } from "@features/guia-remision/models/guia-remision.model";
import { TooltipModule } from "primeng/tooltip";
import { FieldsetModule } from "primeng/fieldset";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { OnlyNumberDirective } from "@core/directives/only-numbers.directive";
import { DocumentoRelacionadoDTO } from "@features/catalogo/models/catalogo.model";
import { CatalogoApiService } from "@features/catalogo/services/catalogo-api.service";
import { finalize } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { SelectModule } from "primeng/select";

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
    ButtonModule,
    TooltipModule,
    FieldsetModule,
    ConfirmDialogModule,
    OnlyNumberDirective,
    SelectModule
  ],
  viewProviders: [provideIcons({ tablerAlertCircle })],
  providers: [MessageService, ConfirmationService]
})

export class SectionGuiaRemisionDocumentoRelacionado implements OnInit{
    catalogoService = inject(CatalogoApiService);
    confirmationService = inject(ConfirmationService);
    messageService = inject(MessageService);
    alertService = inject(AlertService);
    
    _tipo =  input<string | 'REMITENTE' | 'TRANSPORTISTA' | undefined>( undefined );

    submitted = signal(false);

    frm: FormGroup = new FormGroup({
        documentos: new FormArray([])
    });


    data = signal<DocumentoRelacionadoDTO[]>([]);
    ldData = signal(false);

    ngOnInit(): void {
      this.loadData();
    }

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

    get tipo(): string | 'REMITENTE' | 'TRANSPORTISTA' | null {
      return this._tipo() ?? null;
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
        ruc_doc_ref: new FormControl(data?.ruc_doc_ref ?? null, [Validators.required, Validators.minLength(8), Validators.maxLength(11)]),
        numero_doc_ref: new FormControl(data?.numero_doc_ref ?? null, Validators.required)
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    evtAddDocRef(): void{
      const row = this.newDocRef(null);
      this.documentos.push(row);
    }

    evtRemoveDocRef(index: number): void{
      console.log(index);
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

    // Data

    loadData(): void{
      this.ldData.set(true);
      this.catalogoService.getDocumentoRelacionados(this.tipo)
      .pipe(finalize(()=>{
        this.ldData.set(false);
      }))
      .subscribe({
        next: (value: DocumentoRelacionadoDTO[]) =>  {
          this.data.set(value);
        },
        error: (err: HttpErrorResponse) => {
          this.alertService.showToast({
            title: err.error.detalle,
            icon: 'error',
            timer: 4000,
            timerProgressBar: true,
            showCloseButton: true
          });
        },
      });
    }
}