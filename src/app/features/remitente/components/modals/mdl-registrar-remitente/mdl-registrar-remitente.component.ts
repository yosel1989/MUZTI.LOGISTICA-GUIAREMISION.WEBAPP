import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, signal } from '@angular/core';
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
import { RegistrarRemitenteRequestDto, RegistrarRemitenteResponseDto } from '@features/remitente/models/remitente';
import { RemitenteApiService } from '@features/remitente/services/remitente-api.service';
import { OnlyNumberDirective } from 'app/core/directives/only-numbers.directive';
import { OnlyUpperDirective } from 'app/core/directives/only-uppers.directive';
import { DividerModule } from 'primeng/divider';
import { EmpresaToSelectDto } from '@features/empresa/models/empresa.model';
import { SkeletonModule } from 'primeng/skeleton';
import { EmpresaApiService } from '@features/empresa/services/empresa-api.service';

@Component({
  selector: 'app-mdl-registrar-remitente',
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
    DividerModule,
    SkeletonModule
  ],
  templateUrl: './mdl-registrar-remitente.component.html',
  styleUrl: './mdl-registrar-remitente.component.scss',
  providers: [ConfirmationService]
})
export class MdlRegistrarRemitenteComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() OnCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();

  frm: FormGroup = new FormGroup({});
  isSubmitted = signal(false);
  ldSubmit: boolean = false;

  private subs = new Subscription();

  headerValue: string = '';
  estados: {id: number, label: string}[] = [
    {id: 0, label: 'Inactivo'},
    {id: 1, label: 'Activo'}
  ];

  ldEmpresa = signal(false);
  empresas: EmpresaToSelectDto[] = [];

  constructor(
    private fb: FormBuilder,
    public config: DynamicDialogConfig,
    private api: RemitenteApiService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService,
    private empresaApiService: EmpresaApiService
	) {
    this.frm = this.fb.group({
      ruc: new FormControl(null, [Validators.required, Validators.minLength(11), Validators.maxLength(11)]),
      descripcion: new FormControl(null, [Validators.required, Validators.maxLength(200)]),
      departamento: new FormControl(null, Validators.required),
      provincia: new FormControl(null, Validators.required),
      distrito: new FormControl(null, Validators.required),
      direccion: new FormControl(null, [Validators.required, Validators.maxLength(250)]),
      email: new FormControl(null, [Validators.email, Validators.maxLength(100)]),
      pais: new FormControl('PE', [Validators.required, Validators.maxLength(3)]),
      serie: new FormControl(null, [Validators.minLength(3), Validators.maxLength(3)]),
      codigo_sunat: new FormControl(null, [Validators.required, Validators.minLength(4), Validators.maxLength(4)])
    });

    this.headerValue = this.config.header ?? '';
  }

  ngOnInit(): void {
    this.loadEmpresas();
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

  get request(): RegistrarRemitenteRequestDto {
    const form = this.frm.value;

    return {
      ruc: form.ruc,
      descripcion: form.descripcion,
      ubigeo_id: form.distrito,
      direccion: form.direccion,
      email: form.email,
      pais: form.pais,
      serie: form.serie,
      codigo_sunat: form.codigo_sunat,
      empleado_id_creacion: 1,
      empleado_nombre_creacion: 'SA'
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
        header: '¿Registrar remitente?',
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
                  title: "Se registro el remitente con éxito",
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

  // Data
  loadEmpresas(): void{
    this.ldEmpresa.set(true);
    this.subs.add(
      this.empresaApiService.loadAllToSelect().subscribe({
        next: (value: EmpresaToSelectDto[]) => {
          this.empresas = value;
          this.ldEmpresa.set(false);
        },
        error: (err: any) => {
          console.error(err);
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
          this.ldEmpresa.set(false);
        },
      })
    )
  }

}