import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, DestroyRef, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlertService } from '@core/services/alert.service';
import { GuiaRemisionDto } from '@features/guia-remision/models/guia-remision.model';
import { DocumentoApiService } from '@features/guia-remision/services/documento-api.service';
import { GuiaRemisionApiService } from '@features/guia-remision/services/guia-remision-api.service';
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

  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  private ref = inject(DynamicDialogRef);
  private apiGuiaRemision = inject(GuiaRemisionApiService);

  ticket = input.required<string>();
  data = input.required<GuiaRemisionDto>();

  urlBlob: string | undefined;
  pdfUrl: SafeResourceUrl | undefined = undefined;
  loading = signal(false);

  constructor(
    private api: DocumentoApiService,
    private sanitizer: DomSanitizer
  ) {

  }

  ngOnInit(): void {
    console.log(this.data());
  }

  ngAfterViewInit(): void {
    this.loadPdf();
  }

  ngOnDestroy(): void {
  }

  loadPdf(): void{
    this.loading.set(true);
    this.api.obtenerPdf(this.data().numero_documento_remitente, this.data().tipo_guia, this.data().numero_guia)
      .pipe(
        finalize(()=> this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
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

    console.log(this.data());

    this.apiGuiaRemision.getDocument(this.data().id.toString(), this.data().entity_id.toString()) 
    .subscribe({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      next: (resp: any) => {
        if(resp && resp.blob){
          /*const blobUrl = URL.createObjectURL(resp.blob);
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
          this.urlBlob = blobUrl;*/
        }
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
      }
    }); 

  }

}