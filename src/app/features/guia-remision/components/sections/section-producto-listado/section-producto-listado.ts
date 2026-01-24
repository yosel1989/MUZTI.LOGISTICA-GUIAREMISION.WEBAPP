import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild } from '@angular/core';
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
    OverlayModule
  ],
  viewProviders: [provideIcons({ heroQuestionMarkCircleSolid })],
})


export class SectionProductoListadoComponent implements OnInit, AfterViewInit, OnDestroy{

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

  constructor(private fb: FormBuilder){
    this.form = this.fb.group({ 
      items: this.fb.array([this.newItem()])
    });
  }

  // getters
  get items(): FormArray { 
    return this.form.get('items') as FormArray; 
  }

  ngOnInit(): void {
   
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
      codigo: [null, Validators.required],
      descripcion: [null, Validators.required],
      codigo_sunat: [null], 
      gtin: [null], 
      codigo_subnacional: [null], 
      bien_normalizado: [false]
    }); 
  }

  // events
  evtAddItems(): void{
    this.items.push(this.newItem());
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

}