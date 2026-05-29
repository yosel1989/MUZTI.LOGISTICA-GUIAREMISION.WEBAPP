import { AfterViewInit, Component, EventEmitter, inject, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { EditorModule } from 'primeng/editor';
import { MessageModule } from 'primeng/message';

import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { finalize, Subscription } from 'rxjs';
import { ProveedorApiService } from '@features/proveedor/services/proveedor-api.service';
import { RegistrarProveedorRequestDto } from '@features/proveedor/models/proveedor';
import { SelectModule } from 'primeng/select';
import { DocumentEntityType } from '@features/items/models/document-entity-type';
import { FAKE_DOCUMENT_TYPE_PROVIDER } from 'app/fake/items/data/fakeDocumenType';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from 'app/core/services/alert.service';
import { OnlyNumberDirective } from 'app/core/directives/only-numbers.directive';
import { OnlyUpperDirective } from 'app/core/directives/only-uppers.directive';
import { SelectDepartamentoComponent } from '@features/ubigeo/components/selects/select-departamento/select-departamento';
import { SelectProvinciaComponent } from '@features/ubigeo/components/selects/select-provincia/select-provincia';
import { SelectDistritoComponent } from '@features/ubigeo/components/selects/select-distrito/select-distrito';
import { SelectTipoDocumentoComponent } from '@features/catalogo/components/selects/select-tipo-documento/select-tipo-documento';
import { TipoDocumentoDTO } from '@features/catalogo/models/catalogo.model';

@Component({
  selector: 'app-mdl-registrar-proveedor',
  imports: [
    FormsModule, 
    InputNumberModule,
    InputTextModule, 
    TextareaModule, 
    ButtonModule, 
    EditorModule, 
    ReactiveFormsModule, 
    MessageModule, 
    ConfirmDialog,
    SelectModule,
    SelectDepartamentoComponent,
    SelectProvinciaComponent,
    SelectDistritoComponent,
    OnlyNumberDirective,
    OnlyUpperDirective,
    SelectTipoDocumentoComponent
  ],
  templateUrl: './mdl-registrar-proveedor.component.html',
  styleUrl: './mdl-registrar-proveedor.component.scss',
  providers: [ConfirmationService]
})
export class MdlRegistrarProveedorComponent implements OnInit, AfterViewInit, OnDestroy {

  private api = inject(ProveedorApiService);
  private confirmationService = inject(ConfirmationService);
  private alertService = inject(AlertService);

  @Output() OnCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();

  frm: FormGroup = new FormGroup({});
  isSubmitted = signal(false);
  ldSubmit = signal(false);

  private subs = new Subscription();
  
  documentTypes: DocumentEntityType[] = FAKE_DOCUMENT_TYPE_PROVIDER;
  submitted = signal(false);


  headerValue: string = '';
  estados: {id: number, label: string}[] = [
    {id: 0, label: 'Inactivo'},
    {id: 1, label: 'Activo'}
  ];

  constructor( public config: DynamicDialogConfig ) {}

  ngOnInit(): void {
    this.frm = new FormGroup({
      tipo_documento_id: new FormControl(null, Validators.required),
      numero_documento: new FormControl(null, Validators.required),
      razon_social: new FormControl(null, [Validators.required, Validators.maxLength(200)]),
      departamento: new FormControl(null, Validators.required),
      provincia: new FormControl(null, Validators.required),
      distrito: new FormControl(null, Validators.required),
      direccion: new FormControl(null, [Validators.required, Validators.maxLength(250)]),
      email: new FormControl(null, [Validators.email, Validators.maxLength(50)]),
      pais: new FormControl('PE', [Validators.minLength(1), Validators.maxLength(3), Validators.required]),
      codigo_sunat: new FormControl(null, [Validators.maxLength(4), Validators.minLength(4)]),
      empleado_id_creacion: new FormControl(null),
      empleado_nombre_creacion: new FormControl(null)
    });

    this.headerValue = this.config.header ?? '';

  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // Getters

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get f(): any {
    return this.frm.controls;
  }

  get request(): RegistrarProveedorRequestDto {
    const form = this.frm.value;

    return {
      tipo_documento_id: form.tipo_documento_id,
      numero_documento: form.numero_documento,
      razon_social: form.razon_social,
      ubigeo_id: form.distrito,
      direccion: form.direccion,
      email: form.email,
      pais: form.pais,
      codigo_sunat: form.codigo_sunat
    };
  }

  // Events
  evtOnSubmit(): void{
    this.isSubmitted.set(true);
    if(this.frm.invalid){
      return;
    }

    this.confirmationService.confirm({
        header: '¿Registrar proveedor?',
        message: 'Confirmar la operación.',
        accept: () => {
            const requestData = this.request;
            this.frm.disable();
            this.ldSubmit.set(true);
            
            const subs = this.api.registrar(requestData)
            .pipe(finalize(() => {
              this.frm.enable();
              this.ldSubmit.set(false);
            }))
            .subscribe({
              next: () => {
                this.alertService.showToast({
                  position: 'top-end',
                  icon: "success",
                  title: "Se registro el proveedor con éxito",
                  showCloseButton: true,
                  timerProgressBar: true,
                  timer: 4000
                });

                this.OnCreated.emit(true);
              },
              error: (err: HttpErrorResponse) => {
                this.alertService.showToast({
                  position: 'top-end',
                  icon: "error",
                  title: err.error.detalle,
                  showCloseButton: true,
                  timerProgressBar: true,
                  timer: 4000,
                  customClass: {
                    container: 'z-[9999]!',
                    popup: 'z-[9999]!'
                  }
                });
              }
            });
            this.subs.add(subs);
           
        },
    });
  }

  evtOnClose(): void{
    this.OnCanceled.emit(true);
  }

  evtSelectedChangeTipoDocumento(evt: TipoDocumentoDTO | undefined){
    this.frm.get('numero_documento')?.clearValidators();
    this.frm.get('numero_documento')?.updateValueAndValidity();

    this.frm.get('numero_documento')?.addValidators(Validators.required);
    if(evt?.min) this.frm.get('numero_documento')?.addValidators(Validators.minLength(evt.min));
    if(evt?.max) this.frm.get('numero_documento')?.addValidators(Validators.maxLength(evt.max));
    this.frm.get('numero_documento')?.updateValueAndValidity();
  }

}
