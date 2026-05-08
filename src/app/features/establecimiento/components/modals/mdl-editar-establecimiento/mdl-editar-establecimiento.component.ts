import { AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, inject, signal } from '@angular/core';
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
import { SelectModule } from 'primeng/select';
import { DocumentEntityType } from '@features/items/models/document-entity-type';
import { FAKE_DOCUMENT_TYPE_PROVIDER } from 'app/fake/items/data/fakeDocumenType';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from 'app/core/services/alert.service';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectDepartamentoComponent } from '@features/ubigeo/components/selects/select-departamento/select-departamento';
import { SelectProvinciaComponent } from '@features/ubigeo/components/selects/select-provincia/select-provincia';
import { SelectDistritoComponent } from '@features/ubigeo/components/selects/select-distrito/select-distrito';
import { DividerModule } from 'primeng/divider';
import { OnlyNumberDirective } from "app/core/directives/only-numbers.directive";
import { EmpresaApiService } from '@features/empresa/services/empresa-api.service';
import { EmpresaToSelectDto } from '@features/empresa/models/empresa.model';
import { CatalogoApiService } from '@features/catalogo/services/catalogo-api.service';
import { TipoEstablecimientoDTO } from '@features/catalogo/models/catalogo.model';
import { EditarEstablecimientoRequestDTO, EstablecimientoDTO } from '@features/establecimiento/models/establecimiento.model';
import { EstablecimientoApiService } from '@features/establecimiento/services/establecimiento.service';
import { OnlyUpperDirective } from '@core/directives/only-uppers.directive';

@Component({
  selector: 'app-mdl-editar-establecimiento',
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
    DividerModule,
    OnlyNumberDirective,
    OnlyUpperDirective
],
  templateUrl: './mdl-editar-establecimiento.component.html',
  styleUrl: './mdl-editar-establecimiento.component.scss',
  providers: [ConfirmationService]
})
export class MdlEditarEstablecimientoComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {

  private api = inject(EstablecimientoApiService);
  private confirmationService = inject(ConfirmationService);
  private alertService = inject(AlertService);
  private empresaApiService = inject(EmpresaApiService);
  private catalogoApiService = inject(CatalogoApiService);

  @Input() id!: number;
  @Output() OnCreated: EventEmitter<EstablecimientoDTO> = new EventEmitter<EstablecimientoDTO>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('departamento') ctrlDepartamento: SelectDepartamentoComponent | undefined;
  @ViewChild('provincia') ctrlProvincia: SelectProvinciaComponent | undefined;
  @ViewChild('distrito') ctrlDistrito: SelectDistritoComponent | undefined;

  frm: FormGroup = new FormGroup({});
  isSubmitted = signal(false);
  ldSubmit = signal(false);

  private subs = new Subscription();
  
  documentTypes: DocumentEntityType[] = FAKE_DOCUMENT_TYPE_PROVIDER;
  submitted: boolean = false;


  headerValue: string = '';
  estados: {id: number, label: string}[] = [
    {id: 0, label: 'Inactivo'},
    {id: 1, label: 'Activo'}
  ];

  ldData = signal(false);
  data: EstablecimientoDTO | undefined;

  ldEmpresa = signal(false);
  empresas: EmpresaToSelectDto[] = [];

  tiposEstablecimiento: TipoEstablecimientoDTO[] = [];
  ldTipoEstablecimiento = signal(false);

  constructor(
    private fb: FormBuilder,
    public config: DynamicDialogConfig
	) {
    this.frm = this.fb.group({
      codigo: new FormControl({value:null, disabled: true}),
      ruc: new FormControl(null, [Validators.required, Validators.minLength(11), Validators.maxLength(11)]),
      descripcion: new FormControl(null, [Validators.required, Validators.maxLength(200)]),
      departamento: new FormControl(null, Validators.required),
      provincia: new FormControl(null, Validators.required),
      distrito: new FormControl(null, Validators.required),
      direccion: new FormControl(null, [Validators.required, Validators.maxLength(250)]),
      email: new FormControl(null, [Validators.email, Validators.maxLength(100)]),
      pais: new FormControl('PE', [Validators.required, Validators.maxLength(3)]),
      serie: new FormControl(null, [Validators.minLength(3), Validators.maxLength(3)]),
      codigo_sunat: new FormControl(null, [Validators.minLength(4), Validators.maxLength(4)]),
      tipo: new FormControl(null, Validators.required),
    });
    this.f.codigo.disable();

    this.headerValue = this.config.header ?? '';
  }

