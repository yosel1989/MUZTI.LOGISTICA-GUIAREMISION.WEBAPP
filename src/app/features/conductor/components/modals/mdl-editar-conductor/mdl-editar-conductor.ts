import { AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
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
import { BehaviorSubject, Subscription } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { DocumentEntityType } from '@features/items/models/document-entity-type';
import { FAKE_DOCUMENT_TYPE_PROVIDER } from 'app/fake/items/data/fakeDocumenType';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from 'app/core/services/alert.service';
import { SkeletonModule } from 'primeng/skeleton';
import { AsyncPipe } from '@angular/common';
import { ConductorDto, EditarConductorRequestDto, EditarConductorResponseDto } from '@features/conductor/models/conductor.model';
import { ConductorApiService } from '@features/conductor/services/conductor-api.service';
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
    AsyncPipe
  ],
  templateUrl: './mdl-editar-conductor.html',
  styleUrl: './mdl-editar-conductor.scss',
  providers: [ConfirmationService]
})
export class MdlEditarConductorComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() id!: number;
  @Output() OnCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
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

  ldData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  $ldData = this.ldData.asObservable();
  data: ConductorDto | undefined;

  constructor(
    private fb: FormBuilder,
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
    });

    this.headerValue = this.config.header ?? '';
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
        header: 'Editar Conductor?',
        message: 'Confirmar la operación.',
        accept: () => {

            this.frm.disable();
            this.ldSubmit = true;
            
            const subs = this.api.editar(this.request).subscribe({
              next: (res: EditarConductorResponseDto) => {
                this.frm.enable();
                this.ldSubmit = false;

                this.alertService.showToast({
                  position: 'bottom-end',
                  icon: "success",
                  title: "Se edito el conductor con éxito",
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


  // data
  loadData(): void{
    this.ldData.next(true);
    this.frm.disable();
    this.api.obtener(this.id).subscribe({
      next: (res: ConductorDto) => {
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
    })
  }


  // handlers
  handlerLoadData(res: ConductorDto): void{
    this.data = res;
    this.frm.patchValue({
      tipo_documento: res.tipo_documento,
      numero_documento: res.numero_documento,
      nombres: res.nombres,
      apellidos: res.apellidos,
      cargo: res.cargo,
      licencia: res.licencia
    });
  }


}
