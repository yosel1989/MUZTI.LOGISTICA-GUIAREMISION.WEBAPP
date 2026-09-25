import { AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, inject } from '@angular/core';
import { ErrorHandlerService } from '@core/handlers/error-handler.service';
import { EstablecimientoRemitenteGuiaDTO } from '@features/entity-branch/models/entity-branch';
import { EntityBranchApiService } from '@features/entity-branch/services/entity-branch-api-service';
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

  private entityBranchApiService = inject(EntityBranchApiService);
  private errorHandler = inject(ErrorHandlerService);

  @Input() tipoGuiaRemision!: 'TRANSPORTISTA' | 'REMITENTE' | string | undefined;
  @Input() idEstablecimiento: number | null = null;

  rucEmpresa: string  = '00000000000';
  serieNumero: string = '0000-00000000';

  establecimientoRemitente: EstablecimientoRemitenteGuiaDTO | undefined;
  loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  $loading = this.loading.asObservable();

  constructor(
    
  ){
    
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    
  }

  ngOnChanges(): void {
    if(this.idEstablecimiento && this.tipoGuiaRemision){
      this.loading.next(true);
      this.entityBranchApiService.getByIdToGuia(this.idEstablecimiento, this.tipoGuiaRemision)
      .pipe(finalize(() => this.loading.next(false)))
      .subscribe({
        next: (res: EstablecimientoRemitenteGuiaDTO) => {
          this.rucEmpresa = res.entity_document_number;
          this.serieNumero = res.nuevo_numero_guia ?? '';
          this.establecimientoRemitente = res;
        },
        error: (e: HttpErrorResponse) => {
          this.errorHandler.handle(e);
        } 
      });
    }
  }

  ngOnDestroy(): void {
    
  }

}