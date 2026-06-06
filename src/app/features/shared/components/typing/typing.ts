import { Component, Input, signal, effect } from '@angular/core';

@Component({
  selector: 'app-typing',
  templateUrl: './typing.html',
  styleUrls: ['./typing.scss']
})
export class TypingComponent {
  // Signal que guarda el texto recibido
  private inputText = signal<string>('--');

  // Signal que se va mostrando progresivamente
  displayedText = signal<string>('');

  @Input() set text(value: string) {
    this.inputText.set(value ?? '--');
  }

  constructor() {
    // Effect: cada vez que cambia inputText, reinicia la animación
    effect(() => {
      const newText = this.inputText();
      this.startTyping(newText);
    });
  }

  private startTyping(newText: string) {
    this.displayedText.set('');
    let i = 0;
    const interval = setInterval(() => {
      this.displayedText.update(prev => prev + newText[i]);
      i++;
      if (i === newText.length) {
        clearInterval(interval);
      }
    }, 10);
  }
}
