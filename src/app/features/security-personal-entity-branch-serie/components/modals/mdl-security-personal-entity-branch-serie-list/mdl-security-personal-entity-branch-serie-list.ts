import { AfterViewInit, Component, EventEmitter, input, OnDestroy, OnInit, Output, output } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { SecurityPersonalDto } from "@features/security-personal/models/security-personal";
import { TblSecurityPersonalEntityBranchSeriePrincipal } from "../../tables/tbl-security-personal-entity-branch-serie-principal/tbl-security-personal-entity-branch-serie-principal";
@Component({
    selector: 'app-mdl-security-personal-entity-branch-serie-list',
    templateUrl: './mdl-security-personal-entity-branch-serie-list.html', 
    styleUrl: './mdl-security-personal-entity-branch-serie-list.scss',
    imports: [ 
        ButtonModule,
        TblSecurityPersonalEntityBranchSeriePrincipal
    ]
})

export class MdlSecurityPersonalEntityBranchSerieList implements OnInit, AfterViewInit, OnDestroy{

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