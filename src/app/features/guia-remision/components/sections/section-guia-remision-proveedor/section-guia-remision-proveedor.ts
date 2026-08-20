import { Component, DestroyRef, inject, Input, signal} from "@angular/core";
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
import { ProveedorDto } from "@features/proveedor/models/proveedor";
import { MdlListaProveedorComponent } from "@features/proveedor/components/modals/mdl-lista-proveedor/mdl-lista-proveedor";

@Component({
  selector: 'app-section-guia-remision-proveedor',
  templateUrl: './section-guia-remision-proveedor.html',
  styleUrl: './section-guia-remision-proveedor.scss',
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

export class SectionGuiaRemisionProveedor {
    destroyRef = inject(DestroyRef);
    messageService = inject(MessageService);
    alertService = inject(AlertService);
    confirmationService = inject(ConfirmationService);
    dialogService = inject(DialogService);

    private _proveedor = signal<ProveedorDto | undefined>(undefined);
    @Input() set proveedor(value: ProveedorDto | undefined) {
        if (value !== undefined && this._proveedor() !== value) {
            this._proveedor.set(value);
        }else{
            this._proveedor.set(undefined);
        }
    }

    messageError = signal<string | undefined>(undefined);

    submitted = signal(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modalRef: any | undefined;

    get getFormData(): ProveedorDto | null {
        return this.proveedor ?? null;
    }

    get proveedor(): ProveedorDto | null {
        return this._proveedor() ?? null;
    }

    get invalid(): boolean {
        return this._proveedor() == undefined;
    }

    // Events

    evtOnSubmit(): boolean {
        this.submitted.set(true);

        if(this.invalid){
            this.alertService.showToast({
                position: 'top-end',
                icon: "warning",
                title: 'Debe seleccionar el proveedor',
                showCloseButton: true,
                timerProgressBar: true,
                timer: 4000,
                target: 'body'
            });
            return false;
        }
        return true;
    }

    evtOnShowListaProveedor(): void{
        this.modalRef = this.dialogService.open(MdlListaProveedorComponent, {
            width: '1000px',
            keepInViewport: false,
            closable: false,
            modal: true,
            draggable: false,
            position: 'top',
            header: `Lista de proveedores registrados`,
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
        .subscribe((cmp: MdlListaProveedorComponent) => {
            
            cmp?.OnSelect
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(( t: ProveedorDto) => {
                this._proveedor.set(t);
                this.modalRef?.close();
            });

            cmp?.OnClose
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.modalRef?.close();
            });

        });

    }

    evtRemoveProveedor(): void{
      this.handlerConfirmDialog(() => {
        this._proveedor.set(undefined)
      }, '¿Desea remover el proveedor seleccionado?', 'Confirmar la operación.');
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