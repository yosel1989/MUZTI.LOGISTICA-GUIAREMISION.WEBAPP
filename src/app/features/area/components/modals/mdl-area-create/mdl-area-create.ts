import { AfterViewInit, Component, DestroyRef, effect, EventEmitter, inject, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';

import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '@core/handlers/error-handler.service';
import { AreaCreateDto, AreaLevel, AreaToSelectDto } from '@features/area/models/area';
import { AreaApiService } from '@features/area/services/area-api.service';
import { OnlyNumberDirective } from 'app/core/directives/only-numbers.directive';
import { OnlyUpperDirective } from 'app/core/directives/only-uppers.directive';
import { AlertService } from 'app/core/services/alert.service';
import { ConfirmationService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, Subscription } from 'rxjs';
import { SelectArea } from '../../selectes/select-area/select-area';

@Component({
  selector: 'app-mdl-area-create',
  templateUrl: './mdl-area-create.html',
  styleUrl: './mdl-area-create.scss',
  imports: [
    FormsModule, 
    InputNumberModule,
    InputTextModule, 
    TextareaModule, 
    ButtonModule, 
    ReactiveFormsModule, 
    MessageModule, 
    ConfirmDialog,
    SelectModule,
    OnlyNumberDirective,
    OnlyUpperDirective,
    TooltipModule,
    ToggleSwitchModule,
    CheckboxModule,
    SelectButtonModule,
    RadioButtonModule,

    InputGroupModule,
    InputGroupAddonModule,

    SelectArea
  ],
  providers: [ConfirmationService]
})
export class MdlAreaCreate implements OnInit, AfterViewInit, OnDestroy {

  private destroyRef = inject(DestroyRef);
  private api = inject(AreaApiService);
  private confirmationService = inject(ConfirmationService);
  private alertService = inject(AlertService);
  private errorHandler = inject(ErrorHandlerService);
  

  @Output() OnCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() OnClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  frm: FormGroup = new FormGroup({});
  isSubmitted = signal(false);
  ldSubmit = signal(false);
  selectParent = signal<AreaToSelectDto | undefined>(undefined);

  private subs = new Subscription();
  
  submitted = signal(false);
  ldInfo = signal(false);

  headerValue: string = '';
  estados: {id: number, label: string}[] = [
    {id: 0, label: 'Inactivo'},
    {id: 1, label: 'Activo'}
  ];

  types: {value: string, label: string}[] = [
    {value: 'empresa', label: 'EMPRESA'},
    {value: 'persona', label: 'PERSONA'},
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: DynamicDialogRef<any> | undefined | null;


  stateOptions: {label: string, value: string}[] = [{ label: 'Registrar', value: 'one-way' },{ label: 'Seleccionar', value: 'return' }];

  value: string = 'off';

  level = signal<AreaLevel>(1);
  
  constructor( 
    public config: DynamicDialogConfig,
    private dialogRef: DynamicDialogRef
  ) {
    effect(()=> {
      this.frm.get('parent_area_id')?.clearValidators();
      const level = this.level();
      this.f.level.patchValue(level);
      if(level === 2){ this.frm.get('parent_area_id')?.addValidators(Validators.required)}
      this.frm.get('parent_area_id')?.updateValueAndValidity();
    })
  }

  ngOnInit(): void {
    this.frm = new FormGroup({
      code: new FormControl<string | null>(null, [Validators.required, Validators.minLength(2), Validators.maxLength(2)]),
      name: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(150)]),
      parent_area_id: new FormControl<number | null>(null),
      level: new FormControl<AreaLevel>(1, [Validators.required]),
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

  get request(): AreaCreateDto {

    const formData = this.frm.value;

    return {
      code: formData.code,
      name: formData.name,
      parent_area_id: formData.parent_area_id,
      level: formData.level,
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
        header: `¿Registrar el área?`,
        message: 'Confirmar la operación.',
        accept: () => {
            const requestData = this.request;
            this.ldSubmit.set(true);
            
            const subs = this.api.create(requestData)
            .pipe(finalize(() => {
              this.ldSubmit.set(false);
            }))
            .subscribe({
              next: () => {
                this.alertService.success(`Se registro el área con éxito`);

                this.OnCreated.emit(true);
              },
              error: (err: HttpErrorResponse) => {
                this.errorHandler.handle(err);
              }
            });
            this.subs.add(subs);
           
        },
    });
  }

  evtOnClose(): void{
    this.OnClose.emit(true);
  }

  evtSelectedParent(evt: AreaToSelectDto | undefined){
    this.selectParent.set(evt);
  }


}
