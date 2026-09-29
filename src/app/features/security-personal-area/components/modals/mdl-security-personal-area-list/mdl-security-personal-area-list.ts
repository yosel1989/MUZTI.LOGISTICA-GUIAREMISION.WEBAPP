import { AfterViewInit, Component, EventEmitter, input, OnDestroy, OnInit, Output, output } from "@angular/core";
import { SecurityPersonalDto } from "@features/security-personal/models/security-personal";
import { ButtonModule } from "primeng/button";
import { TblSecurityPersonalAreaPrincipal } from "../../tables/tbl-security-personal-area-principal/tbl-security-personal-area-principal";
@Component({
    selector: 'app-mdl-security-personal-area-list',
    templateUrl: './mdl-security-personal-area-list.html', 
    styleUrl: './mdl-security-personal-area-list.scss',
    imports: [ 
        ButtonModule,
        TblSecurityPersonalAreaPrincipal
    ]
})

export class MdlSecurityPersonalAreaList implements OnInit, AfterViewInit, OnDestroy{

    securityPersonal = input.required<SecurityPersonalDto>();
    OnClose = output<boolean>();
    @Output() OnUpdateData = new EventEmitter<boolean>();

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

    evtOnUpdateData(): void{
        this.OnUpdateData.emit(true);
    }

}