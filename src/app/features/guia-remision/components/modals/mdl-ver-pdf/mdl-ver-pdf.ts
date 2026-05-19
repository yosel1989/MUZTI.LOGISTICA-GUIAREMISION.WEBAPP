import { HttpErrorResponse } from '@angular/common/http';
  import { inject } from '@angular/core';
import { Component, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef, Input, signal,  } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlertService } from '@core/services/alert.service';
import { GuiaRemisionDto } from '@features/guia-remision/models/guia-remision.model';
import { DocumentoApiService } from '@features/guia-remision/services/documento-api.service';
import { LoaderComponent } from 'app/core/components/loaders/loader/loder.component';
import { SafeUrlPipe } from 'app/core/pipes/safe-url-pipe/safe-url-pipe';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-mdl-ver-pdf',
  templateUrl: './mdl-ver-pdf.html',
  styleUrls: ['./mdl-ver-pdf.scss'],                          
  imports: [
    LoaderComponent,
    SafeUrlPipe
  ],
})


export class MdlVerPdfComponent implements OnInit, AfterViewInit, OnDestroy{

  private alertService = inject(AlertService);
  private ref = inject(DynamicDialogRef);

  @Input() ticket!: string;
  @Input() data!: GuiaRemisionDto;

  urlBlob: string | undefined;
  pdfUrl: SafeResourceUrl | undefined = undefined;
  loading = signal(false);

  constructor(
    private api: DocumentoApiService,
    private sanitizer: DomSanitizer
  ) {

  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.loadPdf();
  }

  ngOnDestroy(): void {
  }

  loadPdf(): void{
    this.loading.set(true);
    this.api.obtenerPdf(this.data.numero_documento_remitente, this.data.tipo_guia, this.data.numero_guia)
    .pipe(finalize(()=> {
      this.loading.set(false);
    }))
    .subscribe({
      next: (resp: { blob: Blob; filename?: string }) => {
        const blobUrl = URL.createObjectURL(resp.blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
        this.urlBlob = blobUrl;
      },
      error: (error: HttpErrorResponse) => {
        if (error.error instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const jsonErr = JSON.parse(reader.result as string);

              this.alertService.showToast({
                title: jsonErr.detalle || 'Error desconocido',
                icon: 'error',
                timer: 4000,
                timerProgressBar: true,
                showCloseButton: true
              });
            } catch {
              console.error("No se pudo parsear el blob como JSON");
            }
            this.ref.close();
          };
          reader.readAsText(error.error);
        }
        this.ref.close();
      }
  });

  }

}