import { AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
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
import { BehaviorSubject, Subscription } from 'rxjs';
import { ProveedorApiService } from '@features/proveedor/services/proveedor-api.service';
import { ProveedorDto, EditarProveedorRequestDto, EditarProveedorResponseDto } from '@features/proveedor/models/proveedor';
import { SelectModule } from 'primeng/select';
import { DocumentEntityType } from '@features/items/models/document-entity-type';
import { FAKE_DOCUMENT_TYPE_PROVIDER } from 'app/fake/items/data/fakeDocumenType';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from 'app/core/services/alert.service';
import { SkeletonModule } from 'primeng/skeleton';
import { AsyncPipe } from '@angular/common';
import { SelectDepartamentoComponent } from '@features/ubigeo/components/selects/select-departamento/select-departamento';
import { SelectProvinciaComponent } from '@features/ubigeo/components/selects/select-provincia/select-provincia';
import { SelectDistritoComponent } from '@features/ubigeo/components/selects/select-distrito/select-distrito';

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
    AsyncPipe
  ],
  templateUrl: './mdl-editar-proveedor.component.html',
  styleUrl: './mdl-editar-proveedor.component.scss',
  providers: [ConfirmationService]
})
export class MdlEditarProveedorComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {

  @Input() id!: number;
  @Output() OnCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('departamento') ctrlDepartamento: SelectDepartamentoComponent | undefined;
  @ViewChild('provincia') ctrlProvincia: SelectProvinciaComponent | undefined;
  @ViewChild('distrito') ctrlDistrito: SelectDistritoComponent | undefined;

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

  ldData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  $ldData = this.ldData.asObservable();
  data: ProveedorDto | undefined;

  constructor(
    private fb: FormBuilder,
    public config: DynamicDialogConfig,
    private api: ProveedorApiService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService
	) {
    this.frm = this.fb.group({
      codigo: new FormControl({value:null, disabled: true}),
      tipo_documento: new FormControl('DNI', Validators.required),
      numero_documento: new FormControl(null, Validators.required),
      razon_social: new FormControl(null, [Validators.required, Validators.maxLength(200)]),
      departamento: new FormControl(null, Validators.required),
      provincia: new FormControl(null, Validators.required),
      distrito: new FormControl(null, Validators.required),
      direccion: new FormControl(null, [Validators.required, Validators.maxLength(250)]),
      email: new FormControl(null, [Validators.required, Validators.email, Validators.maxLength(50)]),
      pais: new FormControl('PE', [Validators.minLength(1), Validators.maxLength(3), Validators.required]),
      codigo_sunat: new FormControl(null, [Validators.maxLength(4), Validators.minLength(4)])
    });
    this.f.codigo.disable();

    this.headerValue = this.config.header ?? '';
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
  }

  ngAfterViewChecked(): void{
    
    this.ctrlProvincia?.isLoaded.subscribe(val => { this.f.provincia.setValue(this.data?.ubigeo_id.substring(0,4));});
    this.ctrlDistrito?.isLoaded.subscribe(val => { this.f.distrito.setValue(this.data?.ubigeo_id);});
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // Getters
  get f(): any {
    return this.frm.controls;
  }

  get request(): EditarProveedorRequestDto {
    const form = this.frm.value;

    return {
      id: this.data!.id,
      tipo_documento: form.tipo_documento,
      numero_documento: form.numero_documento,
      razon_social: form.razon_social,
      ubigeo_id: form.distrito,
      direccion: form.direccion,
      email: form.email,
      pais: form.pais,
      codigo_sunat: form.codigo_sunat,
      empleado_id_edicion: 1,
      empleado_nombre_edicion: 'SA'
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
        header: 'Editar proveedor?',
        message: 'Confirmar la operación.',
        accept: () => {

            this.frm.disable();
            this.ldSubmit = true;
            
            const sub = this.api.editar(this.request).subscribe({
              next: (res: EditarProveedorResponseDto) => {
                this.frm.enable();
                this.ldSubmit = false;

                this.alertService.showToast({
                  position: 'bottom-end',
                  icon: "success",
                  title: "Se edito el proveedor con éxito",
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
            this.subs.add(sub);
           
        },
        reject: () => {
            
        },
    });
  }

  evtOnClose(): void{
    this.OnCanceled.emit(true);
  }

  // data
  loadData(): void{
    this.ldData.next(true);
    this.frm.disable();
    const sub = this.api.obtenerPorId(this.id).subscribe({
      next: (res: ProveedorDto) => {
        this.handlerLoadData(res);
        this.ldData.next(false);
        this.frm.enable();
      },
      error: (err: HttpErrorResponse) => {
        this.frm.enable();
        this.ldData.next(false);
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
    this.subs.add(sub);
  }


  // handlers
  handlerLoadData(res: ProveedorDto): void{
    this.data = res;
    this.frm.patchValue({
      codigo: 'COD-' + res.id.toString().padStart(4,'0'),
      tipo_documento: res.tipo_documento,
      numero_documento: res.numero_documento,
      razon_social: res.razon_social,
      departamento: res.ubigeo_id.substring(0,2),
      direccion: res.direccion,
      email: res.email,
      pais: res.pais,
      codigo_sunat: res.codigo_sunat
    });
  }


}
