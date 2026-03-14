import { Component } from "@angular/core";
import { CardModule } from "primeng/card";

@Component({
  selector: 'app-loader',
  imports: [
    CardModule
  ],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  providers: []
})
export class LoaderComponent{

}
