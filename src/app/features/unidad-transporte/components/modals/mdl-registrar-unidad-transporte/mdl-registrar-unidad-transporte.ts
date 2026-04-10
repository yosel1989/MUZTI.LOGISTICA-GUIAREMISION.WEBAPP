import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
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
import { DocumentEntityType } from '@features/items/models/document-entity-type';
import { FAKE_DOCUMENT_TYPE_PERSON } from 'app/fake/items/data/fakeDocumenType';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from 'app/core/services/alert.service';
import { RegistrarConductorResponseDto } from '@features/conductor/models/conductor.model';
import { RegistrarUnidadTransporteRequestDto } from '@features/unidad-transporte/models/unidad-transporte.model';
import { UnidadTransporteApiService } from '@features/unidad-transporte/services/unidad-transporte-api.service';
import { SelectEmisorVehicularComponent } from '@features/catalogo/components/selects/select-emisor-vehicular/select-emisor-vehicular';

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
    SelectEmisorVehicularComponent
  ],
  templateUrl: './mdl-registrar-unidad-transporte.html',
  styleUrl: './mdl-registrar-unidad-transporte.scss',
  providers: [ConfirmationService]
})
export class MdlRegistrarUnidadTransporteComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('ctrlEmisorVehicular') ctrlEmisorVehicular: SelectEmisorVehicularComponent | undefined;

  @Output() OnCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();

  frm: FormGroup = new FormGroup({});
  isSubmitted: boolean = false;
  ldSubmit: boolean = false;

  private subs = new Subscription();
  
  documentTypes: DocumentEntityType[] = FAKE_DOCUMENT_TYPE_PERSON;
  submitted: boolean = false;

  headerValue: string = '';
  estados: {id: number, label: string}[] = [
    {id: 0, label: 'Inactivo'},
    {id: 1, label: 'Activo'}
  ];

   tipos: {id: string, label: string}[] = [
    {id: 'INTERNO', label: 'INTERNO'},
    {id: 'EXTERNO', label: 'EXTERNO'}
  ];

  constructor(
    private fb: FormBuilder,
    public config: DynamicDialogConfig,
    private api: UnidadTransporteApiService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService
	) {
    this.frm = this.fb.group({
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

  get request(): RegistrarUnidadTransporteRequestDto {
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
      empleado_id_creacion: 1,
      empleado_nombre_creacion: 'SA'
    };
  }

  // Events
  evtOnSubmit(): void{
    this.isSubmitted = true;
    if(this.frm.invalid){
      return;
    }

    this.confirmationService.confirm({
        header: '¿Registrar unidad de transporte?',
        message: 'Confirmar la operación.',
        accept: () => {

            this.frm.disable();
            this.ldSubmit = true;
            
            const subs = this.api.registrar(this.request).subscribe({
              next: (res: RegistrarConductorResponseDto) => {
                this.frm.enable();
                this.ldSubmit = false;

                this.alertService.showToast({
                  position: 'bottom-end',
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


}
