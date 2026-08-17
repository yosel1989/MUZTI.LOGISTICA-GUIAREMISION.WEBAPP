import { Component, inject } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { TooltipModule } from "primeng/tooltip";

@Component({
    selector: 'app-mdl-header',
    templateUrl: './mdl-header.html',
    styleUrl: './mdl-header.scss',
    imports: [
        ButtonModule,
        TooltipModule
    ]
})

export class MdlHeader{
    public dialogRef =  inject(DynamicDialogRef);
    public config = inject(DynamicDialogConfig);
}