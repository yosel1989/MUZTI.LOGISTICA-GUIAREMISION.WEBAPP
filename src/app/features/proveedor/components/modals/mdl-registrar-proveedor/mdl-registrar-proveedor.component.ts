import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
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
import { RegistrarProveedorRequestDto, RegistrarProveedorResponseDto } from '@features/proveedor/models/proveedor';
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
    OnlyUpperDirective
  ],
  templateUrl: './mdl-registrar-proveedor.component.html',
  styleUrl: './mdl-registrar-proveedor.component.scss',
  providers: [ConfirmationService]
})
export class MdlRegistrarProveedorComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() OnCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();

  frm: FormGroup = new FormGroup({});
  isSubmitted: boolean = false;
  ldSubmit: boolean = false;

  private subs = new Subscription();
  
  documentTypes: DocumentEntityType[] = FAKE_DOCUMENT_TYPE_PROVIDER;
  submitted: boolean = false;


  headerValue: string = '';
  estados: {id: number, label: string}[] = [
    {id: 0, label: 'Inactivo'},
    {id: 1, label: 'Activo'}
  ];

  constructor(
    private fb: FormBuilder,
    public config: DynamicDialogConfig,
    private api: ProveedorApiService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService
	) {
    this.frm = this.fb.group({
      tipo_documento: new FormControl('DNI', Validators.required),
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

    this.subs.add(this.frm.get('tipo_documento')?.valueChanges.subscribe((value)=> {
      this.frm.get('numero_documento')?.clearValidators();
      switch(value){
          case 'DNI':
              this.frm.get('numero_documento')?.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(8)]);
            break;
          case 'PASAPORTE':
              this.frm.get('numero_documento')?.setValidators([Validators.required, Validators.maxLength(12)]);
            break;
          case 'CARNET DE EXTRANJERIA':
              this.frm.get('numero_documento')?.setValidators([Validators.required, Validators.maxLength(12)]);
            break;
          case 'RUC':
              this.frm.get('numero_documento')?.setValidators([Validators.required, Validators.minLength(11), Validators.maxLength(11)]);
            break;
          default:
            break;
      }
    }));
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // Getters
  get f(): any {
    return this.frm.controls;
  }

  get request(): RegistrarProveedorRequestDto {
    const form = this.frm.value;

    return {
      tipo_documento: form.tipo_documento,
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
    this.isSubmitted = true;
    if(this.frm.invalid){
      return;
    }

    this.confirmationService.confirm({
        header: '¿Registrar proveedor?',
        message: 'Confirmar la operación.',
        accept: () => {
            const requestData = this.request;
            this.frm.disable();
            this.ldSubmit = true;
            
            const subs = this.api.registrar(requestData)
            .pipe(finalize(() => {
              this.frm.enable();
              this.ldSubmit = false;
            }))
            .subscribe({
              next: (res: RegistrarProveedorResponseDto) => {
                this.alertService.showToast({
                  position: 'bottom-end',
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
                  position: 'bottom-end',
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
        reject: () => {
            
        },
    });
  }

  evtOnClose(): void{
    this.OnCanceled.emit(true);
  }

}
