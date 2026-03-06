import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors} from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { EditorModule } from 'primeng/editor';
import { MessageModule } from 'primeng/message';

import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { formatDate } from '@angular/common';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Subscription } from 'rxjs';
import { ProveedorApiService } from '@features/proveedor/services/proveedor-api.service';
import { RegistrarProveedorRequestDto } from '@features/proveedor/models/proveedor';

@Component({
  selector: 'app-mdl-registrar-proveedor',
  imports: [
    FormsModule, 
    DatePicker, 
    InputNumberModule,
    InputTextModule, 
    TextareaModule, 
    ButtonModule, 
    EditorModule, 
    ReactiveFormsModule, 
    MessageModule, 
    ConfirmDialog
  ],
  templateUrl: './mdl-create-sorteo.component.html',
  styleUrl: './mdl-create-sorteo.component.scss',
  providers: [ConfirmationService]
})
export class MdlRegistrarProveedorComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() OnCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();

  frmNuevoProveedor: FormGroup = new FormGroup({});
  isSubmitted: boolean = false;
  ldSubmit: boolean = false;

  private subs = new Subscription();
  

  constructor(
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    private api: ProveedorApiService,
    private confirmationService: ConfirmationService
	) {
    this.frmNuevoProveedor = this.fb.group({
      tipo_documento: new FormControl('DNI', Validators.required),
      numero_documento: new FormControl(null, Validators.required),
      razon_social: new FormControl(null, [Validators.required, Validators.maxLength(200)]),
      departamento: new FormControl(null, Validators.required),
      provincia: new FormControl(null, Validators.required),
      distrito: new FormControl(null, Validators.required),
      direccion: new FormControl(null, [Validators.required, Validators.maxLength(250)]),
      email: new FormControl(null, [Validators.required, Validators.email, Validators.maxLength(50)]),
      pais: new FormControl(null, [Validators.minLength(1), Validators.maxLength(3), Validators.required]),
      codigoSunat: new FormControl(null),
      empleado_id_creacion: new FormControl(null),
      empleado_nombre_creacion: new FormControl(null)
    });
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
    return this.frmNuevoProveedor.controls;
  }

  get payload(): RegistrarProveedorRequestDto {
    const form = this.frmNuevoProveedor.value;

    return {
      tipo_documento: form.tipo_documento,
      numero_documento: form.numero_documento,
      razon_social: formatDate(form.fechaVentaInicio, 'yyyy-MM-ddTHH:mm:00', 'en-US'),
      f_fin_venta: formatDate(form.fechaVentaFin, 'yyyy-MM-ddTHH:mm:00', 'en-US'),
      f_sorteo: formatDate(form.fechaSorteo, 'yyyy-MM-ddTHH:mm:00', 'en-US'),
      f_ext_sorteo: form.fechaExtSorteo ? formatDate(form.fechaExtSorteo, 'yyyy-MM-ddTHH:mm:00', 'en-US') : null,
      precio_rifa: form.precioRifa,
      numero_min: form.numeroInicial,
      numero_max: form.numeroFinal,
      flag_rifas: true
    };
  }

  // Events
  evtOnSubmit(): void{
    this.isSubmitted = true;
    if(this.frmNuevoSorteo.invalid){
      return;
    }

    this.confirmationService.confirm({
        header: '¿Guardar cambios?',
        message: 'Confirmar la operación.',
        accept: () => {

            this.frmNuevoSorteo.disable();
            this.ldSubmit = true;
            
            const subs = this.apiService.createSorteo(this.payload).subscribe({
              next: (res: SorteoCreateResponseDto) => {
                this.frmNuevoSorteo.enable();
                this.ldSubmit = false;
                this.OnCreated.emit(res);
              },
              error: (err: any) => {
                this.frmNuevoSorteo.enable();
                this.ldSubmit = false;
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


  // Validators

  numeroMayorQue(controlComparado: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null; // Evita errores si el control aún no está en el grupo

      const comparado = control.parent.get(controlComparado);
      if (!comparado) return null;

      const valorActual = control.value;
      const valorComparado = comparado.value;

      if (valorActual != null && valorComparado != null && valorActual <= valorComparado) {
        return { numeroMayorQue: { requeridoMayorQue: controlComparado } };
      }

      return null;
    };
  };

  fechaMayorQue(controlComparado: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;

      const comparado = control.parent.get(controlComparado);
      if (!comparado) return null;

      const fechaActual = control.value;
      const fechaComparada = comparado.value;

      if (fechaActual && fechaComparada) {
        const fechaA = new Date(fechaActual);
        const fechaB = new Date(fechaComparada);

        if (fechaA <= fechaB) {
          return { fechaMayorQue: { requeridoMayorQue: controlComparado } };
        }
      }

      return null;
    };
  }

}
