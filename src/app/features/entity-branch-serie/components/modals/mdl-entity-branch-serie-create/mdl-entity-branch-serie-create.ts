import { AfterViewInit, Component, DestroyRef, EventEmitter, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { EditorModule } from 'primeng/editor';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';

import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MdlHeader } from '@core/components/modals/headers/mdl-header/mdl-header';
import { TipoEstablecimientoDTO } from '@features/catalogo/models/catalogo.model';
import { EmpresaToSelectDto } from '@features/empresa/models/empresa.model';
import { EntityBranchDto } from '@features/entity-branch/models/entity-branch';
import { MdlEntityList } from '@features/entity/components/modals/mdl-entity-list/mdl-entity-list';
import { EntityDto } from '@features/entity/models/entity';
import { OnlyUpperDirective } from 'app/core/directives/only-uppers.directive';
import { AlertService } from 'app/core/services/alert.service';
import { ConfirmationService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SkeletonModule } from 'primeng/skeleton';
import { Subscription } from 'rxjs';
import { SelectInvoiceTypeComponent } from '@features/catalogo/components/selects/select-invoice-type/select-invoice-type';
import { EntityBranchSerieCreateDto } from '@features/entity-branch-serie/models/entity-branch-serie';
import { EntityBranchSerieApiService } from '@features/entity-branch-serie/services/entity-branch-serie-api-service';


@Component({
  selector: 'app-mdl-entity-branch-serie-create',
  templateUrl: './mdl-entity-branch-serie-create.html',
  styleUrl: './mdl-entity-branch-serie-create.scss',
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
    CheckboxModule,
    InputGroupModule,
    InputGroupAddonModule,
    AvatarModule,


    SelectInvoiceTypeComponent
  ],
  providers: [ConfirmationService]
})
export class MdlEntityBranchSerieCreate implements OnInit, AfterViewInit, OnDestroy {

  private api = inject(EntityBranchSerieApiService);
  private confirmationService = inject(ConfirmationService);
  private alertService = inject(AlertService);
  private dialogService = inject(DialogService);
  private destroyRef = inject(DestroyRef);

  entityBranch = input.required<EntityBranchDto>();

  OnCreated = new EventEmitter<boolean>();
  OnCanceled = new EventEmitter<boolean>();

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: DynamicDialogRef<any> | undefined | null;

  constructor(
    public config: DynamicDialogConfig
	) {
    
  }

  ngOnInit(): void {
    this.frm = new FormGroup({
      invoice_type_id: new FormControl(null, Validators.required),
      area: new FormControl(null, [Validators.required]),
      serie: new FormControl(null, [Validators.minLength(4), Validators.maxLength(4)]),
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

  get request(): EntityBranchSerieCreateDto {
    const form = this.frm.value;

    return {
      entity_branch_id: this.entityBranch().id,
      invoice_type_id: form.invoice_type_id,
      area: form.area,
      serie: form.serie,
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
        header: '¿Registrar serie?',
        message: 'Confirmar la operación.',
        accept: () => {

            this.ldSubmit.set(true);
            
            const subs = this.api.create(this.request).subscribe({
              next: () => {
                this.ldSubmit.set(false);

                this.alertService.showToast({
                  position: 'top-end',
                  icon: "success",
                  title: "Se registro la serie con éxito",
                  showCloseButton: true,
                  timerProgressBar: true,
                  timer: 4000
                });

                this.OnCreated.emit(true);
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
            this.subs.add(subs);
           
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
      header: 'Seleccionar Entidad',
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

}