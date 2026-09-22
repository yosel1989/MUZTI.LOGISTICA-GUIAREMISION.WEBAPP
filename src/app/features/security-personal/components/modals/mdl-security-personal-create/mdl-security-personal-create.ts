import { AfterViewInit, Component, DestroyRef, EventEmitter, inject, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';
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
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from 'app/core/services/alert.service';
import { OnlyUpperDirective } from 'app/core/directives/only-uppers.directive';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { SecurityPersonalApiService } from '@features/security-personal/services/security-personal-api.service';
import { SecurityPersonalCreateDto } from '@features/security-personal/models/security-personal';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-mdl-security-personal-create',
  templateUrl: './mdl-security-personal-create.html',
  styleUrl: './mdl-security-personal-create.scss',
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
export class MdlSecurityPersonalCreate implements OnInit, AfterViewInit, OnDestroy {

  private api = inject(SecurityPersonalApiService);
  private confirmationService = inject(ConfirmationService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);

  @Output() OnCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();

  frm: FormGroup = new FormGroup({});
  isSubmitted = signal(false);
  ldSubmit = signal<boolean>(false);

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
      person_id: new FormControl(null),
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get f(): any {
    return this.frm.controls;
  }

  get request(): SecurityPersonalCreateDto {
    const form = this.frm.value;

    return {
      person_id: form.person_id,
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
        header: '¿Registrar personal de seguridad?',
        message: 'Confirmar la operación.',
        accept: () => {

            this.ldSubmit.set(true);
            
            this.api.create(this.request)
            .pipe(
              takeUntilDestroyed(this.destroyRef),
              finalize(()=>{this.ldSubmit.set(false)})
            )
            .subscribe({
              next: () => {

                this.alertService.showToast({
                  position: 'top-end',
                  icon: "success",
                  title: "Se registro el perfil con éxito",
                });

                this.OnCreated.emit(true);
              },
              error: (err: HttpErrorResponse) => {
                this.alertService.showToast({
                  position: 'top-end',
                  icon: "error",
                  title: err.error.detalle,
                });
              }
            });
           
        },
    });
  }

  evtOnClose(): void{
    this.OnCanceled.emit(true);
  }


}