import { Component, computed, DestroyRef, inject, input, OnInit, output, signal } from "@angular/core";
import { AlertService } from "@core/services/alert.service";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { IconFieldModule } from "primeng/iconfield";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { SkeletonModule } from "primeng/skeleton";
import { finalize } from "rxjs";
import { SelectModule } from "primeng/select";
import { HttpErrorResponse } from "@angular/common/http";
import { AvatarModule } from "primeng/avatar";
import { EntityRoleDto, EntityRolesSyncDto, EntityRolesToSelectDto } from "@features/entity-role/models/entity-role";
import { EntityRoleApiService } from "@features/entity-role/services/entity-role-service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { TooltipModule } from "primeng/tooltip";
import { ChipModule } from 'primeng/chip';
import { MultiSelectModule } from "primeng/multiselect";
import { ConfirmationService } from "primeng/api";
import { EntityDto } from "@features/entity/models/entity";
import { ConfirmDialogModule } from "primeng/confirmdialog";

@Component({
    selector: 'app-mdl-entity-role-sync',
    templateUrl: './mdl-entity-role-sync.html',
    styleUrl: './mdl-entity-role-sync.scss',
    imports: [
        InputIconModule,
        InputTextModule,
        TableModule,
        ButtonModule,
        IconFieldModule,
        ReactiveFormsModule,
        SkeletonModule,
        SelectModule,
        AvatarModule,
        InputGroupModule,
        InputGroupAddonModule,
        TooltipModule,
        ChipModule,
        SkeletonModule,
        MultiSelectModule,
        ConfirmDialogModule
    ],
    providers: [ConfirmationService]
})

export class MdlEntityRoleSyncList implements OnInit{

    confirmationService = inject(ConfirmationService);
    alertService = inject(AlertService);
    destroyRef = inject(DestroyRef);
    api = inject(EntityRoleApiService);
    id = input.required<number>();
    entity = input.required<EntityDto>();

    OnSaved = output<boolean>();

    data = signal<EntityRoleDto[]>([]);
    ldData = signal<boolean>(false);

    roles = signal<EntityRolesToSelectDto[]>([]);
    ldRoles = signal<boolean>(false);

    rolesComputed = computed(()=> {
        const roles = this.roles();
        const data = this.data();
        return roles.map((x: EntityRolesToSelectDto) => ({
            ...x,
            disabled: data.find(y => y.role === x.role)
        }));
    });

    ldSubmit = signal<boolean>(false);

    ctrlRol = new FormControl<string[]>([], Validators.required);


    // Getters

    get request(): EntityRolesSyncDto {
        return {
            id: this.id(),
            roles: this.data().map(x => x.role)
        }
    }


    ngOnInit(): void {
        this.loadRolesToSelect();
        this.loadRolesByEntity(this.id());
    }


    // data 

    loadRolesToSelect(): void{
        this.ldRoles.set(true);
        this.api.getRolesToSelect()
        .pipe(
            finalize(()=>{this.ldRoles.set(false)}),
            takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
            next: (value: EntityRolesToSelectDto[]) => {this.roles.set(value) },
            error: (err: HttpErrorResponse) => {
                this.alertService.showToast({
                    title: err.error.detalle,
                    icon: 'error'
                })
            },
        });
    }

    loadRolesByEntity(entity: number): void{
        this.ldData.set(true);
        this.api.getRolesByEntity(entity)
        .pipe(
            finalize(()=>{this.ldData.set(false)}),
            takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
            next: (value: EntityRoleDto[]) => {this.data.set(value) },
            error: (err: HttpErrorResponse) => {
                this.alertService.showToast({
                    title: err.error.detalle,
                    icon: 'error'
                })
            },
        });
    }


    // events 
    
    evtAddRole(): void{
        if(this.ctrlRol.invalid){
            this.alertService.showToast({
                title: 'Debe seleccionar minímo un rol a asignar.',
                icon: 'warning'
            });
            return;
        }
        const roles = this.roles().filter(x => this.ctrlRol?.value?.includes(x.role) );
        if(roles.length){

            roles.forEach((element: EntityRolesToSelectDto) => {
                const exist = this.data().some(x => x.role === element.role);
                if(!exist){
                    this.data.update((val) => [
                        ...val,
                        {
                            role : element.role
                        } as EntityRoleDto
                    ]);
                }
            });
            this.ctrlRol.setValue([]);

        }else{
            this.alertService.showToast({
                title: 'Debe seleccionar minimo un rol a asignar.',
                icon: 'warning'
            });
            return;
        }
    }

    evtOnSubmit(): void{

        this.confirmationService.confirm({
            header: `¿Asignar roles?`,
            message: 'Confirmar la operación.',
            accept: () => {
                
                this.ldSubmit.set(true);
                this.api.putRolesSync(this.request)
                .pipe(
                    finalize(()=>{ this.ldSubmit.set(false) }),
                    takeUntilDestroyed(this.destroyRef)
                )
                .subscribe({
                    next: (value: boolean) => {
                        this.alertService.showToast({
                            title: 'Se asignaron los roles con éxito.',
                            icon: 'success'
                        });
                        this.OnSaved.emit(value);
                    },
                    error: (err: HttpErrorResponse) => {
                        this.alertService.showToast({
                            title: err.error.detalle,
                            icon: 'error'
                        });
                    },
                });

            }
        });

    }

    evtOnRemoveRole(evt: EntityRoleDto): void{
        this.data.update((role: EntityRoleDto[]) => {
            return role.filter(x => x.role !== evt.role);
        })
    }

}