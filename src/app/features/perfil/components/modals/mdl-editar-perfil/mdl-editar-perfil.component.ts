import { AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject, signal } from '@angular/core';
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
import { DividerModule } from 'primeng/divider';
import { EditarPerfilRequestDTO, PerfilDTO } from '@features/perfil/models/perfil.model';
import { PerfilApiService } from '@features/perfil/services/perfil-api.service';
import { OnlyUpperDirective } from '@core/directives/only-uppers.directive';

@Component({
  selector: 'app-mdl-editar-perfil',
  templateUrl: './mdl-editar-perfil.component.html',
  styleUrl: './mdl-editar-perfil.component.scss',
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
    DividerModule,
    OnlyUpperDirective,
  ],
  providers: [ConfirmationService]
})
export class MdlEditarPerfilComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {

  private api = inject(PerfilApiService);
  private confirmationService = inject(ConfirmationService);
  private alertService = inject(AlertService);


  @Input() id!: number;
  @Output() OnCreated: EventEmitter<PerfilDTO> = new EventEmitter<PerfilDTO>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();


  frm: FormGroup = new FormGroup({});
  isSubmitted = signal(false);
  ldSubmit = signal(false);
  ldData = signal(false);

  private subs = new Subscription();
  submitted: boolean = false;


  headerValue: string = '';
  estados: {id: number, label: string}[] = [
    {id: 0, label: 'Inactivo'},
    {id: 1, label: 'Activo'}
  ];

  data: PerfilDTO | undefined;

  constructor(
    private fb: FormBuilder,
    public config: DynamicDialogConfig
	) {
    this.frm = this.fb.group({
      id: new FormControl({value:null, disabled: true}),
      nombre: new FormControl(null, [Validators.required, Validators.maxLength(75)]),
      descripcion: new FormControl(null, [Validators.maxLength(150)]),
      codigo: new FormControl(null, Validators.required)
    });

    this.headerValue = this.config.header ?? '';
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
  }

  ngAfterViewChecked(): void{

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // Getters
  get f(): any {
    return this.frm.controls;
  }

  get request(): EditarPerfilRequestDTO {
    const form = this.frm.value;

    return {
      id: this.id,
      nombre: form.nombre,
      descripcion: form.descripcion,
      codigo: form.codigo
    };
  }

  get isLoading(): boolean{
    return this.ldSubmit() || 
    this.ldData()
  }

  // Events
  evtOnSubmit(): void{
    this.isSubmitted.set(true);
    if(this.frm.invalid){
      console.log(this.frm);
      return;
    }

    this.confirmationService.confirm({
        header: 'Editar perfil?',
        message: 'Confirmar la operación.',
        accept: () => {

            this.ldSubmit.set(true);
            
            const sub = this.api.editar(this.data!.id, this.request).subscribe({
              next: (res: PerfilDTO) => {
                this.ldSubmit.set(false);

                this.alertService.showToast({
                  position: 'top-end',
                  icon: "success",
                  title: "Se edito el perfil con éxito",
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
    const sub = this.api.getById(this.id).subscribe({
      next: (res: PerfilDTO) => {
        this.ldData.set(false);
        this.handlerLoadData(res);
      },
      error: (err: HttpErrorResponse) => {
        this.ldData.set(false);
        this.alertService.showToast({
          position: 'top-end',
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
  handlerLoadData(res: PerfilDTO): void{
    this.data = res;
    this.frm.patchValue({
      id: 'COD-' + res.id.toString().padStart(4,'0'),
      nombre: res.nombre,
      descripcion: res.descripcion,
      codigo: res.codigo
    });
  }

}
