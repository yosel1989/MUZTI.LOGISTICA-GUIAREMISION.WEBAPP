import { ViewportScroller } from '@angular/common';
import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  providers: [],
})

export class App {
  protected readonly title = signal('MUTZI.LOGISTICO-GUIAREMISION.WEBAPP');

  constructor(private router: Router, private viewportScroller: ViewportScroller) {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.viewportScroller.scrollToPosition([0, 0])
      }
    });
  }
}
