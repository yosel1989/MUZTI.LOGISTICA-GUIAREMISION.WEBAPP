import { AfterViewInit, Component, EventEmitter, inject, input, OnDestroy, OnInit, Output, signal } from '@angular/core';
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
import { SelectModule } from 'primeng/select';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from 'app/core/services/alert.service';
import { OnlyNumberDirective } from 'app/core/directives/only-numbers.directive';
import { OnlyUpperDirective } from 'app/core/directives/only-uppers.directive';
import { SelectDepartamentoComponent } from '@features/ubigeo/components/selects/select-departamento/select-departamento';
import { SelectProvinciaComponent } from '@features/ubigeo/components/selects/select-provincia/select-provincia';
import { SelectDistritoComponent } from '@features/ubigeo/components/selects/select-distrito/select-distrito';
import { SelectTipoDocumentoComponent } from '@features/catalogo/components/selects/select-tipo-documento/select-tipo-documento';
import { TipoDocumentoDTO } from '@features/catalogo/models/catalogo.model';
import { EntityCreateDto } from '@features/entity/models/entity';
import { EntityApiService } from '@features/entity/services/entity-service';
import { SelectPaisComponent } from '@features/catalogo/components/selects/select-pais/select-pais';


@Component({
  selector: 'app-mdl-entity-create',
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
    SelectTipoDocumentoComponent,
    SelectPaisComponent
  ],
  templateUrl: './mdl-entity-create.html',
  styleUrl: './mdl-entity-create.scss',
  providers: [ConfirmationService]
})
export class MdlEntityCreate implements OnInit, AfterViewInit, OnDestroy {

  private api = inject(EntityApiService);
  private confirmationService = inject(ConfirmationService);
  private alertService = inject(AlertService);

  @Output() OnCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();
  role = input.required<'cliente' | 'proveedor' | 'transportista' | 'emisor'>();

  frm: FormGroup = new FormGroup({});
  isSubmitted = signal(false);
  ldSubmit = signal(false);

  private subs = new Subscription();
  
  submitted = signal(false);

  headerValue: string = '';
  estados: {id: number, label: string}[] = [
    {id: 0, label: 'Inactivo'},
    {id: 1, label: 'Activo'}
  ];

  types: {value: string, label: string}[] = [
    {value: 'empresa', label: 'EMPRESA'},
    {value: 'persona', label: 'PERSONA'},
  ];
  
  constructor( public config: DynamicDialogConfig ) {}

  ngOnInit(): void {
    this.frm = new FormGroup({
      type: new FormControl('empresa', Validators.required),
      document_type_id: new FormControl(null, Validators.required),
      document_number: new FormControl(null, Validators.required),
      name: new FormControl(null, [Validators.maxLength(150)]),
      first_name: new FormControl(null, [Validators.maxLength(75)]),
      last_name: new FormControl(null, [Validators.maxLength(75)]),
      department: new FormControl(null, Validators.required),
      province: new FormControl(null, Validators.required),
      district: new FormControl(null, Validators.required),
      address: new FormControl(null, [Validators.required, Validators.maxLength(150)]),
      email: new FormControl(null, [Validators.email, Validators.maxLength(50)]),
      country_id: new FormControl(null, Validators.required),
      code_sunat: new FormControl(null, [Validators.maxLength(4), Validators.minLength(4)])
    });

    this.headerValue = this.config.header ?? '';

    this.frm.get('type')?.valueChanges.subscribe((value: string) => {
      this.frm.patchValue({
        document_type_id: null,
        document_number: null,
        name: null,
        first_name: null,
        last_name: null
      });
      this.frm.get('name')?.clearValidators();
      this.frm.get('first_name')?.clearValidators();
      this.frm.get('first_name')?.clearValidators();

      if(value === 'empresa'){
        this.frm.get('name')?.setValidators([Validators.required, Validators.maxLength(150)]);
      }else{
        this.frm.get('first_name')?.setValidators([ Validators.required, Validators.maxLength(75) ]);
        this.frm.get('last_name')?.setValidators([ Validators.required, Validators.maxLength(75) ]);
      }
      this.frm.updateValueAndValidity();
    });
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

  get request(): EntityCreateDto {
    const form = this.frm.value;

    return {
      type: form.type,
      name: form.name,
      first_name: form.first_name,
      last_name: form.last_name,
      document_type_id: form.document_type_id,
      document_number: form.document_number,
      ubigeo_id: form.district,
      address: form.address,
      country_id: form.country_id,
      is_internal: form.is_internal,
      role: this.role()
    };
  }

  // Events
  evtOnSubmit(): void{
    this.isSubmitted.set(true);
    if(this.frm.invalid){
      console.log(this.frm);
      return;
    }

    this.confirmationService.confirm({
        header: `¿Registrar ${this.role()}?`,
        message: 'Confirmar la operación.',
        accept: () => {
            const requestData = this.request;
            this.frm.disable();
            this.ldSubmit.set(true);
            
            const subs = this.api.postCreate(requestData)
            .pipe(finalize(() => {
              this.frm.enable();
              this.ldSubmit.set(false);
            }))
            .subscribe({
              next: () => {
                this.alertService.showToast({
                  position: 'top-end',
                  icon: "success",
                  title: `Se registro el ${this.role()} con éxito`,
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
    this.frm.get('document_number')?.clearValidators();
    this.frm.get('document_number')?.updateValueAndValidity();

    this.frm.get('document_number')?.addValidators(Validators.required);
    if(evt?.min) this.frm.get('document_number')?.addValidators(Validators.minLength(evt.min));
    if(evt?.max) this.frm.get('document_number')?.addValidators(Validators.maxLength(evt.max));
    this.frm.get('document_number')?.updateValueAndValidity();
  }

}
