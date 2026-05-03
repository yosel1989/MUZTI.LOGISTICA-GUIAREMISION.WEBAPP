import { AfterViewInit, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SelectModule } from "primeng/select";

@Component({
    selector: "app-select-estado",
    templateUrl: "./select-estado.html",
    styleUrls: ["./select-estado.scss"],
    imports: [
        SelectModule,
        ReactiveFormsModule,
        FormsModule
    ]
})

export class SelectEstadoComponent implements OnInit, AfterViewInit, OnDestroy{

    @Input() classLabel: string = '';
    @Input() label: string = 'Departamento';
    @Input() placeholder: string = 'Seleccionar...';
    @Input() placeholderLoading: string = 'Cargando...';
    @Input() inputId: string = '';
    @Input() invalid: boolean = false;
    @Input() control!: FormControl;
    @Input() skeleton: boolean = false;
    @Input() filter: boolean = false;

    options = [
        { value: 1, label: "ACTIVO" },
        { value: 0, label: "INACTIVO" }
    ];

    ngOnInit(): void {
        
    }

    ngAfterViewInit(): void {
        
    }

    ngOnDestroy(): void {
        
    }
}   