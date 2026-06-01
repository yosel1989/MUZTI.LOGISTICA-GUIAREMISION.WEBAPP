import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
  signal,
  Input,
  effect,
  inject
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroQuestionMarkCircleSolid } from '@ng-icons/heroicons/solid';
import { InputNumberModule } from 'primeng/inputnumber';
import { Menu, MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { OverlayModule } from 'primeng/overlay';
import { DividerModule } from 'primeng/divider';
import { TextareaModule } from 'primeng/textarea';
import { DialogService } from 'primeng/dynamicdialog';
import { finalize, Subscription } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { UnitOfMeasure } from 'app/features/items/models/unit-of-measure';
import { SubNationalCode } from 'app/features/items/models/sub-national-code';
import { CODIGO_SUBNACIONAL_FAKE } from 'app/fake/items/data/subNationalCode';
import { AlertService } from 'app/core/services/alert.service';
import { tablerAlertCircle } from '@ng-icons/tabler-icons';
import { GR_ProductoRequestDto, GuiaRemisionDetalleDto } from 'app/features/guia-remision/models/guia-remision.model';
import { CardModule } from 'primeng/card';
import { OnlyUpperDirective } from '@core/directives/only-uppers.directive';
import { HttpErrorResponse } from '@angular/common/http';
import { CatalogoApiService } from '@features/catalogo/services/catalogo-api.service';
import { UnidadMedidaDTO } from '@features/catalogo/models/catalogo.model';

@Component({
  selector: 'app-section-producto-listado',
  templateUrl: './section-producto-listado.html',
  styleUrls: ['./section-producto-listado.scss'],
  imports: [
    ButtonModule,
    RatingModule,
    TableModule,
    TagModule,
    FormsModule,
    InputTextModule,
    ToggleSwitchModule,
    ReactiveFormsModule,
    TooltipModule,
    NgIcon,
    InputNumberModule,
    MenuModule,
    BadgeModule,
    AvatarModule,
    OverlayModule,
    DividerModule,
    TextareaModule,
    SelectModule,
    CardModule,
    OnlyUpperDirective
  ],
  viewProviders: [provideIcons({ heroQuestionMarkCircleSolid, tablerAlertCircle })],
  providers: [DialogService],
})
export class SectionProductoListadoComponent implements OnInit, AfterViewInit, OnDestroy {

  public dialogService = inject(DialogService);
  private alertService = inject(AlertService);
  private catalogoApiService = inject(CatalogoApiService);

  private _detalle = signal<GuiaRemisionDetalleDto[]>([]);
  @Input() set detalle(value: GuiaRemisionDetalleDto[]) {
      if (this._detalle() !== value) {
          this._detalle.set(value);
      }
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: any | undefined;

  @ViewChild('menuUnidadMedida') menuUnidadMedida!: Menu;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products!: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cols!: any[];

  form: FormGroup = new FormGroup({});

  itemss = [
    {
      label: 'Options',
      items: [
        {
          label: 'Refresh',
          icon: 'pi pi-refresh',
        },
        {
          label: 'Export',
          icon: 'pi pi-upload',
        },
      ],
    },
  ];

  unitOfMeasures: UnitOfMeasure[] = [];
  subNationalCodes: SubNationalCode[] = [];

  private subs = new Subscription();

  submitted = false;

  unidadesMedida = signal<UnidadMedidaDTO[]>([]);
  ldUnidadesMedida = signal(false);

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      items: this.fb.array([])
    });

    effect(() => {
        const detalle = this._detalle();
        if(detalle.length){
          (this.form.get('items') as FormArray).clear();
          this.handlerValueDetalle(detalle);
        }
    });
  }

  // getters
  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get f(): any {
    return this.form.controls;
  }

  get getFormData(): GR_ProductoRequestDto[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.items as FormArray).controls.map((element: any) => {
      return {
        cantidad: element.get('cantidad')?.value,
        unidad_medida_id: element.get('unidad_medida_id')?.value,
        codigo_um: this.unidadesMedida().find(x => x.id === element.get('unidad_medida_id')?.value)?.codigo_sunat ?? 'NIU',
        codigo: element.get('codigo')?.value,
        descripcion: element.get('descripcion')?.value,
        codigo_sunat: element.get('codigo_sunat')?.value,
        gtin: element.get('gtin')?.value,
        codigo_subnacional: element.get('codigo_subnacional')?.value,
        bien_normalizado: element.get('bien_normalizado')?.value,
      };
    });
  }

  get valid(): boolean {
    return this.form.valid;
  }

  get invalid(): boolean {
    return this.form.invalid;
  }

  ngOnInit(): void {
    this.loadUnidadesMedida();
    this.subNationalCodes = CODIGO_SUBNACIONAL_FAKE;
    this.handlerInit(5);
  }

  ngAfterViewInit(): void {

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getCantidadControl(index: number): AbstractControl {
    return this.items.at(index).get('cantidad')!;
  }

  // functions
  newItem(detalle: GuiaRemisionDetalleDto | null = null): FormGroup {
    return detalle ? this.fb.group({
      cantidad: [detalle.cantidad, Validators.required],
      unidad_medida_id: [detalle.unidad_medida_id, Validators.required],
      unidad: [detalle.codigo_um, Validators.required],
      codigo: [detalle.codigo],
      descripcion: [detalle.descripcion, Validators.required],
      codigo_sunat: [detalle.codigo_sunat],
      gtin: [detalle.gtin],
      codigo_subnacional: [detalle.codigo_subnacional],
      bien_normalizado: [detalle.bien_normalizado],
    }) : this.fb.group({
      cantidad: [1, Validators.required],
      unidad_medida_id: [24, Validators.required],
      unidad: ['NIU', Validators.required],
      codigo: [null],
      descripcion: [null, Validators.required],
      codigo_sunat: [null],
      gtin: [null],
      codigo_subnacional: [null],
      bien_normalizado: [false],
    });
  }


  // events
  evtAddItem(submitted: boolean = false): void {
    this.submitted = submitted;
    if (this.items.valid) {
      const row = this.newItem();

      row.get('bien_normalizado')?.valueChanges.subscribe((value: boolean) => {
        row.get('codigo_subnacional')?.setValue(null);
        row.get('codigo_sunat')?.setValue(null);

        if (value) {
          //row.get('codigo_sunat')?.disable();
          row.get('codigo_subnacional')?.addValidators(Validators.required);
          row.get('codigo_sunat')?.addValidators(Validators.required);
        } else {
          //row.get('codigo_sunat')?.enable();
          row.get('codigo_subnacional')?.clearValidators();
          row.get('codigo_sunat')?.clearValidators();
        }

        row.get('codigo_subnacional')?.updateValueAndValidity();
        row.get('codigo_sunat')?.updateValueAndValidity();

        this.cdr.markForCheck();
      });

      this.items.push(row);
    }
  }

  evtRemoveItems(index: number): void {
    this.items.removeAt(index);
  }

  evtOnSubmit(): boolean {
    this.submitted = true;
    if (this.form.invalid) {
      this.alertService.showToast({
        position: 'top-end',
        icon: 'warning',
        title: 'Se tiene que completar los datos obligatorios en la Sección de Productos.',
        showCloseButton: true,
        timerProgressBar: true,
        timer: 4000
      });
      return false;
    }

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evtSelectSubNationalCode(event: any, form: any): void {
    const fg = form as FormGroup;
    fg.get('codigo_sunat')?.setValue(event.value);
  }

  // handlers

  handlerInit(num_items: number): void{
    let count = 0;
    while(count < num_items){

      const row = this.newItem();

      row.get('bien_normalizado')?.valueChanges.subscribe((value: boolean) => {
        row.get('codigo_subnacional')?.setValue(null);
        row.get('codigo_sunat')?.setValue(null);

        if (value) {
          //row.get('codigo_sunat')?.disable();
          row.get('codigo_subnacional')?.addValidators(Validators.required);
          row.get('codigo_sunat')?.addValidators(Validators.required);
        } else {
          //row.get('codigo_sunat')?.enable();
          row.get('codigo_subnacional')?.clearValidators();
          row.get('codigo_sunat')?.clearValidators();
        }

        row.get('codigo_subnacional')?.updateValueAndValidity();
        row.get('codigo_sunat')?.updateValueAndValidity();

        this.cdr.markForCheck();
      });

      this.items.push(row);

      count++;
    }
  }


  handlerValueDetalle(s: GuiaRemisionDetalleDto[]): void{
      if(!s.length){
          return;
      }

      s.forEach(element => {
        const row = this.newItem(element);

        row.get('bien_normalizado')?.valueChanges.subscribe((value: boolean) => {
          row.get('codigo_subnacional')?.setValue(null);
          row.get('codigo_sunat')?.setValue(null);

          if (value) {

            row.get('codigo_subnacional')?.addValidators(Validators.required);
            row.get('codigo_sunat')?.addValidators(Validators.required);
          } else {

            row.get('codigo_subnacional')?.clearValidators();
            row.get('codigo_sunat')?.clearValidators();
          }

          row.get('codigo_subnacional')?.updateValueAndValidity();
          row.get('codigo_sunat')?.updateValueAndValidity();

          this.cdr.markForCheck();
        });

        this.items.push(row);
      });
  }


  // Data

  loadUnidadesMedida(): void{
    this.ldUnidadesMedida.set(true);
    const s = this.catalogoApiService.getUnidadesMedida(null)
      .pipe(finalize(()=>{
        this.ldUnidadesMedida.set(false);
      }))
      .subscribe({
        next: (value: UnidadMedidaDTO[]) =>  {
          this.unidadesMedida.set(value);
        },
        error: (err: HttpErrorResponse) => {
          this.alertService.showToast({
            title: err.error.detalle,
            icon: 'error',
            timer: 4000,
            timerProgressBar: true,
            showCloseButton: true
          })
        },
      });

    this.subs.add(s);
  }
}
