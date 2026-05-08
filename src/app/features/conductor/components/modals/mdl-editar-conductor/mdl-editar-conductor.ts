import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, signal} from '@angular/core';
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
import { ConductorDto, EditarConductorRequestDto } from '@features/conductor/models/conductor.model';
import { ConductorApiService } from '@features/conductor/services/conductor-api.service';
import { OnlyNumberDirective } from 'app/core/directives/only-numbers.directive';
import { OnlyUpperDirective } from 'app/core/directives/only-uppers.directive';
@Component({
  selector: 'app-mdl-editar-conductor',
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
    SkeletonModule,
    OnlyNumberDirective,
    OnlyUpperDirective
  ],
  templateUrl: './mdl-editar-conductor.html',
  styleUrl: './mdl-editar-conductor.scss',
  providers: [ConfirmationService]
})
export class MdlEditarConductorComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() id!: number;
  @Output() OnSubmited: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() OnCreated: EventEmitter<ConductorDto> = new EventEmitter<ConductorDto>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();

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

  ldData = signal(false);
  data: ConductorDto | undefined;

  tipos: {value: string, label: string}[] = [
    {value: 'interno', label: 'INTERNO'},
    {value: 'externo', label: 'EXTERNO'}
  ];

  constructor(
    private fb: FormBuilder,
    public config: DynamicDialogConfig,
    private api: ConductorApiService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService
	) {
    this.frm = this.fb.group({
      codigo: new FormControl({value:null, disabled: true}),
      tipo_documento: new FormControl('DNI', Validators.required),
      numero_documento: new FormControl(null, Validators.required),
      nombres: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      apellidos: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      cargo: new FormControl(null),
      licencia: new FormControl(null, [Validators.required, Validators.minLength(9), Validators.maxLength(10)]),
      tipo: new FormControl('interno', [Validators.maxLength(20)])
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
    this.loadData();
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

  get request(): EditarConductorRequestDto {
    const form = this.frm.value;

    return {
      id: this.data!.id,
      tipo_documento: form.tipo_documento,
      numero_documento: form.numero_documento,
      nombres: form.nombres,
      apellidos: form.apellidos,
      cargo: form.cargo,
      licencia: form.licencia,
      tipo: form.tipo
    };
  }

  // Events
  evtOnSubmit(): void{
    this.isSubmitted = true;
    if(this.frm.invalid){
      return;
    }

    this.confirmationService.confirm({
        header: 'Editar Conductor?',
        message: 'Confirmar la operación.',
        accept: () => {

            const dataRequest = this.request;
            this.frm.disable();
            this.ldSubmit = true;
            this.OnSubmited.emit(true);
            
            const sub = this.api.editar(dataRequest)
            .pipe(finalize(() => {
              this.frm.enable();
              this.ldSubmit = false;
              this.OnSubmited.emit(false);
            }))
            .subscribe({
              next: (res: ConductorDto) => {
                this.alertService.showToast({
                  position: 'top-end',
                  icon: "success",
                  title: "Se editó el conductor con éxito",
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
    const sub = this.api.buscarPorId(this.id)
    .pipe(finalize(() => { this.ldData.set(false); }))
    .subscribe({
      next: (res: ConductorDto) => {
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
      }
    });
    this.subs.add(sub);
  }

  // handlers
  handlerLoadData(res: ConductorDto): void{
    this.data = res;
    this.frm.patchValue({
      codigo: 'COD-' + res.id.toString().padStart(4,'0'),
      tipo_documento: res.tipo_documento,
      numero_documento: res.numero_documento,
      nombres: res.nombres?.toString().toUpperCase(),
      apellidos: res.apellidos?.toString().toUpperCase(),
      cargo: res.cargo?.toString().toUpperCase(),
      licencia: res.licencia?.toString().toUpperCase(),
      tipo: res.tipo
    });
  }

}
