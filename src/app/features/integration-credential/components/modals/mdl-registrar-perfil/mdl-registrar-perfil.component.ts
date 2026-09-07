import { AfterViewInit, Component, EventEmitter, inject, OnDestroy, OnInit, Output, signal } from '@angular/core';
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
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from 'app/core/services/alert.service';
import { OnlyUpperDirective } from 'app/core/directives/only-uppers.directive';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { RegistrarPerfilRequestDTO } from '@features/perfil/models/perfil.model';
import { PerfilApiService } from '@features/perfil/services/perfil-api.service';

@Component({
  selector: 'app-mdl-registrar-perfil',
  templateUrl: './mdl-registrar-perfil.component.html',
  styleUrl: './mdl-registrar-perfil.component.scss',
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
    OnlyUpperDirective,
    DividerModule,
    SkeletonModule,
    OnlyUpperDirective
  ],
  providers: [ConfirmationService]
})
export class MdlRegistrarPerfilComponent implements OnInit, AfterViewInit, OnDestroy {

  private api = inject(PerfilApiService);
  private confirmationService = inject(ConfirmationService);
  private alertService = inject(AlertService);

  @Output() OnCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();

  frm: FormGroup = new FormGroup({});
  isSubmitted = signal(false);
  ldSubmit: boolean = false;

  private subs = new Subscription();

  headerValue: string = '';
  estados: {id: number, label: string}[] = [
    {id: 0, label: 'Inactivo'},
    {id: 1, label: 'Activo'}
  ];

  constructor(
    private fb: FormBuilder,
    public config: DynamicDialogConfig
	) {
    this.frm = this.fb.group({
      nombre: new FormControl(null, [Validators.required, Validators.maxLength(75)]),
      descripcion: new FormControl(null, [Validators.maxLength(150)]),
      codigo: new FormControl(null, Validators.required)
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

  get request(): RegistrarPerfilRequestDTO {
    const form = this.frm.value;

    return {
      nombre: form.nombre,
      descripcion: form.descripcion,
      codigo: form.codigo
    };
  }

  // Events
  evtOnSubmit(): void{
    this.isSubmitted.set(true);
    if(this.frm.invalid){
      console.log(this.frm);
      return;
    }

    this.confirmationService.confirm({
        header: '¿Registrar perfil?',
        message: 'Confirmar la operación.',
        accept: () => {

            this.frm.disable();
            this.ldSubmit = true;
            
            const subs = this.api.registrar(this.request).subscribe({
              next: (res: RegistrarPerfilRequestDTO) => {
                this.frm.enable();
                this.ldSubmit = false;

                this.alertService.showToast({
                  position: 'top-end',
                  icon: "success",
                  title: "Se registro el perfil con éxito",
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
        reject: () => {
            
        },
    });
  }

  evtOnClose(): void{
    this.OnCanceled.emit(true);
  }


}