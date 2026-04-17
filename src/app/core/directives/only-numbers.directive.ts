import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[onlyNumber]'
})
export class OnlyNumberDirective {
  constructor(private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: any) {
    const valor = event.target.value.replace(/[^0-9]/g, '');

    // Actualiza el input visual
    event.target.value = valor;

    // Actualiza el FormControl asociado
    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setValue(valor, { emitEvent: false });
    }
  }
}
