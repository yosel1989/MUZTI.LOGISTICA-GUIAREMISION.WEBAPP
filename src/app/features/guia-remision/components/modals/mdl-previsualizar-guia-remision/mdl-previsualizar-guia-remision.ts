import { Component, OnDestroy, OnInit, AfterViewInit, Input, signal, inject } from '@angular/core';
import { GuiaRemisionDto, } from '@features/guia-remision/models/guia-remision.model';
import "pdfmake/build/vfs_fonts";
import { GuiaRemisionApiService } from '@features/guia-remision/services/guia-remision-api.service';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-mdl-previsualizar-guia-remision',
  templateUrl: './mdl-previsualizar-guia-remision.html',
  styleUrls: ['./mdl-previsualizar-guia-remision.scss'],                          
  imports: [
    CardModule,
    TableModule
  ],
})

export class MdlPrevisualizarGuiaRemisionComponent implements OnInit, AfterViewInit, OnDestroy{

  private api = inject(GuiaRemisionApiService);
  @Input() data!: GuiaRemisionDto;
  loading = signal(false);

  constructor(
  ) {

  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy(): void {

  }

}