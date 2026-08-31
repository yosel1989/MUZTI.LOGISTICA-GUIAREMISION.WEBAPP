import { AfterViewInit, Component, DestroyRef, EventEmitter, inject, input, OnDestroy, OnInit, Output, signal } from '@angular/core';
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
import { SelectCountry } from '@features/catalogo/components/selects/select-country/select-country';
import { EntityInfoApiService } from '@features/entity-info/services/entity-info-api-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CompanyInfoDto, PersonInfoDto } from '@features/entity-info/models/entity-info';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CheckboxModule } from 'primeng/checkbox';


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
    SelectCountry,
    TooltipModule,
    ToggleSwitchModule,
    CheckboxModule
  ],
  templateUrl: './mdl-entity-create.html',
  styleUrl: './mdl-entity-create.scss',
  providers: [ConfirmationService]
})
export class MdlEntityCreate implements OnInit, AfterViewInit, OnDestroy {

  private destroyRef = inject(DestroyRef);
  private api = inject(EntityApiService);
  private confirmationService = inject(ConfirmationService);
  private alertService = inject(AlertService);
  private entityInfoApiService = inject(EntityInfoApiService);

  @Output() OnCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();
  role = input.required<'cliente' | 'proveedor' | 'transportista' | 'emisor'>();

  frm: FormGroup = new FormGroup({});
  isSubmitted = signal(false);
  ldSubmit = signal(false);

  private subs = new Subscription();
  
  submitted = signal(false);
  ldInfo = signal(false);

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
      code_sunat: new FormControl(null, [Validators.maxLength(4), Validators.minLength(4)]),
      is_internal:  new FormControl(true, Validators.required),
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
      return;
    }

    this.confirmationService.confirm({
        header: `¿Registrar ${this.role()}?`,
        message: 'Confirmar la operación.',
        accept: () => {
            const requestData = this.request;
            this.ldSubmit.set(true);
            
            const subs = this.api.postCreate(requestData)
            .pipe(finalize(() => {
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

  evtSearchEntityInfo(): void{
    if(this.f.country_id.value !== 135){
      this.alertService.showToast({
        position: 'top-end',
        icon: "warning",
        title: "Solo se pueden consultar datos de Perú",
      });

      return;
    }

    if(!(this.f.document_type_id.value === 1 || this.f.document_type_id.value === 4)){
      this.alertService.showToast({
        position: 'top-end',
        icon: "warning",
        title: "Solo se pueden consultar datos con DNI o RUC",
      });

      return;
    }

    if( this.f.document_number.invalid ){
      this.alertService.showToast({
        position: 'top-end',
        icon: "warning",
        title: "El número de documento debe ser válido",
      });

      return;
    }

    if(this.f.document_type_id.value === 1){
      this.handlerFindPersonInfo(this.f.document_number.value);
    }else{
      this.handlerFindCompanyInfo(this.f.document_number.value);
    }

  }

  // Handlers


  handlerFindPersonInfo(documentNumber: string): void{
    this.ldInfo.set(true);
    this.entityInfoApiService.getPersonInfo(documentNumber)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.ldInfo.set(false))
      )
      .subscribe({
        next : (value: PersonInfoDto) => {
           this.frm.patchValue({
              document_number: value.document_number,
              first_name: value.first_name,
              last_name: value.last_name
           })
        },
        error: (err: HttpErrorResponse) => {
          this.alertService.showToast({
            position: 'top-end',
            title: err.error.detalle,
            icon: 'error'
          })
        },
      })
  }

  handlerFindCompanyInfo(documentNumber: string): void{
    this.ldInfo.set(true);
    this.entityInfoApiService.getCompanyInfo(documentNumber)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.ldInfo.set(false))
      )
      .subscribe({
        next : (value: CompanyInfoDto) => {
           this.frm.patchValue({
              document_number: value.document_number,
              name: value.name,
              address: value.address
           })
        },
        error: (err: HttpErrorResponse) => {
          this.alertService.showToast({
            position: 'top-end',
            title: err.error.detalle,
            icon: 'error'
          })
        },
      })
  }

}
