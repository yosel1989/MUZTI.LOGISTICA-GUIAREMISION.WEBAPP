import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[onlyNumber]'
})
export class OnlyNumberDirective {

  @HostListener('input', ['$event'])
  onInput(event: any) {
    const valor = event.target.value.replace(/[^0-9]/g, '');
    event.target.value = valor;
  }
  
}