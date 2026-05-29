import { AfterViewChecked, AfterViewInit, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal, ViewChild } from '@angular/core';
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
import { ProveedorDto, EditarProveedorRequestDto } from '@features/proveedor/models/proveedor';
import { SelectModule } from 'primeng/select';
import { DocumentEntityType } from '@features/items/models/document-entity-type';
import { FAKE_DOCUMENT_TYPE_PROVIDER } from 'app/fake/items/data/fakeDocumenType';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from 'app/core/services/alert.service';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectDepartamentoComponent } from '@features/ubigeo/components/selects/select-departamento/select-departamento';
import { SelectProvinciaComponent } from '@features/ubigeo/components/selects/select-provincia/select-provincia';
import { SelectDistritoComponent } from '@features/ubigeo/components/selects/select-distrito/select-distrito';
import { OnlyNumberDirective } from 'app/core/directives/only-numbers.directive';
import { OnlyUpperDirective } from 'app/core/directives/only-uppers.directive';
import { TipoDocumentoDTO } from '@features/catalogo/models/catalogo.model';
import { SelectTipoDocumentoComponent } from '@features/catalogo/components/selects/select-tipo-documento/select-tipo-documento';
import { ResponseDTO } from '@features/shared/models/shared';

@Component({
  selector: 'app-mdl-editar-proveedor',
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
    SkeletonModule,
    OnlyNumberDirective,
    OnlyUpperDirective,
    SelectTipoDocumentoComponent
  ],
  templateUrl: './mdl-editar-proveedor.component.html',
  styleUrl: './mdl-editar-proveedor.component.scss',
  providers: [ConfirmationService]
})
export class MdlEditarProveedorComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {

  private api = inject(ProveedorApiService);
  private confirmationService = inject(ConfirmationService);
  private alertService = inject(AlertService);

  @Input() id!: number;
  @Output() OnCreated: EventEmitter<ProveedorDto> = new EventEmitter<ProveedorDto>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('tipoDocumento') tipoDocumento: SelectTipoDocumentoComponent | undefined;
  @ViewChild('departamento') ctrlDepartamento: SelectDepartamentoComponent | undefined;
  @ViewChild('provincia') ctrlProvincia: SelectProvinciaComponent | undefined;
  @ViewChild('distrito') ctrlDistrito: SelectDistritoComponent | undefined;

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

  ldData = signal(false);
  data = signal<ProveedorDto | undefined>(undefined);

  constructor(
    public config: DynamicDialogConfig
	) {
    this.frm = new FormGroup({
      codigo: new FormControl({value:null, disabled: true}),
      tipo_documento_id: new FormControl(null, Validators.required),
      numero_documento: new FormControl(null, Validators.required),
      razon_social: new FormControl(null, [Validators.required, Validators.maxLength(200)]),
      departamento: new FormControl(null, Validators.required),
      provincia: new FormControl(null, Validators.required),
      distrito: new FormControl(null, Validators.required),
      direccion: new FormControl(null, [Validators.required, Validators.maxLength(250)]),
      email: new FormControl(null, [Validators.email, Validators.maxLength(50)]),
      pais: new FormControl('PE', [Validators.minLength(1), Validators.maxLength(3), Validators.required]),
      codigo_sunat: new FormControl(null, [Validators.maxLength(4), Validators.minLength(4)])
    });

    this.headerValue = this.config.header ?? '';

  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
  }

  ngAfterViewChecked(): void{
    this.ctrlProvincia?.isLoaded.subscribe(() => { this.f.provincia.setValue(this.data()?.ubigeo_id.substring(0,4));});
    this.ctrlDistrito?.isLoaded.subscribe(() => { this.f.distrito.setValue(this.data()?.ubigeo_id);});
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // Getters

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get f(): any {
    return this.frm.controls;
  }

  get request(): EditarProveedorRequestDto {
    const form = this.frm.value;

    return {
      id: this.data()!.id,
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
    this.submitted.set(true);
    if(this.frm.invalid){
      console.log(this.frm);
      return;
    }

    this.confirmationService.confirm({
        header: 'Editar proveedor?',
        message: 'Confirmar la operación.',
        accept: () => {

            this.ldSubmit.set(true);
            
            const sub = this.api.editar(this.request)
            .pipe(finalize(() => { 
              this.ldSubmit.set(false);
              this.submitted.set(false);
            }))
            .subscribe({
              next: (res: ResponseDTO<ProveedorDto>) => {

                this.alertService.showToast({
                  position: 'top-end',
                  icon: "success",
                  title: res.detalle,
                  showCloseButton: true,
                  timerProgressBar: true,
                  timer: 4000
                });

                this.OnCreated.emit(res.data);
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
            this.subs.add(sub);
           
        }
    });
  }

  evtOnClose(): void {
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

  // data

  loadData(): void{
    this.ldData.set(true);
    const sub = this.api.obtenerPorId(this.id)
    .pipe(finalize(() => { this.ldData.set(false) }))
    .subscribe({
      next: (res: ProveedorDto) => {
        this.handlerLoadData(res);
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
        this.OnCanceled.emit(true);
      }
    });
    this.subs.add(sub);
  }


  // handlers

  handlerLoadData(res: ProveedorDto): void{
    this.data.set(res);
    this.frm.patchValue({
      codigo: 'COD-' + res.id.toString().padStart(4,'0'),
      tipo_documento_id: res.tipo_documento_id,
      numero_documento: res.numero_documento,
      razon_social: res.razon_social?.toUpperCase(),
      departamento: res.ubigeo_id.substring(0,2),
      direccion: res.direccion?.toUpperCase(),
      email: res.email?.toUpperCase(),
      pais: res.pais,
      codigo_sunat: res.codigo_sunat
    });
  }



}
