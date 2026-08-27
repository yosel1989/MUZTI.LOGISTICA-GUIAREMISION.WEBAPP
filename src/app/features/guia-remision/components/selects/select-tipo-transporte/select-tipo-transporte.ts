import { Component, Input, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-select-tipo-transporte',
  templateUrl: './select-tipo-transporte.html',
  styleUrl: './select-tipo-transporte.scss',
  imports: [
    SelectModule, 
    ReactiveFormsModule, 
    FormsModule,
    SkeletonModule
  ]
})

export class SelectTipoTransporte implements OnInit{

    @Input() classLabel: string = '';
    @Input() label: string = 'Tipo Transporte';
    @Input() placeholder: string = 'Seleccionar...';
    @Input() placeholderLoading: string = 'Cargando...';
    @Input() inputId: string = '';
    @Input() invalid: boolean = false;
    @Input() filter: boolean = false;
    @Input() control!: FormControl;
    @Input() skeleton: boolean = false;

    data  = signal<{value: string, label: string}[]>([
        {value: 'PRIVADO', label: 'TRANSPORTE PRIVADO'},
        {value: 'PUBLICO', label: 'TRANSPORTE PÚBLICO'}
    ]);

    selected = signal<'PRIVADO' | 'PUBLICO'>('PRIVADO');

    ngOnInit(): void {
      this.control.valueChanges.subscribe(res => {
        this.selected.set(res);
      });
    }
}