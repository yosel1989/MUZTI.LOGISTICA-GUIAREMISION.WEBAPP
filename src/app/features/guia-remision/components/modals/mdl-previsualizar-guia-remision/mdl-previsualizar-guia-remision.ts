import { Component, OnDestroy, OnInit, AfterViewInit, Input, signal, inject } from '@angular/core';
import { GuiaRemisionDto, } from '@features/guia-remision/models/guia-remision.model';
import "pdfmake/build/vfs_fonts";
import { GuiaRemisionApiService } from '@features/guia-remision/services/guia-remision-api.service';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '@core/services/alert.service';
import { finalize, Subscription } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-mdl-previsualizar-guia-remision',
  templateUrl: './mdl-previsualizar-guia-remision.html',
  styleUrls: ['./mdl-previsualizar-guia-remision.scss'],                          
  imports: [
    CardModule,
    TableModule,
    SkeletonModule,
    DecimalPipe,
    UpperCasePipe,
    DatePipe
  ],
})

export class MdlPrevisualizarGuiaRemisionComponent implements OnInit, AfterViewInit, OnDestroy{

  private api = inject(GuiaRemisionApiService);
  private alertService = inject(AlertService);
  @Input() data!: GuiaRemisionDto;

  loading = signal(false);
  subs = new Subscription();

  localData = signal<GuiaRemisionDto | undefined | null>(undefined);

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadData(): void{
    this.loading.set(true);
    const s = this.api.buscarPorUuid(this.data.uuid)
    .pipe(finalize(()=>{
      this.loading.set(false);
    }))
    .subscribe({
      next: (value: GuiaRemisionDto) => {
        this.localData.set(value);
      },
      error: (err: HttpErrorResponse) => {
        this.alertService.showToast({
          title: err.error.detalle,
          icon: 'error',
          timer: 4000,
          timerProgressBar: true,
          showCloseButton: true
        });
      }
    });
    this.subs.add(s);
  }

}