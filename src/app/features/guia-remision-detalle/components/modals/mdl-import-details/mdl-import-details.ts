import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, signal} from "@angular/core";
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors, ValidatorFn } from "@angular/forms";
import { GuiaRemisionDetalleApiService } from "@features/guia-remision-detalle/services/guia-remision-detalle-api-service";
import { GuiaRemisionDetalleDto } from "@features/guia-remision/models/guia-remision.model";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { PrimeNG } from "primeng/config";
import { MessageModule } from "primeng/message";
import { ToastModule } from "primeng/toast";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { HttpErrorResponse } from "@angular/common/http";
import { AlertService } from "@core/services/alert.service";


@Component({
    selector: 'app-mdl-import-details',
    templateUrl: './mdl-import-details.html',
    styleUrl: './mdl-import-details.scss',
    imports: [ 
        ButtonModule,  
        ToastModule, 
        CommonModule,
        ReactiveFormsModule,
        MessageModule
    ],
    providers: [MessageService]
})

export class MdlImportDetails  {

    api = inject(GuiaRemisionDetalleApiService);
    destroyRef = inject(DestroyRef);
    alertService = inject(AlertService);

    ctrlFile = new FormControl<File[]>([], { 
        validators: [this.fileExtensionValidator(['XLS', 'XLSX'])], 
        nonNullable: true 
    });


    isDragOver = false;

    files : File | undefined = undefined;

    totalSize : number = 0;

    totalSizePercent : number = 0;

    loading = signal(false);

    constructor(private config: PrimeNG, private messageService: MessageService) {}

    choose(event: Event, callback: () => void ) {
        console.log(callback);
        callback();
    }

    formatSize(bytes: number) {
        const k = 1024;
        const dm = 3;
        const sizes = this.config.translation.fileSizeTypes;
        if (bytes === 0) {
            return `0 ${sizes![0]}`;
        }

        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

        return `${formattedSize} ${sizes![i]}`;
    }

    // Events


    onDragOver(event: DragEvent) {
        console.log('onDragOver');
        event.preventDefault();
        this.isDragOver = true;
    }

    onDragLeave(event: DragEvent) {
        console.log('onDragLeave');
        event.preventDefault();
        this.isDragOver = false;
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        this.isDragOver = false;

        if (event.dataTransfer?.files.length) {
            const files = Array.from(event.dataTransfer.files);

            // Asignar los archivos al FormControl
            this.ctrlFile.setValue(files);
            this.ctrlFile.updateValueAndValidity();
            this.importData(files[0]);
        }
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            const files = Array.from(input.files);
            console.log('files', files);
            this.ctrlFile.setValue(files);
            this.ctrlFile.updateValueAndValidity();
            this.importData(input.files[0]);
        }
    }

    readExcel(file: File) {
        console.log('readExcel');
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            console.log(data);
            // Aquí procesas el Excel con SheetJS/XLSX si lo necesitas
        };
        reader.readAsArrayBuffer(file);
    }

    // Functions

    fileExtensionValidator(allowedExtensions: string[]): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;

            // Normalizar: si es FileList → convertir a File[]
            const files: File[] = Array.isArray(value)
            ? value
            : value instanceof FileList
                ? Array.from(value)
                : [];

            if (files.length === 0) return null;

            const invalid = files.some(file => {
            // Proteger contra file sin nombre
            if (!file || !file.name) return true;
            const ext = file.name.split('.').pop()?.toUpperCase();
            return !ext || !allowedExtensions.map(e => e.toUpperCase()).includes(ext);
            });

            return invalid ? { invalidExtension: true } : null;
        };
    }

    parseSize(size: string): number {
        const units: Record<string, number> = {
            B: 1,
            KB: 1024,
            MB: 1024 * 1024,
            GB: 1024 * 1024 * 1024,
            TB: 1024 * 1024 * 1024 * 1024,
        };

        const match = size.match(/^(\d+)(B|KB|MB|GB|TB)$/);
        if (!match) throw new Error('Formato inválido. Usa terminaciones en mayúscula (ej: 11MB, 12KB, 1GB).');

        const value = parseInt(match[1], 10);
        const unit = match[2];
        return value * units[unit];
    }

    fileSizeValidator(maxSize: string): ValidatorFn {
        const maxBytes = this.parseSize(maxSize);

        return (control: AbstractControl) => {
            const files: File[] = control.value || [];
            if (files.length === 0) return null;

            const invalid = files.some(file => file.size > maxBytes);
            return invalid ? { fileTooLarge: true } : null;
        };
    }

    // Data

    importData(file: File): void{
        this.loading.set(true);
        this.api.importData(file)
            .pipe(
                finalize(()=>{ this.loading.set(false) }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: (value: GuiaRemisionDetalleDto[]) => {
                    console.log(value);
                },
                error: (e: HttpErrorResponse) => {
                    this.alertService.showToast({
                        title: e.error.detalle,
                        icon: 'error',
                        timer: 4000,
                        timerProgressBar: true,
                        showCloseButton: true,
                        target: 'body'
                    });
                }
            });
    }

}