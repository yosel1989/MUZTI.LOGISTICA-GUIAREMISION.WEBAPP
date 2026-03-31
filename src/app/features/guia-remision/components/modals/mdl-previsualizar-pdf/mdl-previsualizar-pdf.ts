import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GuiaRemisionRemitenteRequestDto } from '@features/guia-remision/models/guia-remision.model';
import { DocumentoApiService } from '@features/guia-remision/services/documento-api.service';
import { LoaderComponent } from 'app/core/components/loaders/loader/loder.component';
import { SafeUrlPipe } from 'app/core/pipes/safe-url-pipe/safe-url-pipe';
import { BehaviorSubject } from 'rxjs';

import { TDocumentDefinitions } from 'pdfmake/interfaces';

import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";

@Component({
  selector: 'app-mdl-previsualizar-pdf',
  templateUrl: './mdl-previsualizar-pdf.html',
  styleUrls: ['./mdl-previsualizar-pdf.scss'],                          
  imports: [
    AsyncPipe,
    LoaderComponent,
    SafeUrlPipe
  ],
})

export class MdlPrevisualizarPdfComponent implements OnInit, AfterViewInit, OnDestroy{

  @Input() data!: GuiaRemisionRemitenteRequestDto;

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
    this.loading.next(true);
    this.loadPdf();
  }

  ngOnDestroy(): void {
  }

  loadPdf(): void{
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [40, 60, 40, 60], 
      content: [

        { text: 'CAROLINA SAC', style: 'header' },
        { text: 'Av. Simón Bolívar 1831\nPUEBLO LIBRE - LIMA - LIMA', margin: [0, 0, 0, 10] },
        { text: 'RUC: 20341191476', bold: true },
        { text: 'GUÍA DE REMISIÓN REMITENTE ELECTRÓNICA', style: 'subheader' },
        { text: 'Nro. T001-00000116', margin: [0, 0, 0, 10] },

        {
          table: {
            widths: ['auto', 200, 'auto', '*'],
            body: [
              [
                {text: 'Cliente:', border: [true, true, false, false], bold: true, marginLeft: 10, marginTop: 5, marginBottom: 2}, 
                {text: 'MTC SAC', border: [false, true, false, false], marginLeft:10,  marginTop: 5, marginBottom: 2}, 
                {text: '', border: [false, true, false, false], marginLeft:10, marginTop: 5, marginBottom: 2}, 
                {text: '', border: [false, true, true, false], marginLeft:10, marginTop: 5, marginBottom: 2}
              ],
              [
                {text: 'RUC:', border: [true, false, false, false], bold: true, marginLeft:10, marginTop: 2, marginBottom: 2}, 
                {text: '10458464613', border: [false, false, false, false], marginLeft:10, marginTop: 2, marginBottom: 2}, 
                {text: 'Dirección:', border: [false, false, false, false], bold: true, marginLeft:10, marginTop: 2, marginBottom: 2}, 
                {text: 'Av. Universitaria 2345', border: [false, false, true, false], marginLeft:10, marginTop: 2, marginBottom: 2}
              ],
              [
                {text: 'Fecha de emisión:', border: [true, false, false, true], bold: true, marginLeft:10, marginTop: 2, marginBottom: 5}, 
                {text: '31-MAR-2026', border: [false, false, false, true], marginLeft:10, marginTop: 2, marginBottom: 5}, 
                {text: 'Ciudad:', border: [false, false, false, true], bold: true, marginLeft:10, marginTop: 2, marginBottom: 5}, 
                {text: 'LIMA - LIMA - LIMA', border: [false, false, true, true], marginLeft:10, marginTop: 2, marginBottom: 5}
              ]
            ],
          },
          layout: {
            hLineColor: () => '#adadad',
            vLineColor: () => '#adadad'
          },
        },

        {
          columns: [
            {
              width: '*',
              stack: [
                {text: 'DETALLE DE LA GUÍA:', bold: true, marginLeft: 10, marginTop:5, marginBottom: 2.5},
                {
                  table: {
                    widths: ['auto', 100, 'auto', '*'],
                    body: [
                      [
                        {text: 'Tipo de Transportista:', border: [true, true, false, false], bold: true, marginLeft: 10, marginTop: 5, marginBottom: 2}, 
                        {text: 'PRIVADO', border: [false, true, false, false], marginLeft:10,  marginTop: 5, marginBottom: 2}, 
                        {text: 'Fecha Inicio traslado:', border: [false, true, false, false], marginLeft:10, marginTop: 5, marginBottom: 2, bold: true}, 
                        {text: '31-mar-2026', border: [false, true, true, false], marginLeft:10, marginTop: 5, marginBottom: 2}
                      ],
                      [
                        {text: 'Und. de Medida:', border: [true, false, false, false], bold: true, marginLeft:10, marginTop: 2, marginBottom: 2}, 
                        {text: 'KGM', border: [false, false, false, false], marginLeft:10, marginTop: 2, marginBottom: 2}, 
                        {text: 'Peso Bruto:', border: [false, false, false, false], bold: true, marginLeft:10, marginTop: 2, marginBottom: 2}, 
                        {text: '2,344.00', border: [false, false, true, false], marginLeft:10, marginTop: 2, marginBottom: 2}
                      ],
                      [
                        {text: 'Motivo:', border: [true, false, false, true], bold: true, marginLeft:10, marginTop: 2, marginBottom: 5}, 
                        {text: 'VENTA', border: [false, false, false, true], marginLeft:10, marginTop: 2, marginBottom: 5}, 
                        {text: 'Descripción:', border: [false, false, false, true], bold: true, marginLeft:10, marginTop: 2, marginBottom: 5}, 
                        {text: '', border: [false, false, true, true], marginLeft:10, marginTop: 2, marginBottom: 5}
                      ]
                    ],
                  },
                  layout: {
                    hLineColor: () => '#adadad',
                    vLineColor: () => '#adadad'
                  },
                },
              ]
            },
            {
              width: '*',
              columns: [
                {
                  width: '*',
                  stack: [
                    {text: 'DETALLE DE LA GUÍA:', bold: true, marginLeft: 10, marginTop:5, marginBottom: 2.5},
                    {
                      table: {
                        widths: ['auto', 100, 'auto', '*'],
                        body: [
                          [
                            {text: 'Tipo de Transportista:', border: [true, true, false, false], bold: true, marginLeft: 10, marginTop: 5, marginBottom: 2}, 
                            {text: 'PRIVADO', border: [false, true, false, false], marginLeft:10,  marginTop: 5, marginBottom: 2}, 
                            {text: 'Fecha Inicio traslado:', border: [false, true, false, false], marginLeft:10, marginTop: 5, marginBottom: 2, bold: true}, 
                            {text: '31-mar-2026', border: [false, true, true, false], marginLeft:10, marginTop: 5, marginBottom: 2}
                          ],
                          [
                            {text: 'Und. de Medida:', border: [true, false, false, false], bold: true, marginLeft:10, marginTop: 2, marginBottom: 2}, 
                            {text: 'KGM', border: [false, false, false, false], marginLeft:10, marginTop: 2, marginBottom: 2}, 
                            {text: 'Peso Bruto:', border: [false, false, false, false], bold: true, marginLeft:10, marginTop: 2, marginBottom: 2}, 
                            {text: '2,344.00', border: [false, false, true, false], marginLeft:10, marginTop: 2, marginBottom: 2}
                          ],
                          [
                            {text: 'Motivo:', border: [true, false, false, true], bold: true, marginLeft:10, marginTop: 2, marginBottom: 5}, 
                            {text: 'VENTA', border: [false, false, false, true], marginLeft:10, marginTop: 2, marginBottom: 5}, 
                            {text: 'Descripción:', border: [false, false, false, true], bold: true, marginLeft:10, marginTop: 2, marginBottom: 5}, 
                            {text: '', border: [false, false, true, true], marginLeft:10, marginTop: 2, marginBottom: 5}
                          ]
                        ],
                      },
                      layout: {
                        hLineColor: () => '#adadad',
                        vLineColor: () => '#adadad'
                      },
                    },
                  ]
                },
                {
                  width: '*',
                  stack: [
                    {text: 'DETALLE DE LA GUÍA:', bold: true, marginLeft: 10, marginTop:5, marginBottom: 2.5},
                    {
                      table: {
                        widths: ['auto', 100, 'auto', '*'],
                        body: [
                          [
                            {text: 'Tipo de Transportista:', border: [true, true, false, false], bold: true, marginLeft: 10, marginTop: 5, marginBottom: 2}, 
                            {text: 'PRIVADO', border: [false, true, false, false], marginLeft:10,  marginTop: 5, marginBottom: 2}, 
                            {text: 'Fecha Inicio traslado:', border: [false, true, false, false], marginLeft:10, marginTop: 5, marginBottom: 2, bold: true}, 
                            {text: '31-mar-2026', border: [false, true, true, false], marginLeft:10, marginTop: 5, marginBottom: 2}
                          ],
                          [
                            {text: 'Und. de Medida:', border: [true, false, false, false], bold: true, marginLeft:10, marginTop: 2, marginBottom: 2}, 
                            {text: 'KGM', border: [false, false, false, false], marginLeft:10, marginTop: 2, marginBottom: 2}, 
                            {text: 'Peso Bruto:', border: [false, false, false, false], bold: true, marginLeft:10, marginTop: 2, marginBottom: 2}, 
                            {text: '2,344.00', border: [false, false, true, false], marginLeft:10, marginTop: 2, marginBottom: 2}
                          ],
                          [
                            {text: 'Motivo:', border: [true, false, false, true], bold: true, marginLeft:10, marginTop: 2, marginBottom: 5}, 
                            {text: 'VENTA', border: [false, false, false, true], marginLeft:10, marginTop: 2, marginBottom: 5}, 
                            {text: 'Descripción:', border: [false, false, false, true], bold: true, marginLeft:10, marginTop: 2, marginBottom: 5}, 
                            {text: '', border: [false, false, true, true], marginLeft:10, marginTop: 2, marginBottom: 5}
                          ]
                        ],
                      },
                      layout: {
                        hLineColor: () => '#adadad',
                        vLineColor: () => '#adadad'
                      },
                    },
                  ]
                }
              ]
            }
          ]
        },

        { text: 'Cliente: Yosel Edwin Aguirre Balbin', margin: [0, 0, 0, 5] },
        { text: 'RUC: 10458464613', margin: [0, 0, 0, 5] },
        { text: 'Fecha de emisión: 31-MAR-2026', margin: [0, 0, 0, 10] },

        {
          table: {
            widths: ['auto', '*'],
            body: [
              ['Dirección:', 'Jr. Libertad 816 km 11'],
              ['Ciudad:', 'LIMA - LIMA - LIMA']
            ]
          },
          margin: [0, 0, 0, 10]
        },

        { text: 'DETALLE DE LA GUÍA:', style: 'subheader' },
        { text: 'Tipo de Transportista: PRIVADO' },
        { text: 'Fecha inicio traslado: 31-mar-2026' },
        { text: 'Und. de Medida: KGM' },
        { text: 'Motivo: VENTA', margin: [0, 0, 0, 10] },

        {
          table: {
            widths: ['auto', '*'],
            body: [
              ['Peso Bruto:', '2,344.00'],
              ['Descripción:', 'PRIVADO']
            ]
          },
          margin: [0, 0, 0, 10],
        },

        { text: 'PUNTO DE PARTIDA: JR. LIBERTAD 816, LIMA - LIMA - COMAS' },
        { text: 'PUNTO DE LLEGADA: AV. UNIVERSITARIA 2345, LIMA - LIMA - CARABAYLLO', margin: [0, 0, 0, 10] },

        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto'],
            body: [
              ['ITEM', 'CANTIDAD', 'UNIDAD', 'CÓDIGO', 'DESCRIPCIÓN', 'COD. DE PRD. SUNAT', 'GTIN', 'BIEN NORMALIZADO'],
              ['1', '1', 'Unidad', '', 'PRODUCTO 1', '', '', ''],
              ['2', '1', 'Unidad', '', 'PRODUCTO 2', '', '', '']
            ]
          },
          margin: [0, 0, 0, 10]
        },

        { text: 'OBSERVACIONES\nDescripción', margin: [0, 0, 0, 10] },

        { text: '# DATOS DEL CONDUCTOR', style: 'subheader' },
        { text: 'Nº de documento: 45846461' },
        { text: 'Nº de licencia: L435435454' },
        { text: 'Nombres y apellidos: Yosel Edwin - Aguirre Balbin', margin: [0, 0, 0, 10] },

        { text: '# DATOS DEL VEHÍCULO', style: 'subheader' },
        { text: 'Placa: RTY789', margin: [0, 0, 0, 10] },

        { text: 'Operador de Servicios Electrónicos según Resolución Nº 034-005-0008776', italics: true },
        { text: 'Representación impresa de la guía de remisión remitente, consulte en www.efact.pe', fontSize: 8, italics: true }
      ],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 9,
        color: '#60615b'
      },
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);

    pdfDocGenerator.getBlob().then((blob: Blob) => {
      const blobUrl = URL.createObjectURL(blob);
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
      this.urlBlob = blobUrl;
      this.loading.next(false);
      this.cdr.markForCheck();
    });

  }

}