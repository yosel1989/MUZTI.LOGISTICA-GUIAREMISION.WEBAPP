import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: 'app-loader2',
  imports: [CommonModule],
  templateUrl: './loader2.component.html',
  styleUrl: './loader2.component.scss',
  providers: []
})
export class Loader2Component{
  @Input() styleClass: string | null = '';

  // Getters

  get classes(): string{
    console.log()
    return `pi pi-spinner-dotted transition  duration-200 animate-spin  ${this.styleClass}`;
  }


}
