import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
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
import { SelectModule } from 'primeng/select';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from 'app/core/services/alert.service';
import { SkeletonModule } from 'primeng/skeleton';
import { AsyncPipe } from '@angular/common';
import { EditarUnidadTransporteRequestDto, EditarUnidadTransporteResponseDto, UnidadTransporteDto } from '@features/unidad-transporte/models/unidad-transporte.model';
import { UnidadTransporteApiService } from '@features/unidad-transporte/services/unidad-transporte-api.service';
import { SelectEmisorVehicularComponent } from '@features/catalogo/components/selects/select-emisor-vehicular/select-emisor-vehicular';
import { OnlyUpperDirective } from 'app/core/directives/only-uppers.directive';
@Component({
  selector: 'app-mdl-editar-unidad-transporte',
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
    AsyncPipe,
    SelectEmisorVehicularComponent,
    OnlyUpperDirective
  ],
  templateUrl: './mdl-editar-unidad-transporte.html',
  styleUrl: './mdl-editar-unidad-transporte.scss',
  providers: [ConfirmationService]
})
export class MdlEditarUnidadTransporteComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @ViewChild('ctrlEmisorVehicular') ctrlEmisorVehicular: SelectEmisorVehicularComponent | undefined;
  @Input() id!: number;
  @Output() OnCreated: EventEmitter<UnidadTransporteDto | undefined> = new EventEmitter<UnidadTransporteDto | undefined>(undefined);
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

  ldUpdate: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  ldData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  $ldData = this.ldData.asObservable();
  data: UnidadTransporteDto | undefined;

  constructor(
    private fb: FormBuilder,
    public config: DynamicDialogConfig,
    private api: UnidadTransporteApiService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService
	) {
    this.frm = this.fb.group({
      codigo: new FormControl({value:null, disabled: true}),
      descripcion: new FormControl(null, Validators.maxLength(50)),
      marca: new FormControl(null, Validators.maxLength(20)),
      modelo: new FormControl(null, Validators.maxLength(20)),
      placa: new FormControl(null, [Validators.required, Validators.maxLength(8), Validators.pattern('^[A-Z0-9]{6,8}$')]),
      tarjeta: new FormControl(null, [Validators.maxLength(20)]),
      cod_emisor_vehicular: new FormControl(null, [Validators.maxLength(2)]),
      emisor_vehicular: new FormControl(null, [Validators.minLength(2), Validators.maxLength(100)]),
      nro_autorizacion: new FormControl(null, [Validators.minLength(3), Validators.maxLength(50)]),
      //tipo: new FormControl('INTERNO', [Validators.maxLength(20)]),
      empleado_id_creacion: new FormControl(null),
      empleado_nombre_creacion: new FormControl(null)
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

  get request(): EditarUnidadTransporteRequestDto {
    const form = this.frm.value;

    return {
      descripcion: form.descripcion,
      marca: form.marca,
      modelo: form.modelo,
      placa: form.placa,
      tarjeta: form.tarjeta,
      cod_emisor_vehicular: form.cod_emisor_vehicular,
      emisor_vehicular: this.ctrlEmisorVehicular?.selected?.abreviatura ?? null,
      nro_autorizacion: form.nro_autorizacion,
      empleado_id_edicion: 1,
      empleado_nombre_edicion: 'SA'
    };
  }

  // Events
  evtOnSubmit(): void{
    this.isSubmitted = true;
    if(this.frm.invalid){
      return;
    }

    this.confirmationService.confirm({
        header: 'Editar Unidad de Transporte?',
        message: 'Confirmar la operación.',
        accept: () => {

            this.ldSubmit = true;
            this.ldUpdate.next(true);
            
            const subs = this.api.editar(this.data!.id, this.request).subscribe({
              next: (res: UnidadTransporteDto) => {
                this.ldSubmit = false;
                this.ldUpdate.next(false);

                this.alertService.showToast({
                  position: 'bottom-end',
                  icon: "success",
                  title: "Se edito la unidad de transporte con éxito",
                  showCloseButton: true,
                  timerProgressBar: true,
                  timer: 4000
                });

                this.OnCreated.emit(res);
              },
              error: (err: HttpErrorResponse) => {
                this.ldUpdate.next(false);
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


  // data
  loadData(): void{
    this.ldData.next(true);
    this.frm.disable();
    const sub = this.api.getById(this.id).subscribe({
      next: (res: UnidadTransporteDto) => {
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
  handlerLoadData(res: UnidadTransporteDto): void{
    this.data = res;
    this.frm.patchValue({
      codigo: 'COD-' + res.id.toString().padStart(4,'0'),
      descripcion: res.descripcion,
      marca: res.marca,
      modelo: res.modelo,
      placa: res.placa,
      tarjeta: res.tarjeta,
      cod_emisor_vehicular: res.cod_emisor_vehicular,
      emisor_vehicular: res.emisor_vehicular,
      nro_autorizacion: res.nro_autorizacion
    });
  }


}
