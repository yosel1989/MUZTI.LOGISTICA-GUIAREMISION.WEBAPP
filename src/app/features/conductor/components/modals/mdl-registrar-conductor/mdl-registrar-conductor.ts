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
import { Subscription } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { DocumentEntityType } from '@features/items/models/document-entity-type';
import { FAKE_DOCUMENT_TYPE_PERSON } from 'app/fake/items/data/fakeDocumenType';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from 'app/core/services/alert.service';
import { ConductorApiService } from '@features/conductor/services/conductor-api.service';
import { RegistrarConductorRequestDto, RegistrarConductorResponseDto } from '@features/conductor/models/conductor.model';
import { OnlyNumberDirective } from 'app/core/directives/only-numbers.directive';
import { OnlyUpperDirective } from 'app/core/directives/only-uppers.directive';

@Component({
  selector: 'app-mdl-registrar-conductor',
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
    OnlyNumberDirective,
    OnlyUpperDirective
  ],
  templateUrl: './mdl-registrar-conductor.html',
  styleUrl: './mdl-registrar-conductor.scss',
  providers: [ConfirmationService]
})
export class MdlRegistrarConductorComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() OnCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();

  frm: FormGroup = new FormGroup({});
  isSubmitted: boolean = false;
  ldSubmit: boolean = false;

  private subs = new Subscription();
  
  documentTypes: DocumentEntityType[] = FAKE_DOCUMENT_TYPE_PERSON;
  submitted: boolean = false;


  headerValue: string = '';
  estados: {id: number, label: string}[] = [
    {id: 0, label: 'Inactivo'},
    {id: 1, label: 'Activo'}
  ];

  constructor(
    private fb: FormBuilder,
    public config: DynamicDialogConfig,
    private api: ConductorApiService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService
	) {
    this.frm = this.fb.group({
      tipo_documento: new FormControl('DNI', Validators.required),
      numero_documento: new FormControl(null, Validators.required),
      nombres: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      apellidos: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      cargo: new FormControl(null, [Validators.maxLength(100)]),
      licencia: new FormControl(null, [Validators.required, Validators.minLength(9), Validators.maxLength(10)]),
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

  get request(): RegistrarConductorRequestDto {
    const form = this.frm.value;

    return {
      tipo_documento: form.tipo_documento,
      numero_documento: form.numero_documento,
      nombres: form.nombres,
      apellidos: form.apellidos,
      cargo: form.cargo,
      licencia: form.licencia
    };
  }

  // Events
  evtOnSubmit(): void{
    this.isSubmitted = true;
    if(this.frm.invalid){
      return;
    }

    this.confirmationService.confirm({
        header: '¿Registrar conductor?',
        message: 'Confirmar la operación.',
        accept: () => {

            const dataRequest = this.request;
            this.frm.disable();
            this.ldSubmit = true;
            
            const sub = this.api.registrar(dataRequest).subscribe({
              next: (res: RegistrarConductorResponseDto) => {
                this.frm.enable();
                this.ldSubmit = false;

                this.alertService.showToast({
                  position: 'top-end',
                  icon: "success",
                  title: "Se registro el conductor con éxito",
                  showCloseButton: true,
                  timerProgressBar: true,
                  timer: 4000
                });

                this.OnCreated.emit(true);
              },
              error: (err: HttpErrorResponse) => {
                this.frm.enable();
                this.ldSubmit = false;
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
            this.subs.add(sub);
           
        },
        reject: () => {
            
        },
    });
  }

  evtOnClose(): void{
    this.OnCanceled.emit(true);
  }


}
