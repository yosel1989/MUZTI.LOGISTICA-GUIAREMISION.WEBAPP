import { AfterViewInit, Component, EventEmitter, input, OnDestroy, OnInit, Output, output } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { TblSecurityPersonalEntityBranchPrincipal } from "../../tables/tbl-security-personal-entity-branch-principal/tbl-security-personal-entity-branch-principal";
import { SecurityPersonalDto } from "@features/security-personal/models/security-personal";
@Component({
    selector: 'app-mdl-security-personal-entity-branch-list',
    templateUrl: './mdl-security-personal-entity-branch-list.html', 
    styleUrl: './mdl-security-personal-entity-branch-list.scss',
    imports: [ 
        ButtonModule,
        TblSecurityPersonalEntityBranchPrincipal
    ]
})

export class MdlSecurityPersonalEntityBranchList implements OnInit, AfterViewInit, OnDestroy{

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