  ngOnInit(): void {
    this.loadData();
    this.loadEmpresas();
    this.loadTiposEstablecimiento();
  }

  ngAfterViewInit(): void {
  }

  ngAfterViewChecked(): void{
    this.ctrlProvincia?.isLoaded.subscribe(val => { this.f.provincia.setValue(this.data?.ubigeo_id.substring(0,4)); });
    this.ctrlDistrito?.isLoaded.subscribe(val => { this.f.distrito.setValue(this.data?.ubigeo_id);});
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // Getters
  get f(): any {
    return this.frm.controls;
  }

  get request(): EditarEstablecimientoRequestDTO {
    const form = this.frm.value;

    return {
      establecimiento_id: this.id,
      ruc: form.ruc,
      descripcion: form.descripcion,
      ubigeo_id: form.distrito,
      direccion: form.direccion,
      email: form.email,
      pais: form.pais,
      serie: form.serie,
      codigo_sunat: form.codigo_sunat,
      tipo: form.tipo
    };
  }

  get isLoading(): boolean{
    return this.ldSubmit() || 
    this.ldData() ||
    (this.ctrlDepartamento?.isLoading ?? false) || 
    (this.ctrlProvincia?.isLoading ?? false) || 
    (this.ctrlDistrito?.isLoading ?? false);
  }

  // Events
  evtOnSubmit(): void{
    this.isSubmitted.set(true);
    if(this.frm.invalid){
      console.log(this.frm);
      return;
    }

    this.confirmationService.confirm({
        header: 'Editar establecimiento?',
        message: 'Confirmar la operación.',
        accept: () => {

            this.ldSubmit.set(true);
            
            const sub = this.api.editar(this.data!.id, this.request)
            .pipe(finalize(() => { this.ldSubmit.set(false) }))
            .subscribe({
              next: (res: EstablecimientoDTO) => {

                this.alertService.showToast({
                  position: 'top-end',
                  icon: "success",
                  title: "Se edito el establecimiento con éxito",
                  showCloseButton: true,
                  timerProgressBar: true,
                  timer: 4000
                });

                this.OnCreated.emit(res);
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
    this.ldData.set(true);
    const sub = this.api.getById(this.id)
    .pipe(finalize(() => this.ldData.set(false)))
    .subscribe({
      next: (res: EstablecimientoDTO) => {
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
            popup: 'z-[9999]!'
          }
        });
        this.OnCanceled.emit(true);
      }
    });
    this.subs.add(sub);
  }


  loadEmpresas(): void{
    this.ldEmpresa.set(true);
    this.subs.add(
      this.empresaApiService.loadAllToSelect()
      .pipe(finalize(() => { this.ldEmpresa.set(false); }))
      .subscribe({
        next: (value: EmpresaToSelectDto[]) => {
          this.empresas = value;
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
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
        },
      })
    )
  }

  loadTiposEstablecimiento(): void{
    this.ldTipoEstablecimiento.set(true);
    this.subs.add(
      this.catalogoApiService.getTipoEstablecimiento()
      .pipe(finalize(() => { this.ldTipoEstablecimiento.set(false) }))
      .subscribe({
        next: (value: TipoEstablecimientoDTO[]) => {
          this.tiposEstablecimiento = value;
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
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
        },
      })
    )
  }


  // handlers
  handlerLoadData(res: EstablecimientoDTO): void{
    this.data = res;
    this.frm.patchValue({
      codigo: 'COD-' + res.id.toString().padStart(4,'0'),
      ruc: res.ruc,
      descripcion: res.descripcion.toUpperCase(),
      direccion: res.direccion.toUpperCase(),
      email: res.email?.toUpperCase(),
      pais: res.pais,
      serie: res.serie,
      codigo_sunat: res.codigo_sunat,
      departamento: res.ubigeo_id.substring(0,2),
      tipo: res.tipo
    });
  }


}
