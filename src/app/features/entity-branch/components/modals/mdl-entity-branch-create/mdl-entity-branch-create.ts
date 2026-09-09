import { AfterViewInit, Component, DestroyRef, EventEmitter, inject, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { EditorModule } from 'primeng/editor';
import { MessageModule } from 'primeng/message';

import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { finalize, Subscription } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from 'app/core/services/alert.service';
import { OnlyUpperDirective } from 'app/core/directives/only-uppers.directive';
import { DividerModule } from 'primeng/divider';
import { EmpresaToSelectDto } from '@features/empresa/models/empresa.model';
import { SkeletonModule } from 'primeng/skeleton';
import { EmpresaApiService } from '@features/empresa/services/empresa-api.service';
import { CatalogoApiService } from '@features/catalogo/services/catalogo-api.service';
import { TipoEstablecimientoDTO } from '@features/catalogo/models/catalogo.model';
import { CheckboxModule } from 'primeng/checkbox';
import { MdlEntityList } from '@features/entity/components/modals/mdl-entity-list/mdl-entity-list';
import { EntityDto } from '@features/entity/models/entity';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MdlHeader } from '@core/components/modals/headers/mdl-header/mdl-header';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AvatarModule } from 'primeng/avatar';
import { EntityBranchApiService } from '@features/entity-branch/services/establecimiento.service';
import { EntityBranchCreateDto } from '@features/entity-branch/models/entity-branch';
import { SelectDepartamentoComponent } from '@features/ubigeo/components/selects/select-departamento/select-departamento';
import { SelectProvinciaComponent } from '@features/ubigeo/components/selects/select-provincia/select-provincia';
import { SelectDistritoComponent } from '@features/ubigeo/components/selects/select-distrito/select-distrito';


@Component({
  selector: 'app-mdl-entity-branch-create',
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
    SelectDepartamentoComponent,
    SelectProvinciaComponent,
    SelectDistritoComponent,
    OnlyUpperDirective,
    DividerModule,
    SkeletonModule,
    CheckboxModule,
    InputGroupModule,
    InputGroupAddonModule,
    AvatarModule
  ],
  templateUrl: './mdl-entity-branch-create.html',
  styleUrl: './mdl-entity-branch-create.scss',
  providers: [ConfirmationService]
})
export class MdlEntityBranchCreate implements OnInit, AfterViewInit, OnDestroy {

  private api = inject(EntityBranchApiService);
  private confirmationService = inject(ConfirmationService);
  private alertService = inject(AlertService);
  private empresaApiService = inject(EmpresaApiService);
  private catalogoApiService = inject(CatalogoApiService);
  private dialogService = inject(DialogService);
  private destroyRef = inject(DestroyRef);

  @Output() OnCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: DynamicDialogRef<any> | undefined | null;

  constructor(
    public config: DynamicDialogConfig
	) {
    
  }

  ngOnInit(): void {
    this.frm = new FormGroup({
      entity_id: new FormControl(null, Validators.required),
      description: new FormControl(null, [Validators.required, Validators.maxLength(200)]),
      area: new FormControl(null, [Validators.maxLength(45)]),
      department: new FormControl(null, Validators.required),
      province: new FormControl(null, Validators.required),
      district: new FormControl(null, Validators.required),
      address: new FormControl(null, [Validators.required, Validators.maxLength(250)]),
      email: new FormControl(null, [Validators.email, Validators.maxLength(100)]),
      serie: new FormControl(null, [Validators.minLength(4), Validators.maxLength(4)]),
      code_sunat: new FormControl(null, [Validators.required, Validators.minLength(4), Validators.maxLength(4)]),
      type: new FormControl(null, Validators.required),
      is_main: new FormControl(false, Validators.required),
    });
    this.headerValue = this.config.header ?? '';

    this.loadEmpresas();
    this.loadTiposEstablecimiento();

    this.frm.get('is_main')?.valueChanges.subscribe((value: boolean) => {
      if(value){
        this.frm.get('code_sunat')?.setValue('0000');
        this.frm.get('code_sunat')?.disable();
      }else{
        this.frm.get('code_sunat')?.setValue(null);
        this.frm.get('code_sunat')?.enable();
      }
    });
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

  get request(): EntityBranchCreateDto {
    const form = this.frm.value;

    return {
      entity_id: form.entity_id,
      description: form.description,
      area: form.area,
      ubigeo_id: form.district,
      address: form.address,
      email: form.email,
      serie: form.serie,
      code_sunat: form.code_sunat,
      type: form.type,
      is_main: form.is_main
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
        header: '¿Registrar establecimiento?',
        message: 'Confirmar la operación.',
        accept: () => {

            this.ldSubmit.set(true);
            
            const subs = this.api.registrar(this.request).subscribe({
              next: () => {
                this.ldSubmit.set(false);

                this.alertService.showToast({
                  position: 'top-end',
                  icon: "success",
                  title: "Se registro el establecimiento con éxito",
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
        },
      })
    )
  }

  loadTiposEstablecimiento(): void{
    this.ldTipoEstablecimiento.set(true);
    this.subs.add(
      this.catalogoApiService.getTipoEstablecimiento().subscribe({
        next: (value: TipoEstablecimientoDTO[]) => {
          this.tiposEstablecimiento.set(value);
          this.ldTipoEstablecimiento.set(false);
        },
        error: (err: HttpErrorResponse) => {
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
          this.ldTipoEstablecimiento.set(false);
        },
      })
    )
  }

}