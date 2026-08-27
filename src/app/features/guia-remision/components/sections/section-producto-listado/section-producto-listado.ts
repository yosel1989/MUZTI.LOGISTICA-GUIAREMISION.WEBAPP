import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  signal,
  Input,
  effect,
  inject,
  QueryList,
  ElementRef,
  ViewChildren,
  DestroyRef
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { provideIcons } from '@ng-icons/core';
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
import { BienNormalizadoDTO, UnidadMedidaDTO } from '@features/catalogo/models/catalogo.model';
import { MdlImportDetails } from '@features/guia-remision-detalle/components/modals/mdl-import-details/mdl-import-details';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SkeletonModule } from 'primeng/skeleton';
import { MdlHeader } from '@core/components/modals/headers/mdl-header/mdl-header';

@Component({
  selector: 'app-section-producto-listado',
  templateUrl: './section-producto-listado.html',
  styleUrls: ['./section-producto-listado.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    InputNumberModule,
    MenuModule,
    BadgeModule,
    AvatarModule,
    OverlayModule,
    DividerModule,
    TextareaModule,
    SelectModule,
    CardModule,
    OnlyUpperDirective,
    NgClass,
    ScrollingModule,
    SkeletonModule 
  ], 
  viewProviders: [provideIcons({ heroQuestionMarkCircleSolid, tablerAlertCircle })],
  providers: [DialogService],
})
export class SectionProductoListadoComponent implements OnInit, AfterViewInit, OnDestroy {

  destroyRef = inject(DestroyRef);

  @ViewChildren('descripcionInput') descripcionInputs!: QueryList<ElementRef<HTMLInputElement>>;

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
  @ViewChild('scrollContainer', { static: false }) scrollContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('virtualTbody', { static: false }) virtualTbody?: ElementRef<HTMLTableSectionElement>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products!: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cols!: any[];

  form: FormGroup = new FormGroup({});

  estimatedRowHeight = 56;
  viewportHeight = 400;
  renderedStartIndex = 0;

  renderedRows: AbstractControl[] = [];
  topSpacerHeight = 0;
  bottomSpacerHeight = 0;
  private progressiveTimer?: ReturnType<typeof setTimeout>;
  private onWindowResizeBound?: () => void;

  virtualItems!: FormArray;

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

  submitted = signal<boolean>(false);

  unidadesMedida = signal<UnidadMedidaDTO[]>([]);
  ldUnidadesMedida = signal(false);

  bienesNormalizados = signal<BienNormalizadoDTO[]>([]);
  ldBienesNormalizados = signal(false);

