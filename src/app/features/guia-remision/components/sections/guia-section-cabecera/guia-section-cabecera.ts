import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges} from '@angular/core';
import { RemitenteByIdToGuia } from 'app/features/remitente/models/remitente';
import { RemitenteApiService } from 'app/features/remitente/services/remitente-api.service';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { BehaviorSubject } from 'rxjs';

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

  @Input() tipoGuiaRemision!: 'TRANSPORTISTA' | 'REMITENTE' | string | undefined;
  @Input() idRemitente: number | null = null;

  rucEmpresa: string  = '00000000000';
  serieNumero: string = '0000-00000000';

  remitente: RemitenteByIdToGuia | undefined;
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

  ngOnChanges(changes: SimpleChanges): void {
    if(this.idRemitente && this.tipoGuiaRemision){
      this.loading.next(true);
      this.remitenteService.getByIdToGuia(this.idRemitente, this.tipoGuiaRemision).subscribe(res => {
        //console.log(res);
          this.rucEmpresa = res.ruc;
          this.serieNumero = res.nuevo_numero_guia ?? '';
          this.remitente = res;
          this.loading.next(false);
      });
    }
  }

  ngOnDestroy(): void {
    
  }

}