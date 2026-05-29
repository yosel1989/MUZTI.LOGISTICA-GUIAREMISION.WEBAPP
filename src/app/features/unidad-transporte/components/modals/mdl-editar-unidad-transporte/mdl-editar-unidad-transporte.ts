import { AfterViewInit, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal, ViewChild} from '@angular/core';
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
import { SkeletonModule } from 'primeng/skeleton';
import { EditarUnidadTransporteRequestDto, UnidadTransporteDto } from '@features/unidad-transporte/models/unidad-transporte.model';
import { UnidadTransporteApiService } from '@features/unidad-transporte/services/unidad-transporte-api.service';
import { SelectEmisorVehicularComponent } from '@features/catalogo/components/selects/select-emisor-vehicular/select-emisor-vehicular';
import { OnlyUpperDirective } from 'app/core/directives/only-uppers.directive';
import { ResponseDTO } from '@features/shared/models/shared';
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
    SelectEmisorVehicularComponent,
    OnlyUpperDirective
  ],
  templateUrl: './mdl-editar-unidad-transporte.html',
  styleUrl: './mdl-editar-unidad-transporte.scss',
  providers: [ConfirmationService]
})
export class MdlEditarUnidadTransporteComponent implements OnInit, AfterViewInit, OnDestroy {

  private api = inject(UnidadTransporteApiService);
  private confirmationService = inject(ConfirmationService);
  private alertService = inject(AlertService);

  @ViewChild('ctrlEmisorVehicular') ctrlEmisorVehicular: SelectEmisorVehicularComponent | undefined;
  @Input() id!: number;
  @Output() OnCreated: EventEmitter<UnidadTransporteDto | undefined> = new EventEmitter<UnidadTransporteDto | undefined>(undefined);
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();

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

  tipos: {value: string, label: string}[] = [
    {value: 'interno', label: 'INTERNO'},
    {value: 'externo', label: 'EXTERNO'}
  ];

  ldUpdate = signal(false);
  ldData = signal(false);
  data = signal<UnidadTransporteDto | undefined>(undefined);

  constructor( public config: DynamicDialogConfig ) { }

  ngOnInit(): void {
    this.frm = new FormGroup({
      codigo: new FormControl({value:null, disabled: true}),
      descripcion: new FormControl(null, Validators.maxLength(50)),
      marca: new FormControl(null, Validators.maxLength(20)),
      modelo: new FormControl(null, Validators.maxLength(20)),
      placa: new FormControl(null, [Validators.required, Validators.maxLength(8), Validators.pattern('^[A-Z0-9]{6,8}$')]),
      tarjeta: new FormControl(null, [Validators.maxLength(20)]),
      cod_emisor_vehicular: new FormControl(null, [Validators.maxLength(2)]),
      emisor_vehicular: new FormControl(null, [Validators.minLength(2), Validators.maxLength(100)]),
      nro_autorizacion: new FormControl(null, [Validators.minLength(3), Validators.maxLength(50)]),
      tipo: new FormControl('interno', [Validators.maxLength(20)])
    });

    this.headerValue = this.config.header ?? '';

    this.loadData();
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

  get request(): EditarUnidadTransporteRequestDto {
    const form = this.frm.value;

    return {
      descripcion: form.descripcion,
      marca: form.marca,
      modelo: form.modelo,
      placa: form.placa,
      tarjeta: form.tarjeta,
      cod_emisor_vehicular: form.cod_emisor_vehicular,
      emisor_vehicular: this.ctrlEmisorVehicular?.selected()?.abreviatura ?? null,
      nro_autorizacion: form.nro_autorizacion,
      tipo: form.tipo
    };
  }

  // Events
  evtOnSubmit(): void{
    this.isSubmitted.set(true);
    this.submitted.set(true);
    if(this.frm.invalid){
      return;
    }

    this.confirmationService.confirm({
        header: 'Editar Unidad de Transporte?',
        message: 'Confirmar la operación.',
        accept: () => {

            this.ldSubmit.set(true);
            this.ldUpdate.set(true);
            
            const subs = this.api.editar(this.data()!.id, this.request)
            .pipe(finalize(() => {
                this.ldSubmit.set(false);
                this.ldUpdate.set(false);
            }))
            .subscribe({
              next: (res: ResponseDTO<UnidadTransporteDto>) => {

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
            this.subs.add(subs);
           
        }
    });
  }

  evtOnClose(): void{
    this.OnCanceled.emit(true);
  }


  // data
  loadData(): void{
    this.ldData.set(true);
    this.frm.disable();
    const sub = this.api.getById(this.id)
    .pipe(finalize(() => {
      this.ldData.set(false);
      this.frm.enable();
      this.f.codigo.disable();
    }))
    .subscribe({
      next: (res: UnidadTransporteDto) => {
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
  handlerLoadData(res: UnidadTransporteDto): void{
    this.data.set(res);
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
