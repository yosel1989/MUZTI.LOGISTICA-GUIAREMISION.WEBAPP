import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService } from 'primeng/dynamicdialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BaseTableComponent } from '@core/components/tables/base-table';
import { LoaderComponent } from 'app/core/components/loaders/loader/loder.component';
import { Column } from 'app/shared/models/table';
import { ConductorApiService } from '@features/conductor/services/conductor-api.service';
import { ConductorDto } from '@features/conductor/models/conductor.model';
import { MdlRegistrarConductorComponent } from '../../modals/mdl-registrar-conductor/mdl-registrar-conductor';
import { MdlEditarConductorComponent } from '../../modals/mdl-editar-conductor/mdl-editar-conductor';

@Component({
  selector: 'app-tbl-conductor-principal',
  templateUrl: './tbl-conductor-principal.html',
  styleUrl: './tbl-conductor-principal.scss',
  imports: [
      TableModule,
      SkeletonModule,
      TagModule,
      ToolbarModule,
      ButtonModule,
      DividerModule,
      IconFieldModule,
      InputIconModule,
      TooltipModule,
      InputTextModule,
      DatePipe,
      ContextMenuModule,
      ConfirmDialogModule,
      LoaderComponent,
      ReactiveFormsModule,
      NgClass
  ],
  providers: [DialogService, ConfirmationService]
})

export class TableConductorPrincipalComponent extends BaseTableComponent<ConductorDto> {

    private api = inject(ConductorApiService);

    items = computed(() => this.buildMenuItems(this.selected()));

    cols: Column[] = [
      { field: 'select', header: '', sort: false, sticky: false  },
      { field: 'cod', header: '#', sort: false, sticky: false  },
      { field: 'id', header: 'Código', sort: false, sticky: false },
      { field: 'tipo_documento', header: 'T. Documento', sort: false, sticky: false },
      { field: 'numero_documento', header: 'N° Documento', sort: false, sticky: false },
      { field: 'nombres', header: 'Nombres', sort: false, sticky: false },
      { field: 'apellidos', header: 'Apellidos', sort: false, sticky: false },
      { field: 'cargo', header: 'Cargo', sort: false, sticky: false },
      { field: 'licencia', header: 'Distrito', sort: false, sticky: false },
      { field: 'tipo', header: 'Tipo', sort: false, sticky: false },
      { field: 'active', header: 'Estado', sort: false, sticky: false },
      { field: 'fecha_registro', header: 'F. Registro', sort: false, sticky: false },
      { field: 'usuario_registro', header: 'U. Registro', sort: false, sticky: false },
      { field: 'fecha_modifico', header: 'F. Modifico', sort: false, sticky: false },
      { field: 'usuario_modifico', header: 'U. Modifico', sort: false, sticky: false },
      { field: 'options', header: '<i class="fa-light fa-columns-3"></i>', sort: false, sticky: true, alignFrozen: 'right', thClassName: 'text-center!' },
    ];

    // Data

    protected fetchPage(page: number, size: number, search: string | null) {
      return this.api.obtenerTodo(page, size, search);
    }

    protected override mapRow(row: ConductorDto): ConductorDto {
      return {
        ...row,
        fecha_registro: new Date(row.fecha_registro),
        fecha_modifico: row.fecha_modifico ? new Date(row.fecha_modifico) : null,
        ld_estado: false,
        ld_update: false
      };
    }

    // Events

    evtOnCreate(): void{
      const ref = this.openDialog(MdlRegistrarConductorComponent, { title: 'Nuevo conductor', icon: 'pi-plus' });

      this.onDialogLoaded(ref, cmp => {
        cmp.OnCreated.subscribe(() => {
          ref?.close();
          this.loadData();
        });
        cmp.OnCanceled.subscribe(() => ref?.close());
      });
    }

    evtOnEdit(): void{
      const row = this.requireSelected('Debe seleccionar un conductor');
      if(!row) return;

      const ref = this.openDialog(MdlEditarConductorComponent, {
        title: 'Editar conductor',
        icon: 'pi-pencil',
        inputValues: { id: row.id }
      });

      this.onDialogLoaded(ref, cmp => {
        // Mientras se guarda, la fila muestra el skeleton.
        cmp.OnSubmited.subscribe((saving: boolean) => this.updateRow(row.id, { ld_update: saving }));

        cmp.OnCreated.subscribe((updated: ConductorDto) => {
          ref?.close();
          this.updateRow(row.id, { ...updated, ld_update: true });
          // Breve efecto de "actualizado" antes de mostrar los datos nuevos.
          setTimeout(() => this.updateRow(row.id, this.mapRow(updated)), 1000);
        });

        cmp.OnCanceled.subscribe(() => ref?.close());
      });
    }

    evtOnDelete(): void{
      const row = this.requireSelected('Debe seleccionar un conductor');
      if(!row) return;

      this.confirm('¿Eliminar conductor?', () => {
        this.api.eliminar(row.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: res => {
              this.alertService.success(res.detalle);
              this.loadData();
            },
            error: (err: HttpErrorResponse) => this.errorHandler.handle(err)
          });
      });
    }

    evtOnToggleActive(status: boolean): void{
      const row = this.requireSelected('Debe seleccionar un conductor');
      if(!row) return;

      this.confirm(status ? '¿Activar conductor?' : '¿Desactivar conductor?', () => {
        this.updateRow(row.id, { ld_estado: true });

        this.api.actualizarEstado(row.id, { id: row.id, active: status })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: res => {
              this.alertService.success(res.detalle);
              this.updateRow(row.id, {
                ld_estado: false,
                ld_update: false,
                active: res.data.active,
                fecha_modifico: res.data.updated_at,
                usuario_modifico: res.data.updated_at_user,
                usuario_modifico_nombre: res.data.updated_at_user_name
              });
            },
            error: (err: HttpErrorResponse) => {
              this.errorHandler.handle(err);
              this.updateRow(row.id, { ld_estado: false });
            }
          });
      });
    }

    // Functions

    private buildMenuItems(selected: ConductorDto | undefined): MenuItem[] {
      return [
        { label: 'Editar', icon: 'pi pi-pencil', command: () => { this.evtOnEdit(); }, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500'},
        { label: 'Eliminar', icon: 'pi pi-trash ', command: () => { this.evtOnDelete(); }, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500'},
        { label: 'Activar', icon: 'pi pi-check-circle ', command: () => { this.evtOnToggleActive(true); }, visible: selected?.active === false, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500'},
        { label: 'Desactivar', icon: 'pi pi-ban ', command: () => { this.evtOnToggleActive(false); }, visible: selected?.active === true, linkClass: 'h-8!', iconClass: 'text-sm!', labelClass: 'text-sm! font-medium! text-slate-500' },
      ];
    }
}
