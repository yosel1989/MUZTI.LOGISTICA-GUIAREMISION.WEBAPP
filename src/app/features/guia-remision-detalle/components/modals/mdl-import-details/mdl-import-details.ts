import { CommonModule } from "@angular/common";
import { Component} from "@angular/core";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { PrimeNG } from "primeng/config";
import { ProgressBar } from "primeng/progressbar";
import { ToastModule } from "primeng/toast";


@Component({
    selector: 'app-mdl-import-details',
    templateUrl: './mdl-import-details.html',
    styleUrl: './mdl-import-details.scss',
    imports: [ 
        ButtonModule,  
        ProgressBar, 
        ToastModule, 
        CommonModule
    ],
    providers: [MessageService]
})

export class MdlImportDetails  {

    isDragOver = false;

    files : File | undefined = undefined;

    totalSize : number = 0;

    totalSizePercent : number = 0;

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
        event.preventDefault(); // necesario para permitir drop
        this.isDragOver = true;
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        this.isDragOver = false;
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        this.isDragOver = false;
        if (event.dataTransfer?.files.length) {
            const file = event.dataTransfer.files[0];
            this.readExcel(file);
        }
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files?.length) {
            const file = input.files[0];
            this.readExcel(file);
        }
    }

    readExcel(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        // Aquí procesas el Excel con SheetJS/XLSX si lo necesitas
    };
    reader.readAsArrayBuffer(file);
    }



}