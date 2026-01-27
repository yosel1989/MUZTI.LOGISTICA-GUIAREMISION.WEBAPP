import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroQuestionMarkCircleSolid } from "@ng-icons/heroicons/solid";
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
import { ItemsToGuiaDto } from 'app/features/items/models/item-to-guia';
import { unitofMeasures } from 'app/fake/items/models/unitOfMeasure';
import { SelectModule } from 'primeng/select';
import { UnitOfMeasure } from 'app/features/items/models/unit-of-measure';

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
    SelectModule
  ],
  viewProviders: [provideIcons({ heroQuestionMarkCircleSolid })],
  providers: [DialogService]
})


export class SectionProductoListadoComponent implements OnInit, AfterViewInit, OnDestroy{

  ref: any | undefined;

  @ViewChild("menuUnidadMedida") menuUnidadMedida!: Menu;
  products!: any[];
  cols!: any[];

  form: FormGroup = new FormGroup({});

  itemss = [
            {
                label: 'Options',
                items: [
                    {
                        label: 'Refresh',
                        icon: 'pi pi-refresh'
                    },
                    {
                        label: 'Export',
                        icon: 'pi pi-upload'
                    }
                ]
            }
        ];

  unitOfMeasures: UnitOfMeasure[] = [];
  
  private subs = new Subscription();

  constructor(
    private fb: FormBuilder,
    public dialogService: DialogService,
    private cdr: ChangeDetectorRef
  ){
    this.form = this.fb.group({ 
      items: this.fb.array([this.newItem()])
    });
  }

  // getters
  get items(): FormArray { 
    return this.form.get('items') as FormArray; 
  }

  ngOnInit(): void {
    this.unitOfMeasures = unitofMeasures;
  }
  ngAfterViewInit(): void {
  }
  ngOnDestroy(): void {
    
  }

  getSeverity(status: string): "success" | "info" | "warn" | "danger" | "contrast" | null | undefined {
      switch (status) {
          case 'INSTOCK':
              return 'success';
          case 'LOWSTOCK':
              return 'warn';
          case 'OUTOFSTOCK':
              return 'danger';
          default:
              return undefined;
      }
  }

  // functions
  newItem(): FormGroup { 
    return this.fb.group({ 
      cantidad: [ null, Validators.required], 
      unidad: [null, Validators.required], 
      codigo: [null],
      descripcion: [null, Validators.required],
      codigo_sunat: [null], 
      gtin: [null], 
      codigo_subnacional: [null], 
      bien_normalizado: [false]
    }); 
  }

  addItems(items: ItemsToGuiaDto[]): void {
    for (let item of items) {
      const row = this.fb.group({
        cantidad: [1, Validators.required],
        unidad: [item.unit_of_measure, Validators.required],
        codigo: [item.code],
        descripcion: [item.description, Validators.required],
        codigo_sunat: [null],
        gtin: [null],
        codigo_subnacional: [null],
        bien_normalizado: [false]
      });

      row.get('bien_normalizado')?.valueChanges.subscribe((value: any) => { 
        console.log('dd');
        if (value) { 
          row.get('codigo_sunat')?.disable(); 
        } 
        else { 
          row.get('codigo_sunat')?.enable(); 
        } 
        this.cdr.markForCheck(); 
      });

      this.items.push(row);
    }
    this.cdr.markForCheck();
  }


  // events
  evtAddItem(): void{
    if(this.items.valid){
      const row = this.newItem();

      row.get('bien_normalizado')?.valueChanges.subscribe((value: boolean) => { 

        console.log(value);
        if (value) { 
          row.get('codigo_sunat')?.disable(); 
        } 
        else { 
          row.get('codigo_sunat')?.enable(); 
        } 
        this.cdr.markForCheck(); 
      });

      this.items.push(row);
    }
  }
  
  evtRemoveItems(index: number): void{
    this.items.removeAt(index);
  }

  evtOnSubmit(): void{

  }

  evtShowMenuUnidad(event: Event): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    // Altura disponible debajo del input
    const espacioAbajo = window.innerHeight - rect.bottom;
    // Altura disponible arriba del input
    const espacioArriba = rect.top;

    // Altura aproximada del menú (ajusta según tu diseño)
    const alturaMenu = 200;

    if (espacioAbajo < alturaMenu && espacioArriba > alturaMenu) {
      // 👆 Mostrar arriba
      this.menuUnidadMedida?.toggle(event);
      // Forzar clase CSS para abrir hacia arriba
      setTimeout(() => {
        const overlay = document.querySelector('.p-menu-overlay') as HTMLElement;
        if (overlay) {
          overlay.style.top = `${rect.top - alturaMenu}px`;
          overlay.style.left = `${rect.left}px`;
        }
      });
    } else {
      // 👇 Mostrar abajo (comportamiento normal)
      this.menuUnidadMedida?.toggle(event);
    }
  }

  evtShowList(): void{
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
        'padding': "0 !important"
      },

      appendTo: 'body'
    });

    const sub = this.ref.onChildComponentLoaded.subscribe((cmp: MdlListadoItemsComponent) => {
      const sub2 = cmp?.OnSelect.subscribe(( s: ItemsToGuiaDto[]) => {

        console.log(s);
        this.addItems(s);
        this.ref?.close();
        /*this.alertService.showToast({
          position: 'bottom-end',
          icon: "success",
          title: "Se cambio el estado con éxito",
          showCloseButton: true,
          timerProgressBar: true,
          timer: 4000
        });*/
      });
      this.subs.add(sub2);
    });

    this.subs.add(sub);
  }

}