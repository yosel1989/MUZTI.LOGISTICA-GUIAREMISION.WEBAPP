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
import { SelectDepartamentoComponent } from '@features/guia-remision/components/selects/select-departamento/select-departamento';
import { SelectProvinciaComponent } from '@features/guia-remision/components/selects/select-provincia/select-provincia';
import { SelectDistritoComponent } from '@features/guia-remision/components/selects/select-distrito/select-distrito';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from 'app/core/services/alert.service';
import { RegistrarRemitenteResponseDto } from '@features/remitente/models/remitente';
import { RemitenteApiService } from '@features/remitente/services/remitente-api.service';
import { OnlyNumberDirective } from 'app/core/directives/only-numbers.directive';
import { OnlyUpperDirective } from 'app/core/directives/only-uppers.directive';
import { DividerModule } from 'primeng/divider';
import { RegistrarTransportistaRequestDto } from '@features/transportista/models/transportista';
import { TransportistaApiService } from '@features/transportista/services/transportista-api.service';

@Component({
  selector: 'app-mdl-registrar-transportista',
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
    DividerModule
  ],
  templateUrl: './mdl-registrar-transportista.component.html',
  styleUrl: './mdl-registrar-transportista.component.scss',
  providers: [ConfirmationService]
})
export class MdlRegistrarTransportistaComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() OnCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();

  frm: FormGroup = new FormGroup({});
  isSubmitted: boolean = false;
  ldSubmit: boolean = false;

  private subs = new Subscription();
  submitted: boolean = false;

  headerValue: string = '';
  estados: {id: number, label: string}[] = [
    {id: 0, label: 'Inactivo'},
    {id: 1, label: 'Activo'}
  ];

  constructor(
    private fb: FormBuilder,
    public config: DynamicDialogConfig,
    private api: TransportistaApiService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService
	) {
    this.frm = this.fb.group({
      tipo_documento: new FormControl('RUC', [Validators.required]),
      numero_documento: new FormControl(null, [Validators.required, Validators.minLength(11), Validators.maxLength(11)]),
      razon_social: new FormControl(null, [Validators.required, Validators.maxLength(200)]),
      departamento: new FormControl(null, Validators.required),
      provincia: new FormControl(null, Validators.required),
      distrito: new FormControl(null, Validators.required),
      direccion: new FormControl(null, [Validators.required, Validators.maxLength(250)]),
      codigo_sunat: new FormControl(null, [Validators.minLength(4), Validators.maxLength(4)]),
      email: new FormControl(null, [Validators.email, Validators.maxLength(100)]),
      pais: new FormControl('PE', [Validators.required, Validators.maxLength(3)])
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

  get request(): RegistrarTransportistaRequestDto {
    const form = this.frm.value;

    return {
      tipo_documento: form.tipo_documento,
      numero_documento: form.numero_documento,
      razon_social: form.razon_social,
      ubigeo_id: form.distrito,
      direccion: form.direccion,
      email: form.email,
      pais: form.pais,
      codigo_sunat: form.codigo_sunat,
      empleado_id_creacion: 1,
      empleado_nombre_creacion: 'SA'
    };
  }

  // Events
  evtOnSubmit(): void{
    this.isSubmitted = true;
    if(this.frm.invalid){
      return;
    }

    this.confirmationService.confirm({
        header: '¿Registrar transportista?',
        message: 'Confirmar la operación.',
        accept: () => {

            this.frm.disable();
            this.ldSubmit = true;
            
            const subs = this.api.registrar(this.request).subscribe({
              next: (res: RegistrarRemitenteResponseDto) => {
                this.frm.enable();
                this.ldSubmit = false;

                this.alertService.showToast({
                  position: 'bottom-end',
                  icon: "success",
                  title: "Se registro al transportista con éxito",
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