import { Directive, ElementRef, Input, AfterViewInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appDragScroll]'
})
export class DragScrollDirective implements AfterViewInit, OnChanges, OnDestroy {
  @Input('appDragScroll') targetSelector: string | null = null;

  private targetEl: HTMLElement | null = null;

  private isDown = false;
  private startX = 0;

  // Handlers guardados para poder removerlos
  private onMouseDown = (e: MouseEvent) => {
    this.isDown = true;
    this.startX = e.pageX;
    this.targetEl!.classList.add('dragging');
  };

  private onMouseLeave = () => {
    this.isDown = false;
    this.targetEl!.classList.remove('dragging');
  };

  private onMouseUp = () => {
    this.isDown = false;
    this.targetEl!.classList.remove('dragging');
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isDown) return;
    e.preventDefault();
    const walk = e.movementX;
    this.targetEl!.scrollLeft -= walk;
  };

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.initListeners();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['targetSelector']) {
      this.removeListeners();
      this.initListeners();
    }
  }

  ngOnDestroy() {
    this.removeListeners();
  }

  private initListeners() {
    if (!this.targetSelector) return;

    this.targetEl = this.el.nativeElement.querySelector(this.targetSelector) || this.el.nativeElement;
    if (!this.targetEl) return;

    this.targetEl.addEventListener('mousedown', this.onMouseDown);
    this.targetEl.addEventListener('mouseleave', this.onMouseLeave);
    this.targetEl.addEventListener('mouseup', this.onMouseUp);
    this.targetEl.addEventListener('mousemove', this.onMouseMove);
  }

  private removeListeners() {
    if (!this.targetEl) return;

    this.targetEl.removeEventListener('mousedown', this.onMouseDown);
    this.targetEl.removeEventListener('mouseleave', this.onMouseLeave);
    this.targetEl.removeEventListener('mouseup', this.onMouseUp);
    this.targetEl.removeEventListener('mousemove', this.onMouseMove);

    this.targetEl = null;
  }
}
