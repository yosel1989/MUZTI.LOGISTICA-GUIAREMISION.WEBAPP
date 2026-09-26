import { AfterViewInit, Component, DestroyRef, EventEmitter, inject, input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { finalize, Subscription, takeUntil } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from 'app/core/services/alert.service';
import { ErrorHandlerService } from '@core/handlers/error-handler.service';
import { DividerModule } from 'primeng/divider';
import { EmpresaToSelectDto } from '@features/empresa/models/empresa.model';
import { SkeletonModule } from 'primeng/skeleton';
import { EmpresaApiService } from '@features/empresa/services/empresa-api.service';
import { TipoEstablecimientoDTO } from '@features/catalogo/models/catalogo.model';
import { CheckboxModule } from 'primeng/checkbox';
import { MdlEntityList } from '@features/entity/components/modals/mdl-entity-list/mdl-entity-list';
import { EntityDto } from '@features/entity/models/entity';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MdlHeader } from '@core/components/modals/headers/mdl-header/mdl-header';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AvatarModule } from 'primeng/avatar';
import { IntegrationCredentialApiService } from '@features/integration-credential/services/integration-credential-api.service';
import { IntegrationCredentialCreateDto, IntegrationCredentialDto, IntegrationCredentialUpdateDto } from '@features/integration-credential/models/integration-credential.model';

@Component({
  selector: 'app-mdl-integration-credential-edit',
  templateUrl: './mdl-integration-credential-edit.html',
  styleUrl: './mdl-integration-credential-edit.scss',
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
    DividerModule,
    SkeletonModule,
    CheckboxModule,
    InputGroupModule,
    InputGroupAddonModule,
    AvatarModule,
    TextareaModule,
    SkeletonModule
  ],
  providers: [ConfirmationService]
})
export class MdlIntegrationCredentialEdit implements OnInit, AfterViewInit, OnDestroy {

  private config = inject(DynamicDialogConfig);
  private api = inject(IntegrationCredentialApiService);
  private confirmationService = inject(ConfirmationService);
  private alertService = inject(AlertService);
  private errorHandler = inject(ErrorHandlerService);
  private empresaApiService = inject(EmpresaApiService);
  private dialogService = inject(DialogService);
  private destroyRef = inject(DestroyRef);

  id = input.required<number>();
  @Output() OnUpdated: EventEmitter<IntegrationCredentialDto> = new EventEmitter<IntegrationCredentialDto>();
  @Output() OnCanceled: EventEmitter<boolean> = new EventEmitter<boolean>();

  frm: FormGroup = new FormGroup({});
  isSubmitted = signal(false);
  ldSubmit = signal(false);

  private subs = new Subscription();

  headerValue: string = '';
  estados: {id: number, label: string}[] = [
    {id: 0, label: 'Inactivo'},
    {id: 1, label: 'Activo'}
  ];

  ldEmpresa = signal(false);
  empresas = signal<EmpresaToSelectDto[]>([]);

  tiposEstablecimiento = signal<TipoEstablecimientoDTO[]>([]);
  ldTipoEstablecimiento = signal(false);

  entitySelected = signal<EntityDto | null>(null);
  showEntityList = signal(false);

  providers = signal<{label: string, value: string}[]>([]);
  ldProviders = signal<boolean>(true);

  ldData = signal<boolean>(false);
  data = signal<IntegrationCredentialDto | undefined>(undefined);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: DynamicDialogRef<any> | undefined | null;

  ngOnInit(): void {
    this.frm = new FormGroup({
      entity_id: new FormControl(null, Validators.required),
      provider: new FormControl(null, Validators.required),
      key: new FormControl(null, [Validators.required, Validators.maxLength(250)]),
      key_test: new FormControl(null, [Validators.required, Validators.maxLength(250)]),
    });
    this.headerValue = this.config.header ?? '';

    this.loadEmpresas();
    this.loadProviders();
    this.loadData();
  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy(): void {

  }

  // Getters

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get f(): any {
    return this.frm.controls;
  }

  get request(): IntegrationCredentialUpdateDto {
    const form = this.frm.value;

    return {
      id: this.id(),
      entity_id: form.entity_id,
      provider: form.provider,
      key: form.key,
      key_test: form.key_test
    };
  }

  // Events
  evtOnSubmit(): void{
    this.isSubmitted.set(true);
    if(this.frm.invalid){
      return;
    }

    this.confirmationService.confirm({
        header: '¿Registrar integración?',
        message: 'Confirmar la operación.',
        accept: () => {

            this.ldSubmit.set(true);
            
            this.api.update(this.request.id, this.request)
            .pipe(
              finalize(()=>{this.ldSubmit.set(false)}),
              takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
              next: ( res: IntegrationCredentialDto) => {
                this.ldSubmit.set(false);

                this.alertService.success("Se modificó los datos de la integración con éxito");

                this.OnUpdated.emit(res);
              },
              error: (err: HttpErrorResponse) => {
                this.ldSubmit.set(false);
                this.errorHandler.handle(err);
              }
            });
           
        },
    });
  }

  evtOnClose(): void{
    this.OnCanceled.emit(true);
  }

  evtToggleShowEntityList(): void{
    this.showEntityList.update((value) => !value);
  }

  evtShowEntityList(): void{

    this.ref = this.dialogService.open(MdlEntityList, {
      width: '700px',
      closable: false,
      draggable: false,
      modal: true,
      position: 'top',
      header: 'Seleccionar entidad',
      styleClass: 'max-h-none! slide-down-dialog',
      maskStyleClass: 'py-4',
      appendTo: 'body',
      templates: {
        header: MdlHeader
      }
    });

    this.ref?.onChildComponentLoaded
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((childComponent: MdlEntityList) => {
      childComponent.OnSelected
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((entity: EntityDto) => {
        this.entitySelected.set(entity);
        this.frm.get('entity_id')?.setValue(entity.id);
        this.ref?.close();
      });
      childComponent.OnClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
          this.ref?.close();
      });
    });

  }

  // Data

  loadEmpresas(): void{
    this.ldEmpresa.set(true);
    this.subs.add(
      this.empresaApiService.loadAllToSelect()
      .pipe(finalize(()=>{this.ldEmpresa.set(false);}))
      .subscribe({
        next: (value: EmpresaToSelectDto[]) => {
          this.empresas.set(value);
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this.errorHandler.handle(err);
        },
      })
    )
  }

  loadProviders(): void{
    this.ldProviders.set(true);
    this.api.getProviderToSelect()
    .pipe(
      finalize(()=>{this.ldProviders.set(false)}),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe({
      next: (res: {label: string, value: string}[]) => {
        this.providers.set(res);
      },
      error: (err: HttpErrorResponse) => {
        this.errorHandler.handle(err);
      },
    })
  }

  loadData(): void{
    this.ldData.set(true);
    this.api.getById(this.id())
    .pipe(
      finalize(()=>{this.ldData.set(false)}),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe({
      next : (res: IntegrationCredentialDto) => {
        this.data.set(res);
        this.handlerFormSetValues(res);
        this.entitySelected.set({
          type: 'empresa',
          document_number: res.entity_document_number,
          name: res.entity_name,
        } as EntityDto)
      },
      error: (err: HttpErrorResponse) => {
        this.errorHandler.handle(err);
      },
    });
  }

  // Handlers

  handlerFormSetValues(data: IntegrationCredentialDto): void{
    this.frm.patchValue({
      entity_id: data.entity_id,
      provider: data.provider,
      key: data.key,
      key_test: data.key_test
    })
  }

}