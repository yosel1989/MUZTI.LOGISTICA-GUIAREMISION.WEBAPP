import { AfterViewInit, Component, input, OnDestroy, OnInit, output } from "@angular/core";
import { EntityBranchDto } from "@features/entity-branch/models/entity-branch";
import { ButtonModule } from "primeng/button";
import { TblEntityBranchSeriePrincipal } from "../../tables/tbl-entity-branch-serie-principal/tbl-entity-branch-serie-principal";
@Component({
    selector: 'app-mdl-entity-branch-serie-list',
    templateUrl: './mdl-entity-branch-serie-list.html', 
    styleUrl: './mdl-entity-branch-serie-list.scss',
    imports: [
        ButtonModule,
        TblEntityBranchSeriePrincipal
    ]
})

export class MdlEntityBranchSerieList implements OnInit, AfterViewInit, OnDestroy{

    entityBranch = input.required<EntityBranchDto>();
    OnClose = output<boolean>();

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

}