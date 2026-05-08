import { AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges, inject} from '@angular/core';
import { AlertService } from '@core/services/alert.service';
import { EstablecimientoRemitenteGuiaDTO } from '@features/establecimiento/models/establecimiento.model';
import { EstablecimientoApiService } from '@features/establecimiento/services/establecimiento.service';
import { RemitenteApiService } from 'app/features/remitente/services/remitente-api.service';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { BehaviorSubject, finalize } from 'rxjs';

@Component({
  selector: 'app-guia-section-cabecera',
  templateUrl: './guia-section-cabecera.html',
  styleUrls: ['./guia-section-cabecera.scss'],                          
  imports: [
    ButtonModule,
    SkeletonModule,
    AsyncPipe
  ]
})


export class GuiaSectionCabeceraComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges{

  private establecimientoApiService = inject(EstablecimientoApiService);
  private alertService = inject(AlertService);

  @Input() tipoGuiaRemision!: 'TRANSPORTISTA' | 'REMITENTE' | string | undefined;
  @Input() idEstablecimiento: number | null = null;

  rucEmpresa: string  = '00000000000';
  serieNumero: string = '0000-00000000';

  establecimientoRemitente: EstablecimientoRemitenteGuiaDTO | undefined;
  loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  $loading = this.loading.asObservable();

  constructor(
    private remitenteService: RemitenteApiService
  ){
    
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    
  }

  ngOnChanges( changes: SimpleChanges ): void {
    if(this.idEstablecimiento && this.tipoGuiaRemision){
      this.loading.next(true);
      this.establecimientoApiService.getByIdToGuia(this.idEstablecimiento, this.tipoGuiaRemision)
      .pipe(finalize(() => this.loading.next(false)))
      .subscribe({
        next: (res: EstablecimientoRemitenteGuiaDTO) => {
          this.rucEmpresa = res.ruc;
          this.serieNumero = res.nuevo_numero_guia ?? '';
          this.establecimientoRemitente = res;
        },
        error: (e: HttpErrorResponse) => {
          console.log(e);
          this.alertService.showToast({
              icon: "error",
              title: e.error.detalle
          });
        } 
      });
    }
  }

  ngOnDestroy(): void {
    
  }

}