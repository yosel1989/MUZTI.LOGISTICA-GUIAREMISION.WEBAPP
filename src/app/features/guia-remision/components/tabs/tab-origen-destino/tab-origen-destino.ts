import { AfterViewInit, Component, inject, Input, OnChanges, OnDestroy, OnInit, signal} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
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
//import { SelectDepartamentoComponent } from "@features/ubigeo/components/selects/select-departamento/select-departamento";
//import { SelectProvinciaComponent } from "@features/ubigeo/components/selects/select-provincia/select-provincia";
//import { SelectDistritoComponent } from "@features/ubigeo/components/selects/select-distrito/select-distrito";

@Component({
  selector: 'app-tab-origen-destino',
  templateUrl: './tab-origen-destino.html',
  styleUrl: './tab-origen-destino.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TabsModule,
    InputTextModule,
    CardModule,
    NgIcon,
    MessageModule,
    //SelectDepartamentoComponent,   
    //SelectProvinciaComponent,
    //SelectDistritoComponent
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

    /*@ViewChild("departamentoOrigen") departamentoOrigen: SelectDepartamentoComponent | undefined;
    @ViewChild("provinciaOrigen") provinciaOrigen: SelectProvinciaComponent | undefined;
    @ViewChild("distritoOrigen") distritoOrigen: SelectDistritoComponent | undefined;

    @ViewChild("departamentoDestino") departamentoDestino: SelectDepartamentoComponent | undefined;
    @ViewChild("provinciaDestino") provinciaDestino: SelectProvinciaComponent | undefined;
    @ViewChild("distritoDestino") distritoDestino: SelectDistritoComponent | undefined;*/
    
    //formGroupOrigen: FormGroup = new FormGroup({});
    //formGroupDestino: FormGroup = new FormGroup({});
    submitted = signal(false);

    constructor(
        //private formBuilder: FormBuilder,
        private alertService: AlertService
    ) {
        /*this.formGroupOrigen = this.formBuilder.group({
            idDepartamento : new FormControl({value: null, disabled: false}, Validators.required),
            idProvincia : new FormControl({value: null, disabled: false}, Validators.required),
            idDistrito : new FormControl({value: null, disabled: false}, Validators.required),
            direccion : new FormControl({value: null, disabled: false}, Validators.required),
            pais : new FormControl('PE', Validators.required)
        });
        this.formGroupDestino = this.formBuilder.group({
            idDepartamento : new FormControl({value: null, disabled: false}, Validators.required),
            idProvincia : new FormControl({value: null, disabled: false}, Validators.required),
            idDistrito : new FormControl({value: null, disabled: false}, Validators.required),
            direccion : new FormControl({value: null, disabled: false}, Validators.required),
            pais : new FormControl('PE', Validators.required)
        });*/

        /*effect(() => {
            const remitente = this._remitente();
            //this.handlerValueRemitente(remitente);
        });

        effect(() => {
            const destinatario = this._destinatario();
            //this.handlerValueDestinatario(destinatario);
        });*/
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
    }

    ngOnChanges(): void {
    }

    // getters

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    /*get f_origen(): any {
        return this.formGroupOrigen.controls;
    }*/

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    /*get f_destino(): any {
        return this.formGroupDestino.controls;
    }*/

    get invalid(): boolean{
        return !this.remitente || !this.destinatario;
    }

    get valid(): boolean {
        return !!(this.remitente && this.destinatario);
    }


    get getFormData(): {origen: GR_OrigenRequestDto, destino: GR_DestinoRequestDto} {
        return {
            origen: {
                ubigeo_id: this.remitente!.ubigeo_id,
                direccion: this.remitente!.direccion,
                pais: this.remitente!.pais,
            },
            destino: {
                ubigeo_id: this.destinatario!.ubigeo_id,
                direccion: this.destinatario!.direccion,
                pais: this.destinatario!.pais,
            }
        }
    }

    get remitente(): EstablecimientoDTO | null {
        return this._remitente();
    }

    get destinatario(): EstablecimientoDTO | null {
        return this._destinatario();
    }

    evtOnSubmit(): boolean {
        this.submitted.set(true);

        if(!this.remitente){
            this.alertService.showToast({
                position: 'top-end',
                icon: "warning",
                title: "Se tiene que completar los datos obligatorios en la sección de punto de partida.",
                showCloseButton: true,
                timerProgressBar: true,
                timer: 4000
            });
            return false;
        }

        if(!this.destinatario){
            this.alertService.showToast({
                position: 'top-end',
                icon: "warning",
                title: "Se tiene que completar los datos obligatorios en la sección de punto de llegada.",
                showCloseButton: true,
                timerProgressBar: true,
                timer: 4000
            });
            return false;
        }

        return true;
    }

    evtOnReset(): void {
        //this.submitted = false;
        //this.resetOrigenForm();
        //this.resetDestinoForm();
    }

    // handlers

    //handlerValueRemitente(s: EstablecimientoDTO | null): void{
        /*if(!s){
            this.resetOrigenForm();
            return;
        }*/

        /*this.formGroupOrigen.patchValue({
            direccion: s.direccion,
            idDepartamento: s.ubigeo_id!.substring(0,2)
        });*/
        /*this.provinciaOrigen!.valueEdit = s.ubigeo_id!.substring(0,4);
        const subProvincia1 = this.provinciaOrigen?.isLoaded.subscribe(() => {
            this.formGroupOrigen.get('idProvincia')?.setValue(s.ubigeo_id.substring(0,4));
        });
        this.distritoOrigen!.valueEdit = s.ubigeo_id;
        const subDistrito1 = this.distritoOrigen?.isLoaded.subscribe(() => {
            this.formGroupOrigen.get('idDistrito')?.setValue(s.ubigeo_id);
        });
        subProvincia1?.unsubscribe();
        subDistrito1?.unsubscribe();*/
    //}

    /*handlerValueDestinatario(s: EstablecimientoDTO | null): void{
        if(!s){
            this.resetDestinoForm();
            return;
        }

        this.formGroupDestino.patchValue({
            direccion: s.direccion,
            idDepartamento: s.ubigeo_id!.substring(0,2)
        });
        this.provinciaDestino!.valueEdit = s.ubigeo_id!.substring(0,4);
        const subProvincia1 = this.provinciaDestino?.isLoaded.subscribe(() => {
            this.formGroupDestino.get('idProvincia')?.setValue(s.ubigeo_id.substring(0,4));
        });
        this.distritoDestino!.valueEdit = s.ubigeo_id;
        const subDistrito1 = this.distritoDestino?.isLoaded.subscribe(() => {
            this.formGroupDestino.get('idDistrito')?.setValue(s.ubigeo_id);
        });
        subProvincia1?.unsubscribe();
        subDistrito1?.unsubscribe();
    }*/

    // functions

    /*resetOrigenForm(): void{
        this.formGroupOrigen.reset({
            pais: 'PE'
        });
    }*/

    /*resetDestinoForm(): void{
        this.formGroupDestino.reset({
            pais: 'PE'
        });
    }*/

}