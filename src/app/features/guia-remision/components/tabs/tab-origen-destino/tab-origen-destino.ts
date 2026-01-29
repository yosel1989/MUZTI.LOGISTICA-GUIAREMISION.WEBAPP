import { AfterViewInit, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";

import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { SelectDepartamentoComponent } from "../../selects/select-departamento/select-departamento";
import { SelectProvinciaComponent } from "../../selects/select-provincia/select-provincia";
import { SelectDistritoComponent } from "../../selects/select-distrito/select-distrito";
import { NgIcon, provideIcons } from "@ng-icons/core";

import { tablerAlertCircle } from "@ng-icons/tabler-icons";
import { MessageService } from 'primeng/api';
import { MessageModule } from "primeng/message";
import { GR_DestinoRequestDto, GR_OrigenRequestDto } from "app/features/guia-remision/models/guia-remision.model";
import { AlertService } from "app/core/services/alert.service";

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
    NgIcon,
    MessageModule
  ],
  viewProviders: [provideIcons({ tablerAlertCircle })],
  providers: [MessageService]
})

export class TabOrigenDestinoComponent implements OnInit, AfterViewInit, OnDestroy{
    messageService = inject(MessageService);
    
    formGroupOrigen: FormGroup = new FormGroup({});
    formGroupDestino: FormGroup = new FormGroup({});
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private alertService: AlertService
    ) {
        this.formGroupOrigen = this.formBuilder.group({
            idDepartamento : new FormControl(null, Validators.required),
            idProvincia : new FormControl(null, Validators.required),
            idDistrito : new FormControl(null, Validators.required),
            direccion : new FormControl(null, Validators.required),
            pais : new FormControl('PE', Validators.required)
        });
        this.formGroupDestino = this.formBuilder.group({
            idDepartamento : new FormControl(null, Validators.required),
            idProvincia : new FormControl(null, Validators.required),
            idDistrito : new FormControl(null, Validators.required),
            direccion : new FormControl(null, Validators.required),
            pais : new FormControl('PE', Validators.required)
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

    get invalid(): boolean{
        return this.f_origen.invalid || this.f_destino.invalid;
    }

    get valid(): boolean{
        return this.f_origen.valid && this.f_destino.valid;
    }

    get getFormData(): {origen: GR_OrigenRequestDto, destino: GR_DestinoRequestDto} {
        return {
            origen: {
                ubigeo_id: this.f_origen.idDistrito.value,
                direccion: this.f_origen.direccion.value,
                pais: this.f_origen.pais.value,
            },
            destino: {
                ubigeo_id: this.f_destino.idDistrito.value,
                direccion: this.f_destino.direccion.value,
                pais: this.f_destino.pais.value,
            }
        }
    }

    evtOnSubmit(): void {
        this.submitted = true;
        if(this.formGroupOrigen.invalid){
            this.alertService.showToast({
                position: 'top-end',
                icon: "warning",
                title: "Se tiene que completar los datos obligatorios en la sección de punto de partida.",
                showCloseButton: true,
                timerProgressBar: true,
                timer: 4000
            });
            return;
        }

        if(this.formGroupDestino.invalid){
            this.alertService.showToast({
                position: 'top-end',
                icon: "warning",
                title: "Se tiene que completar los datos obligatorios en la sección de punto de llegada.",
                showCloseButton: true,
                timerProgressBar: true,
                timer: 4000
            });
        }
    }

    evtOnReset(): void {
        this.submitted = false;
        this.formGroupOrigen.reset();
        this.formGroupDestino.reset();
    }
}