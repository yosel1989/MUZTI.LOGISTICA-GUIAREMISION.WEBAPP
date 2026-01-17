import { Component, HostBinding } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { ContentComponent } from './content/content';

@Component({
  selector: 'app-layout',
  imports: [
    SidebarComponent,
    ContentComponent,
    RouterOutlet
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'] // ← corregido aquí
})
export class LayoutComponent {
  @HostBinding('class') claseHost = 'flex grow';
}
