import { AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal, viewChild } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { AlertService } from "@core/services/alert.service";
import { LayoutService } from "@core/services/layout.service";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { Subscription } from "rxjs";

import { SignaturePadComponent, NgSignaturePadOptions } from '@almothafar/angular-signature-pad';

@Component({
    selector: 'app-page-firma-principal',
    templateUrl: './page-firma-principal.html',
    styleUrls: ['./page-firma-principal.scss'],
    imports: [
        ReactiveFormsModule,
        DividerModule,
        ButtonModule,
        SignaturePadComponent
    ]
})

export class PageFirmaPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{
    
    public signaturePad = viewChild(SignaturePadComponent);
    public signaturePadOptions: NgSignaturePadOptions = {
        minWidth: 1,
        canvasWidth: 300,
        canvasHeight: 150,
        dotSize: 1
    };
    private alertService = inject(AlertService);
    
    private ls = inject(LayoutService);
    form: FormGroup = new FormGroup({});
    ldSubmit = signal(false);

    private sb = new Subscription();

    editarFirma = signal(false);

    imageUrl = signal<string | undefined>(undefined);

    constructor( private cdr: ChangeDetectorRef){

    }

    ngOnInit(): void {
         this.ls.breadCrumbItems = [
            { label: 'Mi Perfil', labelClass: 'text-[12px]! font-semibold text-primary!' },
            { label: 'Firma', labelClass : 'text-[12px]!' }
        ];
    }

    ngAfterViewInit(): void {
        
    }

    ngOnDestroy(): void {
        this.sb.unsubscribe();
    }
    
    evtOnSubmit(): void{

    }

    evtEditarFirma(): void{
        this.editarFirma.set(!this.editarFirma());

        setTimeout(()=>{
            if(this.signaturePad() && this.imageUrl()){
                this.signaturePad()?.clear();
                this.signaturePad()?.fromDataURL(this.imageUrl()!);
                this.cdr.detectChanges();
            }
        },0);
    }

    evtLimpiarFirma(): void{
        this.signaturePad()?.clear();
    }

    evtGuardarFirma(): void{
        if(this.signaturePad()?.isEmpty()){
            this.alertService.showToast({
                title: "Debe rellenar su firma",
                icon: 'error',
                timer: 4000,
                timerProgressBar: true,
                showCloseButton: true
            });
            return;
        }
        this.imageUrl.set(this.signaturePad()?.toDataURL());
        this.editarFirma.set(false);
    }


    drawComplete(event: MouseEvent | Touch) {
        this.imageUrl.set(this.signaturePad()?.toDataURL());
    }

    drawStart(event: MouseEvent | Touch) {
        // will be notified of szimek/signature_pad's onBegin event
        console.log('Start drawing', event);
    }

    drawCleared() {
        // will be notified when clear() is called on the pad
        console.log('Pad cleared');
    }
}