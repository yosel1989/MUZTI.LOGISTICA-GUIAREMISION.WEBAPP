import { Directive, ElementRef, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appDragScroll]'
})
export class DragScrollDirective implements AfterViewInit, OnChanges {
  @Input('appDragScroll') targetSelector: string | null = null;

  private isDown = false;
  private startX = 0;
  private targetEl: HTMLElement | null = null;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.initListeners();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['targetSelector']) {
      this.initListeners();
    }
  }

  private initListeners() {
    if (!this.targetSelector) return;

    this.targetEl = this.el.nativeElement.querySelector(this.targetSelector) || this.el.nativeElement;
    if (!this.targetEl) return;

    // Limpia listeners previos si es necesario
    this.targetEl.onmousedown = (e: MouseEvent) => {
      this.isDown = true;
      this.startX = e.pageX;
      this.targetEl!.classList.add('dragging');
    };

    this.targetEl.onmouseleave = () => {
      this.isDown = false;
      this.targetEl!.classList.remove('dragging');
    };

    this.targetEl.onmouseup = () => {
      this.isDown = false;
      this.targetEl!.classList.remove('dragging');
    };

    this.targetEl.onmousemove = (e: MouseEvent) => {
      if (!this.isDown) return;
      e.preventDefault();
      const walk = e.movementX;
      this.targetEl!.scrollLeft -= walk;
    };
  }
}
