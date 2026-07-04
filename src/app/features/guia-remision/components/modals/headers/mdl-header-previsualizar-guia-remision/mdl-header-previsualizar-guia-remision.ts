import { Component } from "@angular/core";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
    selector: 'mdl-header-previsualizar-guia-remision',
    templateUrl: './mdl-header-previsualizar-guia-remision.html',
    styleUrl: './mdl-header-previsualizar-guia-remision.scss'
})

export class MdlHeaderPrevisualizarGuiaRemisionComponent {
    constructor(
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {}
}