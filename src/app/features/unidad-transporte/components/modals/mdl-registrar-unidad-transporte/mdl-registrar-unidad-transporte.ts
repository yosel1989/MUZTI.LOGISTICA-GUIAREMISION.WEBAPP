import { AfterViewInit, Component, EventEmitter, inject, OnDestroy, OnInit, Output, signal, ViewChild } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from 'app/core/services/alert.service';
import { RegistrarUnidadTransporteRequestDto } from '@features/unidad-transporte/models/unidad-transporte.model';
import { UnidadTransporteApiService } from '@features/unidad-transporte/services/unidad-transporte-api.service';
import { SelectEmisorVehicularComponent } from '@features/catalogo/components/selects/select-emisor-vehicular/select-emisor-vehicular';
import { OnlyUpperDirective } from 'app/core/directives/only-uppers.directive';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-mdl-registrar-unidad-transporte',
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
    SelectEmisorVehicularComponent,
    OnlyUpperDirective,
    TooltipModule
  ],
  templateUrl: './mdl-registrar-unidad-transporte.html',
  styleUrl: './mdl-registrar-unidad-transporte.scss',
  providers: [
    ConfirmationService
  ]
})
export class MdlRegistrarUnidadTransporteComponent implements OnInit, AfterViewInit, OnDestroy {

  private api = inject(UnidadTransporteApiService);
  private confirmationService = inject(ConfirmationService);
  private alertService = inject(AlertService);

  @ViewChild('ctrlEmisorVehicular') ctrlEmisorVehicular: SelectEmisorVehicularComponent | undefined;

  @Output() OnCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();

  frm: FormGroup = new FormGroup({});
  isSubmitted = signal(false);
  ldSubmit = signal(false);

  private subs = new Subscription();

  submitted = signal(false);

  headerValue: string = '';

  tipos: {value: string, label: string}[] = [
    {value: 'interno', label: 'INTERNO'},
    {value: 'externo', label: 'EXTERNO'}
  ];

  constructor( public config: DynamicDialogConfig ) { }

  ngOnInit(): void {
    this.frm = new FormGroup({
      descripcion: new FormControl(null, Validators.maxLength(50)),
      marca: new FormControl(null, Validators.maxLength(20)),
      modelo: new FormControl(null, Validators.maxLength(20)),
      placa: new FormControl(null, [Validators.required, Validators.maxLength(8), Validators.pattern('^[A-Z0-9]{6,8}$')]),
      tarjeta: new FormControl(null, [Validators.maxLength(20)]),
      cod_emisor_vehicular: new FormControl(null, [Validators.maxLength(2)]),
      emisor_vehicular: new FormControl(null, [Validators.minLength(2), Validators.maxLength(100)]),
      nro_autorizacion: new FormControl(null, [Validators.minLength(3), Validators.maxLength(50)]),
      tipo: new FormControl('interno', [Validators.maxLength(20)]),
      id_estado: new FormControl(1),
    });

    this.headerValue = this.config.header ?? '';
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

  get request(): RegistrarUnidadTransporteRequestDto {
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
        header: '¿Registrar unidad de transporte?',
        message: 'Confirmar la operación.',
        accept: () => {

            this.frm.disable();
            this.ldSubmit.set(true);
            
            const subs = this.api.registrar(this.request).subscribe({
              next: () => {
                this.frm.enable();
                this.ldSubmit.set(false);

                this.alertService.showToast({
                  position: 'top-end',
                  icon: "success",
                  title: "Se registro el conductor con éxito",
                  showCloseButton: true,
                  timerProgressBar: true,
                  timer: 4000
                });

                this.OnCreated.emit(true);
              },
              error: (err: HttpErrorResponse) => {
                this.frm.enable();
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
            this.subs.add(subs);
           
        },
    });
  }

  evtOnClose(): void{
    this.OnCanceled.emit(true);
  }


}
