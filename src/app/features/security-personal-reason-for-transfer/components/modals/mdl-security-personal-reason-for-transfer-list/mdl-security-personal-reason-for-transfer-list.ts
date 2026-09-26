import { AfterViewInit, Component, EventEmitter, input, OnDestroy, OnInit, Output, output } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { SecurityPersonalDto } from "@features/security-personal/models/security-personal";
import { TblSecurityPersonalReasonForTransferPrincipal } from "../../tables/tbl-security-personal-reason-for-transfer-principal/tbl-security-personal-reason-for-transfer-principal";
@Component({
    selector: 'app-mdl-security-personal-reason-for-transfer-list',
    templateUrl: './mdl-security-personal-reason-for-transfer-list.html', 
    styleUrl: './mdl-security-personal-reason-for-transfer-list.scss',
    imports: [ 
        ButtonModule,
        TblSecurityPersonalReasonForTransferPrincipal
    ]
})

export class MdlSecurityPersonalReasonForTransferList implements OnInit, AfterViewInit, OnDestroy{

    securityPersonal = input.required<SecurityPersonalDto>();
    OnClose = output<boolean>();
    @Output() OnUpdateSeries = new EventEmitter<boolean>();

    ngOnInit(): void {
        
    }
    ngAfterViewInit(): void {
        
    }
    ngOnDestroy(): void {
        
    }

    // Events

    evtOnClose(): void{
        this.OnClose.emit(true);
    }

    evtUpdateData(): void{
        this.OnUpdateSeries.emit(true);
    }

}