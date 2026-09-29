import { AfterViewInit, Component, DestroyRef, effect, EventEmitter, inject, input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';

import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ErrorHandlerService } from '@core/handlers/error-handler.service';
import { AreaDto, AreaLevel, AreaToSelectDto, AreaUpdateDto } from '@features/area/models/area';
import { AreaApiService } from '@features/area/services/area-api.service';
import { OnlyNumberDirective } from 'app/core/directives/only-numbers.directive';
import { OnlyUpperDirective } from 'app/core/directives/only-uppers.directive';
import { AlertService } from 'app/core/services/alert.service';
import { ConfirmationService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, Subscription } from 'rxjs';
import { SelectArea } from '../../selectes/select-area/select-area';
import { ResponseDTO } from '@features/shared/models/shared';

@Component({
  selector: 'app-mdl-area-edit',
  templateUrl: './mdl-area-edit.html',
  styleUrl: './mdl-area-edit.scss',
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
    SkeletonModule,
    SelectArea
  ],
  providers: [ConfirmationService]
})
export class MdlAreaEdit implements OnInit, AfterViewInit, OnDestroy {

  private destroyRef = inject(DestroyRef);
  private api = inject(AreaApiService);
  private confirmationService = inject(ConfirmationService);
  private alertService = inject(AlertService);
  private errorHandler = inject(ErrorHandlerService);
  
  id = input.required<number>();

  @Output() OnUpdated: EventEmitter<AreaDto> = new EventEmitter<AreaDto>();
  @Output() OnClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  frm: FormGroup = new FormGroup({});
  isSubmitted = signal(false);
  ldSubmit = signal(false);
  selectParent = signal<AreaToSelectDto | undefined>(undefined);

  private subs = new Subscription();
  
  submitted = signal(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: DynamicDialogRef<any> | undefined | null;
  level = signal<AreaLevel>(1);

  ldData = signal<boolean>(false);
  data = signal<AreaDto | undefined>(undefined);
  
  constructor( 
  ) {
    effect(()=> {
      const level = this.level();
      this.selectParent.set(undefined);
      this.frm.get('parent_area_id')?.clearValidators();
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

  get request(): AreaUpdateDto {

    const formData = this.frm.value;

    return {
      id: this.data()!.id,
      code: formData.code,
      parent_code: this.selectParent()?.code ?? null,
      parent_name: this.selectParent()?.name ?? null,
      name: formData.name,
      parent_area_id: formData.parent_area_id,
      level: formData.level,
    };
    
  }

  // Events
  evtOnSubmit(): void{

    this.submitted.set(true);
    if(this.frm.invalid){
      console.log(this.frm);
      return;
    }

    this.confirmationService.confirm({
        header: `Actualizar el área?`,
        message: 'Confirmar la operación.',
        accept: () => {
            const requestData = this.request;
            this.ldSubmit.set(true);
            
            const subs = this.api.update(requestData)
            .pipe(finalize(() => {
              this.ldSubmit.set(false);
              this.submitted.set(false);
            }))
            .subscribe({
              next: (res: ResponseDTO<AreaDto>) => {
                this.alertService.success(res.detalle);

                this.OnUpdated.emit(res.data);
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

  // Data

  loadData(): void{
    this.ldData.set(true);
    this.api.getById(this.id())
      .pipe(
        finalize(()=>{this.ldData.set(false)}),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (value: AreaDto) => {
          this.data.set(value);
          this.handlerSetValues(value);
        },
        error: (err: HttpErrorResponse) => {
          this.errorHandler.handle(err);
        }
      })
  }

  // Handlers

  handlerSetValues(data: AreaDto): void{
    this.frm.patchValue({
      parent_area_id: data.parent_area_id,
      name: data.parent_area_id ? data.name.split(" - ")[1] : data.name,
      code: data.parent_area_id ? data.code.substring(2,4) : data.code,
      level: data.level
    });
    this.level.set(data.level);
  }

}
