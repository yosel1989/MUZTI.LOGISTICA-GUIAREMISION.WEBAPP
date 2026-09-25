import { AfterViewInit, computed, DestroyRef, Directive, inject, signal, Type, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableRowSelectEvent } from 'primeng/table';
import { Observable, Subscription } from 'rxjs';
import { TableData } from '@core/models/table';
import { AlertService } from '@core/services/alert.service';
import { ErrorHandlerService } from '@core/handlers/error-handler.service';
import { MdlHeader } from '@core/components/modals/headers/mdl-header/mdl-header';

/** Fila de relleno para que la tabla siempre muestre `pageSize` filas. */
export interface EmptyRow {
  __empty: true;
}

/** Opciones para abrir un modal con la configuración estándar de las tablas. */
export interface TableDialogOptions {
  /** Texto del encabezado, por ejemplo "Editar conductor". */
  title: string;
  /** Ícono de PrimeIcons sin el prefijo `pi`, por ejemplo `pi-pencil`. */
  icon: string;
  /** Ancho del modal (por defecto `600px`). */
  width?: string;
  /** Inputs que recibe el componente del modal. */
  inputValues?: Record<string, unknown>;
}

/**
 * Base para las tablas principales paginadas del sistema (`tbl-*-principal`).
 *
 * Resuelve lo que todas comparten: paginación, búsqueda, selección, menú contextual,
 * confirmaciones y modales. Todo el estado está en signals, por lo que la vista se
 * actualiza sola en modo zoneless (sin `detectChanges`).
 *
 * El componente que hereda debe:
 * - Implementar `fetchPage()` con la llamada al servicio.
 * - Opcionalmente sobrescribir `mapRow()` para transformar cada fila (fechas, flags).
 * - Declarar `providers: [DialogService, ConfirmationService]` y en el template
 *   un `<p-contextmenu #cm>` si usa menú contextual.
 *
 * @example
 * export class TablaConductores extends BaseTableComponent<ConductorDto> {
 *   private api = inject(ConductorApiService);
 *   protected fetchPage(page: number, size: number, search: string | null) {
 *     return this.api.obtenerTodo(page, size, search);
 *   }
 * }
 */
@Directive()
export abstract class BaseTableComponent<T extends { id: number }> implements AfterViewInit {

  protected readonly destroyRef = inject(DestroyRef);
  protected readonly alertService = inject(AlertService);
  protected readonly errorHandler = inject(ErrorHandlerService);
  protected readonly dialogService = inject(DialogService);
  protected readonly confirmationService = inject(ConfirmationService);

  readonly cm = viewChild<ContextMenu>('cm');

  // Estado
  readonly data = signal<T[]>([]);
  readonly ldData = signal(true);
  readonly selected = signal<T | undefined>(undefined);

  // Paginación
  readonly pageNumber = signal(1);
  readonly pageSize = signal(10);
  readonly totalRecords = signal(0);
  readonly first = computed(() => (this.pageNumber() - 1) * this.pageSize());
  readonly isFirstPage = computed(() => this.first() === 0);
  readonly isLastPage = computed(() => this.first() + this.pageSize() >= this.totalRecords());

  /** Filas de la página más filas vacías hasta completar `pageSize`. */
  readonly paddedData = computed<(T | EmptyRow)[]>(() => {
    const rows = this.data();
    const filler = Math.max(this.pageSize() - rows.length, 0);
    return [...rows, ...Array.from({ length: filler }, (): EmptyRow => ({ __empty: true }))];
  });

  readonly ctrlSearch = new FormControl<string | null>(null);

  protected ref: DynamicDialogRef | null = null;
  private pageRequest?: Subscription;

  /** Pide una página al servicio. */
  protected abstract fetchPage(page: number, size: number, search: string | null): Observable<TableData<T[]>>;

  /** Transforma cada fila recibida (por ejemplo, convertir fechas). Por defecto no cambia nada. */
  protected mapRow(row: T): T {
    return row;
  }

  ngAfterViewInit(): void {
    this.ctrlSearch.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadData(true));

