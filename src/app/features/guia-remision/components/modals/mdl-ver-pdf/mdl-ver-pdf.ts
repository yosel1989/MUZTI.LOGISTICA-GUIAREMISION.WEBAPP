import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GuiaRemisionDto } from '@features/guia-remision/models/guia-remision.model';
import { DocumentoApiService } from '@features/guia-remision/services/documento-api.service';
import { LoaderComponent } from 'app/core/components/loaders/loader/loder.component';
import { SafeUrlPipe } from 'app/core/pipes/safe-url-pipe/safe-url-pipe';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-mdl-ver-pdf',
  templateUrl: './mdl-ver-pdf.html',
  styleUrls: ['./mdl-ver-pdf.scss'],                          
  imports: [
    AsyncPipe,
    LoaderComponent,
    SafeUrlPipe
  ],
})


export class MdlVerPdfComponent implements OnInit, AfterViewInit, OnDestroy{

  @Input() ticket!: string;
  @Input() data!: GuiaRemisionDto;

  urlBlob: string | undefined;
  pdfUrl: SafeResourceUrl | undefined = undefined;
  loading = new BehaviorSubject<boolean>(false);
  loading$ = this.loading.asObservable();

  constructor(
    private cdr: ChangeDetectorRef,
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
    this.loading.next(true);
    this.api.obtenerPdfByTicket(this.ticket).subscribe(
      (resp: { blob: Blob; filename?: string }) => {
        const blobUrl = URL.createObjectURL(resp.blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
        this.urlBlob = blobUrl;
        this.loading.next(false);
      },
      (error) => {
        console.error('Error al obtener PDF', error);
        this.loading.next(false);
      }
    );

  }

}