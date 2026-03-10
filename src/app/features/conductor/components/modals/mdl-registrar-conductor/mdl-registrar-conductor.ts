import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { EditorModule } from 'primeng/editor';
import { MessageModule } from 'primeng/message';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
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
    SelectModule
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
    private ref: DynamicDialogRef,
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
      cargo: new FormControl(null),
      licencia: new FormControl(null, [Validators.required, Validators.maxLength(10)]),
      empleado_id_creacion: new FormControl(null),
      empleado_nombre_creacion: new FormControl(null)
    });

    this.headerValue = this.config.header ?? '';
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
      licencia: form.licencia,
      empleado_id_creacion: 1,
      empleado_nombre_creacion: 'SA'
    };
  }

  // Events
  evtOnSubmit(): void{
    this.isSubmitted = true;
    if(this.frm.invalid){
      console.log(this.frm);
      return;
    }

    this.confirmationService.confirm({
        header: '¿Registrar conductor?',
        message: 'Confirmar la operación.',
        accept: () => {

            this.frm.disable();
            this.ldSubmit = true;
            
            const subs = this.api.registrar(this.request).subscribe({
              next: (res: RegistrarConductorResponseDto) => {
                this.frm.enable();
                this.ldSubmit = false;

                this.alertService.showToast({
                  position: 'bottom-end',
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
                  position: 'bottom-end',
                  icon: "error",
                  title: err.error.error,
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
