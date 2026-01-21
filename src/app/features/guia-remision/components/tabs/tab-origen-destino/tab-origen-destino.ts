import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";

import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { SelectDepartamentoComponent } from "../../selects/select-departamento/select-departamento";
import { SelectProvinciaComponent } from "../../selects/select-provincia/select-provincia";
import { SelectDistritoComponent } from "../../selects/select-distrito/select-distrito";
import { NgIcon, provideIcons } from "@ng-icons/core";

import { tablerAlertCircle } from "@ng-icons/tabler-icons";

@Component({
  selector: 'app-tab-origen-destino',
  templateUrl: './tab-origen-destino.html',
  styleUrl: './tab-origen-destino.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TabsModule,
    InputTextModule,
    SelectDepartamentoComponent,
    SelectProvinciaComponent,
    SelectDistritoComponent,
    CardModule,
    NgIcon
  ],
  viewProviders: [provideIcons({ tablerAlertCircle })]
})

export class TabOrigenDestinoComponent implements OnInit, AfterViewInit, OnDestroy{

    formGroupOrigen: FormGroup = new FormGroup({});
    formGroupDestino: FormGroup = new FormGroup({});
    submitted = false;

    constructor(
        private formBuilder: FormBuilder
    ) {
        this.formGroupOrigen = this.formBuilder.group({
            idDepartamento : new FormControl(null, Validators.required),
            idProvincia : new FormControl(null, Validators.required),
            idDistrito : new FormControl(null, Validators.required),
            direccion : new FormControl(null, Validators.required),
            pais : new FormControl('PE', Validators.required),
        });
        this.formGroupDestino = this.formBuilder.group({
            idDepartamento : new FormControl(null, Validators.required),
            idProvincia : new FormControl(null, Validators.required),
            idDistrito : new FormControl(null, Validators.required),
            direccion : new FormControl(null, Validators.required),
            pais : new FormControl('PE', Validators.required),
        });
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
    }

    // getters
    get f_origen(): any {
        return this.formGroupOrigen.controls;
    }

    get f_destino(): any {
        return this.formGroupDestino.controls;
    }

    evtOnSubmit(): void {
        this.submitted = true;
    }

    evtOnReset(): void {
        this.submitted = false;
        this.formGroupOrigen.reset();
        this.formGroupDestino.reset();
    }
}