    this.destroyRef.onDestroy(() => this.ref?.close());
    this.loadData();
  }

  // Datos

  /**
   * Carga la página actual. Cancela la petición anterior si aún no terminó,
   * para que una respuesta lenta no sobrescriba a una más reciente.
   *
   * @param reload Si es `true`, vuelve a la primera página.
   */
  loadData(reload: boolean = false): void {
    if (reload) this.pageNumber.set(1);

    this.pageRequest?.unsubscribe();
    this.selected.set(undefined);
    this.ldData.set(true);

    this.pageRequest = this.fetchPage(this.pageNumber(), this.pageSize(), this.ctrlSearch.value || null)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: TableData<T[]>) => {
          this.data.set(res.data.map(row => this.mapRow(row)));
          this.pageNumber.set(res.page_number);
          this.pageSize.set(res.page_size);
          this.totalRecords.set(res.total_records);
          this.ldData.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.data.set([]);
          this.ldData.set(false);
          this.errorHandler.handle(err);
        }
      });
  }

  /** Recarga desde la primera página (lo usan las páginas padre). */
  reload(): void {
    this.loadData(true);
  }

  // Paginación

  evtNext(): void {
    this.pageNumber.update(page => page + 1);
    this.loadData();
  }

  evtPrev(): void {
    this.pageNumber.update(page => Math.max(page - 1, 1));
    this.loadData();
  }

  /** Cambio de página desde el paginador inferior de la tabla. */
  evtFirstChange(first: number): void {
    const page = Math.floor(first / this.pageSize()) + 1;
    if (page === this.pageNumber()) return;
    this.pageNumber.set(page);
    this.loadData();
  }

  /** Cambio de "filas por página" desde el paginador inferior. */
  evtRowsChange(rows: number): void {
    if (rows === this.pageSize()) return;
    this.pageSize.set(rows);
    this.loadData(true);
  }

  // Selección

  evtToggleSelection(row: T): void {
    this.selected.set(this.selected() === row ? undefined : row);
  }

  evtOnRowSelect(event: TableRowSelectEvent): void {
    this.selected.set(event.data);
  }

  /**
   * Devuelve la fila seleccionada o muestra un aviso si no hay ninguna.
   *
   * @param message Mensaje a mostrar, por ejemplo "Debe seleccionar un conductor".
   */
  protected requireSelected(message: string): T | undefined {
    const row = this.selected();
    if (!row) this.alertService.error(message);
    return row;
  }

  /**
   * Actualiza una fila en `data` y, si es la seleccionada, también `selected`,
   * manteniendo la misma referencia en ambos (la tabla resalta la fila por referencia).
   */
  protected updateRow(id: number, patch: Partial<T>): void {
    this.data.update(rows => rows.map(row => row.id === id ? { ...row, ...patch } : row));
    if (this.selected()?.id === id) {
      this.selected.set(this.data().find(row => row.id === id));
    }
  }

  // Menú contextual

  evtShowContextMenu(event: MouseEvent, row: T): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const cm = this.cm();
    const previous = this.selected();

    const menuEvent = (type: string) => new MouseEvent(type, {
      bubbles: event.bubbles,
      cancelable: event.cancelable,
      view: event.view,
      clientX: rect.left + target.offsetWidth,
      clientY: rect.bottom
    });

    this.selected.set(row);

    if (!cm?.visible()) {
      cm?.show(menuEvent(event.type));
    } else if (previous !== row) {
      // Si el menú ya estaba abierto en otra fila, se cierra y se abre en la nueva.
      cm.hide();
      setTimeout(() => cm.show(menuEvent('contextmenu')));
    }
  }

  isOpenCm(row: T): boolean {
    return (this.cm()?.visible() && row === this.selected()) ?? false;
  }

  // Confirmaciones y modales

  /** Muestra el diálogo de confirmación estándar. */
  protected confirm(header: string, accept: () => void): void {
    this.confirmationService.confirm({
      header,
      message: 'Confirmar la operación.',
      accept
    });
  }

  /** Abre un modal con la configuración estándar de las tablas. */
  protected openDialog<C>(component: Type<C>, options: TableDialogOptions): DynamicDialogRef<C> | null {
    const ref = this.dialogService.open(component, {
      width: options.width ?? '600px',
      closable: false,
      modal: true,
      draggable: false,
      position: 'top',
      header: `<span class="inline-flex items-center justify-center w-9! h-9! rounded-lg! bg-slate-200! me-2!"><span class="pi ${options.icon} text-[14px]!"></span></span> ${options.title}`,
      styleClass: 'max-h-none! slide-down-dialog',
      maskStyleClass: 'overflow-y-auto py-4',
      appendTo: 'body',
      inputValues: options.inputValues,
      templates: {
        header: MdlHeader,
      }
    });
    this.ref = ref;
    return ref;
  }

  /** Ejecuta `handler` con la instancia del componente del modal cuando termina de cargar. */
  protected onDialogLoaded<C>(ref: DynamicDialogRef<C> | null, handler: (cmp: C) => void): void {
    ref?.onChildComponentLoaded
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(handler);
  }
}
