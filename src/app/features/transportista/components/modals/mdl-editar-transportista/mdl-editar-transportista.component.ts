import { AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, inject, signal } from '@angular/core';
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
import { EditarTransportistaRequestDto, TransportistaDto } from '@features/transportista/models/transportista';
import { TransportistaApiService } from '@features/transportista/services/transportista-api.service';

@Component({
  selector: 'app-mdl-editar-transportista',
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
    OnlyNumberDirective
  ],
  templateUrl: './mdl-editar-transportista.component.html',
  styleUrl: './mdl-editar-transportista.component.scss',
  providers: [ConfirmationService]
})
export class MdlEditarTransportistaComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {

  private api = inject(TransportistaApiService);
  private confirmationService = inject(ConfirmationService);
  private alertService = inject(AlertService);

  @Input() id!: number;
  @Output() OnCreated: EventEmitter<TransportistaDto> = new EventEmitter<TransportistaDto>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();

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
  data = signal<TransportistaDto | undefined>(undefined);

  constructor( public config: DynamicDialogConfig ) {}

  ngOnInit(): void {
    this.frm = new FormGroup({
      codigo: new FormControl({value:null, disabled: true}),
      tipo_documento: new FormControl(null, Validators.required),
      numero_documento: new FormControl(null, [Validators.required, Validators.minLength(11), Validators.maxLength(11)]),
      razon_social: new FormControl(null, [Validators.required, Validators.maxLength(200)]),
      departamento: new FormControl(null, Validators.required),
      provincia: new FormControl(null, Validators.required),
      distrito: new FormControl(null, Validators.required),
      direccion: new FormControl(null, [Validators.required, Validators.maxLength(250)]),
      email_contacto: new FormControl(null, [Validators.email, Validators.maxLength(100)]),
      pais: new FormControl('PE', [Validators.required, Validators.maxLength(3)]),
      codigo_sunat: new FormControl(null, [Validators.minLength(4), Validators.maxLength(4)]),
      registro_mtc: new FormControl(null, [Validators.maxLength(45)]),
    });
    this.f.codigo.disable();

    this.headerValue = this.config.header ?? '';

    this.loadData();
  }

  ngAfterViewInit(): void {
  }

  ngAfterViewChecked(): void{
    this.ctrlProvincia?.isLoaded.subscribe(() => { this.f.provincia.setValue(this.data()?.ubigeo_id!.substring(0,4)); });
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

  get request(): EditarTransportistaRequestDto {
    const form = this.frm.value;

    return {
      tipo_documento: form.tipo_documento,
      numero_documento: form.numero_documento,
      razon_social: form.razon_social,
      ubigeo_id: form.distrito,
      direccion: form.direccion,
      email_contacto: form.email_contacto,
      pais: form.pais,
      codigo_sunat: form.codigo_sunat,
      registro_mtc: form.registro_mtc
    };
  }

  get isLoading(): boolean{
    return this.ldSubmit() || 
    this.ldData() ||
    (this.ctrlDepartamento?.isLoading() ?? false) || 
    (this.ctrlProvincia?.isLoading() ?? false) || 
    (this.ctrlDistrito?.isLoading() ?? false);
  }

  // Events
  evtOnSubmit(): void{
    this.isSubmitted.set(true);
    if(this.frm.invalid){
      console.log(this.frm);
      return;
    }

    this.confirmationService.confirm({
        header: 'Editar transportista?',
        message: 'Confirmar la operación.',
        accept: () => {

            this.ldSubmit.set(true);
            
            const sub = this.api.editar(this.data()!.id, this.request).subscribe({
              next: (res: TransportistaDto) => {
                this.ldSubmit.set(false);

                this.alertService.showToast({
                  position: 'top-end',
                  icon: "success",
                  title: "Se edito al transportista con éxito",
                  showCloseButton: true,
                  timerProgressBar: true,
                  timer: 4000
                });

                this.OnCreated.emit(res);
              },
              error: (err: HttpErrorResponse) => {
                this.ldSubmit.set(false);
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
    const sub = this.api.obtener(this.id)
    .pipe(finalize(() => this.ldData.set(false)))
    .subscribe({
      next: (res: TransportistaDto) => {
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
  handlerLoadData(res: TransportistaDto): void{
    this.data.set(res);
    this.frm.patchValue({
      codigo: 'COD-' + res.id.toString().padStart(4,'0'),
      tipo_documento: res.tipo_documento,
      numero_documento: res.numero_documento,
      razon_social: res.razon_social?.toUpperCase(),
      direccion: res.direccion?.toUpperCase(),
      pais: res.pais,
      email_contacto: res.email_contacto,
      codigo_sunat: res.codigo_sunat,
      departamento: res.ubigeo_id?.substring(0,2),
    });
  }


}
