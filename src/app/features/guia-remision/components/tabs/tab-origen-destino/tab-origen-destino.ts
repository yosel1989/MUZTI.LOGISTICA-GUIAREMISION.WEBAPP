import { AfterViewInit, Component, effect, inject, Input, OnChanges, OnDestroy, OnInit, signal, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";

import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { NgIcon, provideIcons } from "@ng-icons/core";

import { tablerAlertCircle } from "@ng-icons/tabler-icons";
import { MessageService } from 'primeng/api';
import { MessageModule } from "primeng/message";
import { GR_DestinoRequestDto, GR_OrigenRequestDto } from "app/features/guia-remision/models/guia-remision.model";
import { AlertService } from "app/core/services/alert.service";
import { EstablecimientoDTO } from "@features/establecimiento/models/establecimiento.model";
import { SelectDepartamentoComponent } from "@features/ubigeo/components/selects/select-departamento/select-departamento";
import { SelectProvinciaComponent } from "@features/ubigeo/components/selects/select-provincia/select-provincia";
import { SelectDistritoComponent } from "@features/ubigeo/components/selects/select-distrito/select-distrito";

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

export class TabOrigenDestinoComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges{
    messageService = inject(MessageService);

    private _remitente = signal<EstablecimientoDTO | null>(null);
    private _destinatario = signal<EstablecimientoDTO | null>(null);
    @Input() set remitente(value: EstablecimientoDTO | null) {
        if (this._remitente() !== value) {
            this._remitente.set(value);
        }
    }
    @Input() set destinatario(value: EstablecimientoDTO | null) {
        if (this._destinatario() !== value) {
            this._destinatario.set(value);
        }
    }

    @ViewChild("departamentoOrigen") departamentoOrigen: SelectDepartamentoComponent | undefined;
    @ViewChild("provinciaOrigen") provinciaOrigen: SelectProvinciaComponent | undefined;
    @ViewChild("distritoOrigen") distritoOrigen: SelectDistritoComponent | undefined;

    @ViewChild("departamentoDestino") departamentoDestino: SelectDepartamentoComponent | undefined;
    @ViewChild("provinciaDestino") provinciaDestino: SelectProvinciaComponent | undefined;
    @ViewChild("distritoDestino") distritoDestino: SelectDistritoComponent | undefined;
    
    formGroupOrigen: FormGroup = new FormGroup({});
    formGroupDestino: FormGroup = new FormGroup({});
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private alertService: AlertService
    ) {
        this.formGroupOrigen = this.formBuilder.group({
            idDepartamento : new FormControl({value: null, disabled: true}, Validators.required),
            idProvincia : new FormControl({value: null, disabled: true}, Validators.required),
            idDistrito : new FormControl({value: null, disabled: true}, Validators.required),
            direccion : new FormControl({value: null, disabled: true}, Validators.required),
            pais : new FormControl('PE', Validators.required)
        });
        this.formGroupDestino = this.formBuilder.group({
            idDepartamento : new FormControl({value: null, disabled: true}, Validators.required),
            idProvincia : new FormControl({value: null, disabled: true}, Validators.required),
            idDistrito : new FormControl({value: null, disabled: true}, Validators.required),
            direccion : new FormControl({value: null, disabled: true}, Validators.required),
            pais : new FormControl('PE', Validators.required)
        });

        effect(() => {
            const remitente = this._remitente();
            this.handlerValueRemitente(remitente);
        });

        effect(() => {
            const destinatario = this._destinatario();
            this.handlerValueDestinatario(destinatario);
        });
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes['remitente']){

        }
        if(changes['destinatario']){

        }
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

    // handlers

    handlerValueRemitente(s: EstablecimientoDTO | null): void{
        if(!s){
            this.resetOrigenForm();
            return;
        }

        this.formGroupOrigen.patchValue({
            direccion: s.direccion,
            idDepartamento: s.ubigeo_id!.substring(0,2)
        });
        this.provinciaOrigen!.valueEdit = s.ubigeo_id!.substring(0,4);
        const subProvincia1 = this.provinciaOrigen?.loading.subscribe(res => {
            this.formGroupOrigen.get('idProvincia')?.setValue(s.ubigeo_id.substring(0,4));
        });
        this.distritoOrigen!.valueEdit = s.ubigeo_id;
        const subDistrito1 = this.distritoOrigen?.loading.subscribe((res: any) => {
            this.formGroupOrigen.get('idDistrito')?.setValue(s.ubigeo_id);
        });
        subProvincia1?.unsubscribe();
        subDistrito1?.unsubscribe();
    }

    handlerValueDestinatario(s: EstablecimientoDTO | null): void{
        if(!s){
            this.resetDestinoForm();
            return;
        }

        this.formGroupDestino.patchValue({
            direccion: s.direccion,
            idDepartamento: s.ubigeo_id!.substring(0,2)
        });
        this.provinciaDestino!.valueEdit = s.ubigeo_id!.substring(0,4);
        const subProvincia1 = this.provinciaDestino?.loading.subscribe(res => {
            this.formGroupDestino.get('idProvincia')?.setValue(s.ubigeo_id.substring(0,4));
        });
        this.distritoDestino!.valueEdit = s.ubigeo_id;
        const subDistrito1 = this.distritoDestino?.loading.subscribe((res: any) => {
            this.formGroupDestino.get('idDistrito')?.setValue(s.ubigeo_id);
        });
        subProvincia1?.unsubscribe();
        subDistrito1?.unsubscribe();
    }

    // functions

    resetOrigenForm(): void{
        this.formGroupOrigen.reset({
            pais: 'PE'
        });
    }

    resetDestinoForm(): void{
        this.formGroupDestino.reset({
            pais: 'PE'
        });
    }

}