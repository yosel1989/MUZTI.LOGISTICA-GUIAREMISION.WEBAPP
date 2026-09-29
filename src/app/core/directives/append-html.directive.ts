import { Directive, ElementRef, effect, inject, input, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Directive({ selector: '[appendHTML]', standalone: true })
export class AppendHtmlDirective {
  appendHTML = input<string | null | undefined>('');

  private el = inject(ElementRef<HTMLElement>);
  private sanitizer = inject(DomSanitizer);
  private insertados: ChildNode[] = [];

  constructor() {
    effect(() => {
      // quitar lo que se insertó antes, sin tocar el resto del contenido
      this.insertados.forEach(n => n.remove());
      this.insertados = [];

      const html = this.sanitizer.sanitize(SecurityContext.HTML, this.appendHTML() ?? '') ?? '';
      const tpl = document.createElement('template');
      tpl.innerHTML = html;
      this.insertados = Array.from(tpl.content.childNodes);
      this.el.nativeElement.append(...this.insertados);
    });
  }
}