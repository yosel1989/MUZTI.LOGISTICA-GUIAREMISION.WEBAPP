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
import { UtilService } from 'app/core/services/util.service';

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
    private sanitizer: DomSanitizer,
    private utilService: UtilService
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

        {
          table: {
            widths: [100, '*', 200],
            heights: [80],
            body: [
              [
                { text: '', border: [false,false,false,false] },
                { 
                  stack: [
                    {text: this.data.remitente.nombre_empresa, bold: true, marginBottom: 2},
                    {text: this.data.remitente.direccion.toUpperCase(), marginBottom:10, color: '#adadad'},
                    {text: `${this.data.remitente.distrito} - ${this.data.remitente.provincia} - ${this.data.remitente.departamento}`, color: '#adadad'},
                  ],
                  border: [false,false,false,false],
                },
                {
                  stack: [
                    {
                      canvas: [
                        {
                          type: 'rect',
                          x: 0,
                          y: 0,
                          w: 200,
                          h: 80,
                          r: 10,
                          lineColor: '#adadad'
                        }
                      ],
                      margin: [0, 0, 0, 0],
                      alignment: 'right'
                    },
                    {
                      stack: [
                        {
                          text: `RUC: ${this.data.remitente.ruc}`,
                          alignment: 'center',
                          color: '#adadad'
                        },
                        {
                          text: 'GUÍA DE REMISIÓN REMITENTE ELECTRÓNICA',
                          alignment: 'center',
                          bold: true,
                          fontSize: 10,
                          marginTop: 5,
                          marginBottom: 5
                        },
                        {
                          text: `Nro. ${this.data.remitente.serie_numero}`,
                          alignment: 'center',
                          color: '#adadad'
                        }
                      ],
                      margin: [0, -65, 0, 0]
                    }
                  ],
                  border: [false, false, false, false],
                  margin: [0, 0, 0, 0],
                  alignment: 'right'
                }
              ]
            ]
          },
          margin: [0,0,0,5]
        },


        {
          table: {
            widths: ['auto', 200, 'auto', '*'],
            body: [
              [
                {text: 'Cliente:', border: [true, true, false, false], bold: true, marginLeft: 10, marginTop: 5, marginBottom: 1}, 
                {text: this.data.destinatario.razon_social, border: [false, true, false, false], marginLeft:10,  marginTop: 5, marginBottom: 1, color: '#adadad'}, 
                {text: '', border: [false, true, false, false], marginLeft:10, marginTop: 5, marginBottom: 1}, 
                {text: '', border: [false, true, true, false], marginLeft:10, marginTop: 5, marginBottom: 1}
              ],
              [
                {text: `${this.data.destinatario.tipo_documento}:`, border: [true, false, false, false], bold: true, marginLeft:10, marginTop: 1, marginBottom: 1}, 
                {text: this.data.destinatario.numero_documento, border: [false, false, false, false], marginLeft:10, marginTop: 1, marginBottom: 1, color: '#adadad'}, 
                {text: 'Dirección:', border: [false, false, false, false], bold: true, marginLeft:10, marginTop: 1, marginBottom: 1}, 
                {text: this.data.destinatario.direccion ?? '-', border: [false, false, true, false], marginLeft:10, marginTop: 1, marginBottom: 1, color: '#adadad'}
              ],
              [
                {text: 'Fecha de emisión:', border: [true, false, false, true], bold: true, marginLeft:10, marginTop: 1, marginBottom: 5}, 
                {text: this.utilService.dateFormat(this.data.fecha, 'dd-MMM-yyyy').toUpperCase().replace(".",""), border: [false, false, false, true], marginLeft:10, marginTop: 1, marginBottom: 5, color: '#adadad'}, 
                {text: 'Ciudad:', border: [false, false, false, true], bold: true, marginLeft:10, marginTop: 1, marginBottom: 5}, 
                {text: `${this.data.destinatario.distrito ?? '-'} - ${this.data.destinatario.provincia ?? '-'} - ${this.data.destinatario.departamento ?? '-'}`, border: [false, false, true, true], marginLeft:10, marginTop: 1, marginBottom: 5, color: '#adadad'}
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
              width: '50%',
              stack: [
                {text: 'DETALLE DE LA GUÍA:', bold: true, marginLeft: 10, marginTop:5, marginBottom: 2.5},
                {
                  table: {
                    widths: ['auto', 'auto', 'auto', '*'],
                    body: [
                      [
                        {text: 'Tipo de Transportista:', border: [true, true, false, false], bold: true, marginLeft: 10, marginTop: 5, marginBottom: 2}, 
                        {text: this.data.tipo_transporte.toUpperCase(), border: [false, true, false, false], marginLeft:0,  marginTop: 5, marginBottom: 2, color: '#adadad'}, 
                        {text: 'Fecha Inicio traslado:', border: [false, true, false, false], marginLeft:10, marginTop: 5, marginBottom: 2, bold: true}, 
                        {text: this.data.datos_envio.fecha_envio ? this.utilService.dateFormat(this.data.datos_envio.fecha_envio, 'dd-MMM-yyyy').toUpperCase().replace(".","") : '-', border: [false, true, true, false], marginLeft:0, marginTop: 5, marginBottom: 2, color: '#adadad'}
                      ],
                      [
                        {text: 'Und. de Medida:', border: [true, false, false, false], bold: true, marginLeft:10, marginTop: 2, marginBottom: 2}, 
                        {text: this.data.datos_envio.codigo_um, border: [false, false, false, false], marginLeft:0, marginTop: 2, marginBottom: 2, color: '#adadad'}, 
                        {text: 'Peso Bruto:', border: [false, false, false, false], bold: true, marginLeft:10, marginTop: 2, marginBottom: 2}, 
                        {text: this.data.datos_envio.peso_bruto ?? '-', border: [false, false, true, false], marginLeft:0, marginTop: 2, marginBottom: 2, color: '#adadad'}
                      ],
                      [
                        {text: 'Motivo:', border: [true, false, false, true], bold: true, marginLeft:10, marginTop: 2, marginBottom: 5}, 
                        {text: this.data.tipo_traslado, border: [false, false, false, true], marginLeft:0, marginTop: 2, marginBottom: 5, color: '#adadad'}, 
                        {text: 'Descripción:', border: [false, false, false, true], bold: true, marginLeft:10, marginTop: 2, marginBottom: 5}, 
                        {text: '', border: [false, false, true, true], marginLeft:0, marginTop: 2, marginBottom: 5}
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
              width: '50%',
              columns: [
                {
                  width: '50%',
                  stack: [
                    {text: 'PUNTO DE PARTIDA:', bold: true, marginLeft: 10, marginTop:5, marginBottom: 2.5},
                    {
                      table: {
                        widths: ['*'],
                        body: [
                          [
                            {text: `${this.data.origen.direccion ?? '-'}`,  marginLeft: 10, marginTop: 10, marginBottom: 10, marginRight: 10, alignment: 'center'}
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
                  width: '50%',
                  stack: [
                    {text: 'PUNTO DE LLEGADA:', bold: true, marginLeft: 10, marginTop:5, marginBottom: 2.5},
                    {
                      table: {
                        widths: ['*'],
                        body: [
                          [
                            {text: `${this.data.destino[0].direccion ?? '-'}`, marginLeft: 10, marginTop: 10, marginBottom: 10, marginRight: 10, alignment: 'center'}
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
              ],
              columnGap: 10
            }
          ],
          columnGap: 10
        },

        {
          marginTop: 10,
          table: {
            widths: [25, 40, 50, 50, '*', 60, 35, 70],
            body: [
              [
                {text: 'ITEM', border: [true, true, true, true], bold: true, marginTop: 10, marginBottom:10, marginLeft: 0, marginRight: 0, alignment: 'center', fillColor: '#adadad', color: '#ffffff'}, 
                {text: 'CANTIDAD', border: [true, true, true, true], bold: true, marginTop: 10, marginBottom:10, marginLeft: 0, marginRight: 0, alignment: 'center', fillColor: '#adadad', color: '#ffffff'},
                {text: 'UNIDAD', border: [true, true, true, true], bold: true, marginTop: 10, marginBottom:10, marginLeft: 0, marginRight: 0, alignment: 'center', fillColor: '#adadad', color: '#ffffff'},
                {text: 'CÓDIGO', border: [true, true, true, true], bold: true, marginTop: 10, marginBottom:10, marginLeft: 0, marginRight: 0, alignment: 'center', fillColor: '#adadad', color: '#ffffff'},
                {text: 'DESCRIPCIÓN', border: [true, true, true, true], bold: true, marginTop: 10, marginBottom:10, marginLeft: 0, marginRight: 0, alignment: 'center', fillColor: '#adadad', color: '#ffffff'},
                {text: 'COD. DE PRD. SUNAT', border: [true, true, true, true], bold: true, marginTop: 5, marginBottom:5, marginLeft: 0, marginRight: 0, alignment: 'center', fillColor: '#adadad', color: '#ffffff'},
                {text: 'GTIN', border: [true, true, true, true], bold: true, marginTop: 10, marginBottom:10, marginLeft: 0, marginRight: 0, alignment: 'center', fillColor: '#adadad', color: '#ffffff'},
                {text: 'BIEN NORMALIZADO', border: [true, true, true, true], bold: true, margin: 5, alignment: 'center', fillColor: '#adadad', color: '#ffffff'}
              ],
              ...this.data.productos.map((producto, index) => [
                {text: index + 1, border: [true, true, true, true], margin: 5, alignment: 'center'}
              ])
            ]
          },
          layout: {
            hLineColor: function (i, node) {
              if (i === 0 || i === 1) {
                return '#bababa'; 
              }
              return '#adadad';
            },
            vLineColor: function (i, node) {
              if (node.table.body[0]) {
                return '#bababa';
              }
              return '#adadad';
            }
          }

        },

        { text: 'OBSERVACIONES', bold: true, marginTop:5, marginBottom: 2.5},
        { text: 'ASDFADSFADS', marginLeft: 10, marginTop: 5},


        { text: 'DATOS DEL CONDUCTOR', bold: true, marginTop: 30, marginBottom: 2.5},
        {
          table: {
            widths: ['*', '*', '*', '*'],
            body: [
              [
                {text: 'Principal:', border: [true, true, false, false], bold: true, margin: 0}, 
                {text: '', border: [false, true, false, false], margin: 0}, 
                {text: '', border: [false, true, false, false], margin: 0}, 
                {text: '', border: [false, true, true, false], margin: 0},
              ],
              [
                {
                  text: [
                    { text: 'N° de documento:', bold: true},
                    { text: '\t' },
                    { text: '45846461', color: '#adadad'}
                  ],
                  border: [true, false, false, true],
                  marginLeft: 10
                },

                {
                  text: [
                    { text: 'N° de licencia:', bold: true},
                    { text: '\t' },
                    { text: '4456345345', color: '#adadad'}
                  ],
                  border: [false, false, false, true],
                  marginLeft: 10
                },

                {
                  text: [
                    { text: 'Nombres y apellidos:', bold: true },
                    { text: '\t' },
                    { text: 'Yosel Edwin - Aguirre Balbin', color: '#adadad' }
                  ],
                  border: [false, false, false, true],
                  marginLeft: 10
                },

                {
                  text: [
                    { text: '', bold: true},
                    { text: '\t' },
                    { text: ''}
                  ],
                  border: [false, false, true, true],
                  marginLeft: 10
                }
              ]
            ],
          },
          layout: {
            hLineColor: () => '#adadad',
            vLineColor: () => '#adadad'
          },
        },


        { text: 'DATOS DEL VEHÍCULO', bold: true, marginTop: 5, marginBottom: 2.5},
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                {text: 'Principal:', border: [true, true, false, false], bold: true, margin: 0}, 
                {text: 'Secundario', border: [false, true, false, false], bold: true, margin: 0}, 
                {text: '', border: [false, true, true, false], margin: 0}, 
              ],
              [
                {
                  stack:[
                    [
                      {text:[
                        { text: 'Placa:', bold: true},
                        { text: '\t' },
                        { text: 'ERT001', color: '#adadad'}
                      ]},
                      {text:[
                        { text: 'TUCE:', bold: true},
                        { text: '\t' },
                        { text: 'J05151515'}
                      ]},
                      {text:[
                        { text: 'N° de Autorización vehicular:', bold: true},
                        { text: '\t' },
                        { text: 'L879787879 - DIGEMID', color: '#adadad'}
                      ]},
                    ],
                  ],
                  border: [true, false, false, true],
                  marginLeft: 10
                },

                {
                  text: [
                    { text: 'Placa:', bold: true},
                    { text: '\t' },
                    { text: 'YUI005', color: '#adadad' }
                  ],
                  border: [false, false, false, true],
                  marginLeft: 10
                },

                {
                  text: [
                    { text: '', bold: true },
                    { text: '\t' },
                    { text: ''}
                  ],
                  border: [false, false, true, true],
                  marginLeft: 10
                },

              ]
            ],
          },
          layout: {
            hLineColor: () => '#adadad',
            vLineColor: () => '#adadad'
          },
        },


      ],
      watermark: { text: 'PREVISUALIZACIÓN', color: 'red', opacity: 0.1, bold: true, italics: false },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 8,
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