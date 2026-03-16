import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { TipoGuiaRemisionEnum } from "@features/guia-remision/enums/guia-remision.enum";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { PanelModule } from 'primeng/panel';
import { SelectModule } from "primeng/select";
import { TooltipModule } from "primeng/tooltip";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { OnlyNumberDirective } from "app/core/directives/only-numbers.directive";


@Component({
    selector: 'app-flt-guia-remision-principal',
    templateUrl: './flt-guia-remision-principal.html',
    styleUrl: './flt-guia-remision-principal.scss',
    imports: [
        PanelModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        TooltipModule,
        SelectModule,
        IconFieldModule,
        InputIconModule,
        TooltipModule,
        OnlyNumberDirective
    ]
})

export class FltGuiaRemisionPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    formGroup: FormGroup = new FormGroup({});
    tiposGuia: {label: string, value: string | null}[] = [ 
        { label: 'Guía Remitente', value: TipoGuiaRemisionEnum.remitente }, 
        { label: 'Guía Transportista', value: TipoGuiaRemisionEnum.transportista }
    ];

    constructor(
        private fb: FormBuilder
    ){
        this.formGroup = this.fb.group({
            rucEmpresa: new FormControl(null),
            tipoGuia: new FormControl(null),
            numeroGuia: new FormControl(null),
        });
    }

    ngOnInit(): void {
        
    }
    ngAfterViewInit(): void {
        
    }
    ngOnDestroy(): void {
        
    }


    // Events

    evtClearControl(nameControl: string): void{
        this.formGroup.get(nameControl)?.setValue(null);
    }
}