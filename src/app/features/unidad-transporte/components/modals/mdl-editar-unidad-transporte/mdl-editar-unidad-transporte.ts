import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
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
    AsyncPipe
  ],
  templateUrl: './mdl-editar-unidad-transporte.html',
  styleUrl: './mdl-editar-unidad-transporte.scss',
  providers: [ConfirmationService]
})
export class MdlEditarUnidadTransporteComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() id!: number;
  @Output() OnCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
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
      marca: new FormControl(null, Validators.maxLength(50)),
      modelo: new FormControl(null, Validators.maxLength(20)),
      placa: new FormControl(null, [Validators.required, Validators.maxLength(8)]),
      numero_registro_mtc: new FormControl(null, [Validators.maxLength(20)]),
      tarjeta: new FormControl(null, [Validators.required, Validators.maxLength(20)]),
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
      numero_registro_mtc: form.numero_registro_mtc,
      tarjeta: form.tarjeta,
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

            this.frm.disable();
            this.ldSubmit = true;
            
            const subs = this.api.editar(this.data!.id, this.request).subscribe({
              next: (res: EditarUnidadTransporteResponseDto) => {
                this.frm.enable();
                this.ldSubmit = false;

                this.alertService.showToast({
                  position: 'bottom-end',
                  icon: "success",
                  title: "Se edito la unidad de transporte con éxito",
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


  // data
  loadData(): void{
    this.ldData.next(true);
    this.frm.disable();
    const sub = this.api.obtener(this.id).subscribe({
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
      numero_registro_mtc: res.numero_registro_mtc,
      tarjeta: res.tarjeta
    });
  }


}
