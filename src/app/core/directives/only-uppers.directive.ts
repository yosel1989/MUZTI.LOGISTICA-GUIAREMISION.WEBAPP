import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[onlyUpper]'
})
export class OnlyUpperDirective {
  constructor(private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: any) {
    let valor: string = event.target.value;

    // Convierte a mayúsculas
    valor = valor.toUpperCase();

    // Actualiza el input visual
    event.target.value = valor;

    // Actualiza el FormControl asociado
    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setValue(valor, { emitEvent: false });
    }
  }
}
