import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
  signal,
  Input,
  effect
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
import { MdlListadoItemsComponent } from '../../modals/mdl-lista-items/mdl-items-listado';
import { Subscription } from 'rxjs';
import { ItemsToAddGuiaDto } from 'app/features/items/models/item-to-guia';
import { unitofMeasures } from 'app/fake/items/data/unitOfMeasure';
import { SelectModule } from 'primeng/select';
import { UnitOfMeasure } from 'app/features/items/models/unit-of-measure';
import { SubNationalCode } from 'app/features/items/models/sub-national-code';
import { CODIGO_SUBNACIONAL_FAKE } from 'app/fake/items/data/subNationalCode';
import { AlertService } from 'app/core/services/alert.service';
import { tablerAlertCircle } from '@ng-icons/tabler-icons';
import { GR_ProductoRequestDto, GuiaRemisionDetalleDto } from 'app/features/guia-remision/models/guia-remision.model';
import { CardModule } from 'primeng/card';
import { OnlyUpperDirective } from '@core/directives/only-uppers.directive';

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

  private _detalle = signal<GuiaRemisionDetalleDto[]>([]);
  @Input() set detalle(value: GuiaRemisionDetalleDto[]) {
      if (this._detalle() !== value) {
          this._detalle.set(value);
      }
  }

  ref: any | undefined;

  @ViewChild('menuUnidadMedida') menuUnidadMedida!: Menu;
  products!: any[];
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
  

  constructor(
    private fb: FormBuilder,
    public dialogService: DialogService,
    private cdr: ChangeDetectorRef,
    private alertService: AlertService,
  ) {
    this.form = this.fb.group({
      items: this.fb.array([]),
      description: new FormControl(null),
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

  private get f(): any {
    return this.form.controls;
  }

  get getFormData(): { description: string; items: GR_ProductoRequestDto[] } {
    return {
      description: this.f.description.value,
      items: (this.items as FormArray).controls.map((element: any) => {
        return {
          cantidad: element.get('cantidad')?.value,
          codigo_um: element.get('unidad')?.value,
          codigo: element.get('codigo')?.value,
          descripcion: element.get('descripcion')?.value,
          codigo_sunat: element.get('codigo_sunat')?.value,
          gtin: element.get('gtin')?.value,
          codigo_subnacional: element.get('codigo_subnacional')?.value,
          bien_normalizado: element.get('bien_normalizado')?.value,
        };
      }),
    };
  }

  get valid(): boolean {
    return this.form.valid;
  }

  get invalid(): boolean {
    return this.form.invalid;
  }

  ngOnInit(): void {
    this.unitOfMeasures = unitofMeasures;
    this.subNationalCodes = CODIGO_SUBNACIONAL_FAKE;
    this.handlerInit(5);
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  getCantidadControl(index: number): AbstractControl {
    return this.items.at(index).get('cantidad')!;
  }

  // functions
  newItem(detalle: GuiaRemisionDetalleDto | null = null): FormGroup {
    console.log('detalle', detalle);
    return detalle ? this.fb.group({
      cantidad: [detalle.cantidad, Validators.required],
      unidad: [detalle.codigo_um, Validators.required],
      codigo: [detalle.codigo],
      descripcion: [detalle.descripcion, Validators.required],
      codigo_sunat: [detalle.codigo_sunat],
      gtin: [detalle.gtin],
      codigo_subnacional: [detalle.codigo_subnacional],
      bien_normalizado: [detalle.bien_normalizado],
    }) : this.fb.group({
      cantidad: [1, Validators.required],
      unidad: ['NIU', Validators.required],
      codigo: [null],
      descripcion: [null, Validators.required],
      codigo_sunat: [null],
      gtin: [null],
      codigo_subnacional: [null],
      bien_normalizado: [false],
    });
  }

  addItems(items: ItemsToAddGuiaDto[]): void {
    for (let item of items) {
      const row = this.fb.group({
        cantidad: [1, Validators.required],
        unidad: [item.unit_of_measure, Validators.required],
        codigo: [item.code],
        descripcion: [item.description, Validators.required],
        codigo_sunat: [null],
        gtin: [null],
        codigo_subnacional: [null],
        bien_normalizado: [false],
      });

      row.get('bien_normalizado')?.valueChanges.subscribe((value: any) => {
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
    this.cdr.markForCheck();
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
        title: 'Se tiene que completar los datos obligatorios en la sección de productos.',
        showCloseButton: true,
        timerProgressBar: true,
        timer: 4000,
      });
      console.log('invalid form productos', this.form);
      return false;
    }

    return true;
  }

  evtShowList(): void {
    this.ref = this.dialogService.open(MdlListadoItemsComponent, {
      width: '1000px',
      keepInViewport: false,
      closable: true,
      modal: true,
      draggable: false,
      position: 'top',
      header: `Agregar lista de ítems a mi guía de remisión`,
      styleClass: 'max-h-none!',
      maskStyleClass: 'overflow-y-auto py-4',
      contentStyle: {
        padding: '0 !important',
      },


      appendTo: 'body',
    });

    const sub = this.ref.onChildComponentLoaded.subscribe((cmp: MdlListadoItemsComponent) => {
      const sub2 = cmp?.OnSelect.subscribe((s: ItemsToAddGuiaDto[]) => {
        this.addItems(s);
        this.ref?.close();
      });
      this.subs.add(sub2);
    });

    this.subs.add(sub);
  }

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
    console.log('init2');
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
}