  hoveredCell = signal<{ row: number, col: string } | null>(null);
  focusedCell = signal<{ row: number, col: string } | null>(null);

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      items: this.fb.array([], Validators.required)
    });

    this.virtualItems = this.fb.array([]);

    effect(() => {
        const detalle = this._detalle();
        if(detalle.length){
          this.handlerValueDetalle(detalle);
        }
    });
  }

  // getters
  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  trackByRendered(index: number): number {
    return index;
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
        categoria_bien_normalizado_id: element.get('categoria_bien_normalizado_id')?.value,
        bien_normalizado: element.get('bien_normalizado')?.value,
      };
    });
  }

  get invalid(): boolean {
    return this.form.invalid || (this.items.length === 0);
  }

  ngOnInit(): void {
    this.loadUnidadesMedida();
    this.loadBienesNormalizados();
    this.subNationalCodes = CODIGO_SUBNACIONAL_FAKE;
    this.handlerInit(5);
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.onWindowResizeBound) {
      window.removeEventListener('resize', this.onWindowResizeBound);
    }
    if (this.progressiveTimer) {
      clearTimeout(this.progressiveTimer);
    }
  }

  getCantidadControl(index: number): AbstractControl {
    return this.items.at(index).get('cantidad')!;
  }

  getCodigoSubnacionalControl(row: AbstractControl): FormControl {
    return (row as FormGroup).get('codigo_subnacional') as FormControl;
  }

  private resolveUnidadDescription(unidadMedidaId: number | null): string {
    const unidad = this.unidadesMedida().find((u) => u.id === unidadMedidaId);
    return unidad?.descripcion_corta ?? unidad?.descripcion ?? 'NIU';
  }

  private initUnidadControl(row: FormGroup): void {
    const unidadMedidaControl = row.get('unidad_medida_id');
    const unidadControl = row.get('unidad');
    if (!unidadMedidaControl || !unidadControl) {
      return;
    }

    unidadControl.setValue(this.resolveUnidadDescription(unidadMedidaControl.value), { emitEvent: false });

    const sub = unidadMedidaControl.valueChanges.subscribe((value: number | null) => {
      unidadControl.setValue(this.resolveUnidadDescription(value), { emitEvent: false });
    });

    this.subs.add(sub);
  }

  private updateUnidadValues(): void {
    this.items.controls.forEach((control) => {
      const row = control as FormGroup;
      const unidadControl = row.get('unidad');
      const unidadMedidaId = row.get('unidad_medida_id')?.value;
      if (unidadControl) {
        unidadControl.setValue(this.resolveUnidadDescription(unidadMedidaId), { emitEvent: false });
      }
    });
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
      categoria_bien_normalizado_id: [detalle.categoria_bien_normalizado_id],
      bien_normalizado: [detalle.indicador_bien_normalizado],
    }) : this.fb.group({
      cantidad: [1, Validators.required],
      unidad_medida_id: [10, Validators.required],
      unidad: ['NIU', Validators.required],
      codigo: [null],
      descripcion: [null, Validators.required],
      codigo_sunat: [null],
      gtin: [null],
      codigo_subnacional: [null],
      categoria_bien_normalizado_id: [null],
      bien_normalizado: [false],
    });
  }

  private setBienNormalizadoValidators(row: FormGroup, value: boolean): void {
    const codigoSubnacional = row.get('codigo_subnacional');
    const categoriaBienNormalizadoId = row.get('categoria_bien_normalizado_id');
    const codigoSunat = row.get('codigo_sunat');

    if (value) {
      codigoSubnacional?.setValidators([Validators.required]);
      categoriaBienNormalizadoId?.setValidators([Validators.required]);
      codigoSunat?.setValidators([Validators.required]);
    } else {
      codigoSubnacional?.clearValidators();
      categoriaBienNormalizadoId?.clearValidators();
      codigoSunat?.clearValidators();
    }

    codigoSubnacional?.updateValueAndValidity({ emitEvent: false });
    categoriaBienNormalizadoId?.updateValueAndValidity({ emitEvent: false });
    codigoSunat?.updateValueAndValidity({ emitEvent: false });
  }

  private buildItemsFormArray(details: GuiaRemisionDetalleDto[]): FormArray<FormGroup> {
    const array = this.fb.array<FormGroup>([]);

    details.forEach((element) => {
      const row = this.newItem(element);
      this.setBienNormalizadoValidators(row, !!row.get('bien_normalizado')?.value);
      this.initUnidadControl(row);
      array.push(row);
    });

    return array;
  }

  trackByIndex(_index: number): number {
    return this.renderedStartIndex + _index;
  }

  // events
  evtAddItem(submitted: boolean = false): void {
    this.submitted.set(submitted);
    
    const row = this.newItem();
    this.initUnidadControl(row);
    this.items.push(row);
    this.cdr.markForCheck();
    this.setBienNormalizadoValidators(row, !!row.get('bien_normalizado')?.value);
   
  }

  evtRemoveItems(index: number): void {
    this.items.removeAt(index);
    this.renderedStartIndex = Math.max(0, this.renderedStartIndex - 1);
  }

  evtOnSubmit(): boolean {
    this.submitted.set(true);
    if (this.invalid) {
      console.log('Invalido: Datos de Productos');
      this.alertService.showToast({
        position: 'top-end',
        icon: 'warning',
        title: 'Se tiene que completar los datos obligatorios en la Sección de Productos.',
        showCloseButton: true,
        timerProgressBar: true,
        timer: 4000,
        target: 'body'
      });
      return false;
    }

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evtSelectSubNationalCode(event: BienNormalizadoDTO | undefined | null, form: any): void {
    const fg = form as FormGroup;
    fg.get('codigo_sunat')?.setValue(event?.codigo_sunat);
  }

  evtDownloadFormat(): void{
    // placeholder
  }

  evtImportItems(): void{
    this.ref = this.dialogService.open(MdlImportDetails, {
      width: '600px',
      keepInViewport: false,
      closable: false,
      modal: true,
      draggable: false,
      position: 'top',
      header: `Importar Items`,
      styleClass: 'max-h-none!',
      maskStyleClass: 'py-4',
      contentStyle: {
          'padding': "0 !important"
      },
      appendTo: 'body',
      templates: {
          header: MdlHeader
      }
      
    });

    this.ref?.onChildComponentLoaded
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mdl: MdlImportDetails) => {
        mdl?.OnImport
          .subscribe((details: GuiaRemisionDetalleDto[]) => {
            const detailsImported = details;
            this.ref?.close();
            setTimeout(() => {
              const itemsArray = this.form.get('items') as FormArray;
              itemsArray.clear();
              this.handlerValueDetalle(detailsImported);
            });
          });
      });
  }

  evtClear(): void{
    (this.form.get('items') as FormArray).clear();
    this.cdr.markForCheck();
  }

  // handlers

  handlerInit(num_items: number): void{
    let count = 0;
    while(count < num_items){

      this.evtAddItem();

      count++;
    }
  }

  handlerValueDetalle(s: GuiaRemisionDetalleDto[]): void{
      console.log('items', s);
      const newItems = this.buildItemsFormArray(s);
      this.form.setControl('items', newItems);
      newItems.controls.forEach((row) => row.updateValueAndValidity({ emitEvent: false }));
      this.form.updateValueAndValidity({ emitEvent: false });
      this.cdr.markForCheck();
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
          this.updateUnidadValues();
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

  loadBienesNormalizados(): void{
    this.ldBienesNormalizados.set(true);
    const s = this.catalogoApiService.getBienesNormalizados()
    .pipe(finalize(()=>{
      this.ldBienesNormalizados.set(false);
    }))
    .subscribe({
      next: (value: BienNormalizadoDTO[]) =>  {
        this.bienesNormalizados.set(value);
      },
      error: (err: HttpErrorResponse) => {
        this.alertService.showToast({
          title: err.error.detalle,
          icon: 'error',
          timer: 4000,
          timerProgressBar: true,
          showCloseButton: true
        });
      },
    });
    this.subs.add(s);
  }

  // Functions

  isInvalid(index: number, controlName: string): boolean {
    const row = this.items.at(index) as FormGroup;
    return (row.get(controlName)?.invalid ?? false) && this.submitted();
  }

  private isEmptyRow(row: FormGroup): boolean {
    return !row.get('descripcion')?.value
      && !row.get('codigo')?.value
      && !row.get('codigo_sunat')?.value
      && !row.get('gtin')?.value
      && !row.get('codigo_subnacional')?.value
      && !row.get('bien_normalizado')?.value;
  }

  private removeEmptyRows(): void {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const row = this.items.at(i) as FormGroup;
      if (this.isEmptyRow(row)) {
        this.items.removeAt(i);
      }
    }
  }

  isBienNormalizado(index: number): boolean {
    return !!this.items.at(index).get('bien_normalizado')?.value;
  }

  getUnitMeasurementName(id: number): string{
    return this.unidadesMedida().find(x => x.id === id)?.descripcion_corta ?? '--';
  }

  getCodeCategoriaBienNormalizado(id: number): string{
    return this.bienesNormalizados().find(x => x.id === id)?.codigo_sunat ?? '--';
  }

  getDescripcionCategoriaBienNormalizado(id: number): string{
    return this.bienesNormalizados().find(x => x.id === id)?.descripcion ?? '--';
  }

}
