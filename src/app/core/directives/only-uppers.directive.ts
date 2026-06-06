import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[onlyUpper]'
})
export class OnlyUpperDirective {
  constructor(private ngControl: NgControl) {}

  @HostListener('input', ['$event'])

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    const valor: string = input.value.toUpperCase();

    // Actualiza el FormControl asociado
    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setValue(valor, { emitEvent: false });
    }

    // Actualiza el input visual
    input.value = valor;

    // Restaura la posición del cursor
    input.setSelectionRange(start, end);
  }

}
