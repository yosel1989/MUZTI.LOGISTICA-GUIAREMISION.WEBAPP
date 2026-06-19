import { Component, OnDestroy, OnInit, AfterViewInit, Output, EventEmitter, Input, inject, ViewChild, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { Select, SelectModule } from 'primeng/select';
import { DocumentInvoiceType } from 'app/shared/models/document-invoice-type';
import { FAKE_DOCUMENT_INVOICE_TYPE_TO_DOCREF } from 'app/fake/items/data/fakeDocumenType';
import { MessageModule } from 'primeng/message';
import { OnlyNumberDirective } from 'app/core/directives/only-numbers.directive';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectDocumentoRelacionadoComponent } from '@features/catalogo/components/selects/select-documento-relacionado/select-documento-relacionado';
import { CatalogoApiService } from '@features/catalogo/services/catalogo-api.service';
import { AlertService } from '@core/services/alert.service';
import { Subscription } from 'rxjs';
import { DocumentoRelacionadoDTO } from '@features/catalogo/models/catalogo.model';

@Component({
  selector: 'app-mdl-comprobante-referencia',
  templateUrl: './mdl-comprobante-referencia.html',
  styleUrls: ['./mdl-comprobante-referencia.scss'],                          
  imports: [
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    MessageModule,
    OnlyNumberDirective,
    ToggleSwitchModule,
    SelectDocumentoRelacionadoComponent
  ],
})

export class MdlComprobanteReferenciaComponent implements OnInit, AfterViewInit, OnDestroy{

  @ViewChild('selectDocumentoRelacionado') selectDocumentoRelacionado: SelectDocumentoRelacionadoComponent | undefined;
  @Output() OnAdded : EventEmitter<any> = new EventEmitter<any>();
  @Output() OnCanceled : EventEmitter<boolean> = new EventEmitter<boolean>();

  formGroup: FormGroup = new FormGroup({});
  documentTypes: DocumentInvoiceType[] = FAKE_DOCUMENT_INVOICE_TYPE_TO_DOCREF;
  submitted: boolean = false;

  private _motivoTraslado = signal('');
  private _tipoDocumentoRelacionado = signal<DocumentoRelacionadoDTO | undefined | null>(null);

  @Input() tipo: string | 'REMITENTE' | 'TRANSPORTISTA' | null = null;
  @Input() set motivoTraslado(value: string) {
      if (this._motivoTraslado() !== value) {
          this._motivoTraslado.set(value);
      }
  }

  subs = new Subscription();

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      checked: new FormControl({value: true, disabled: true}, Validators.required),
      tipo_comprobante_id: new FormControl(null, Validators.required),
      ruc_documento: new FormControl(null, [Validators.required, Validators.minLength(11), Validators.maxLength(11)]),
      serie_correlativo: new FormControl(null, [
        Validators.required, 
        this.documentoRelacionadoValidator(this._tipoDocumentoRelacionado()?.codigo_sunat, this._motivoTraslado())
      ]),
    });

  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // getters

  get f(): any{
    return this.formGroup.controls;
  }

  get data(): any{
    return {
      tipo_comprobante_id: this.formGroup.value.tipo_comprobante_id,
      tipo_comprobante: this.selectDocumentoRelacionado?.selected()?.descripcion_corta,
      tipo_comprobante_codigo: this.selectDocumentoRelacionado?.selected()?.codigo_sunat,
      ruc_documento: this.formGroup.value.ruc_documento,
      serie_correlativo: this.formGroup.value.serie_correlativo,
    }
  }

  // events

  evtOnSubmit(): void{
    this.submitted = true;
    if(this.formGroup.invalid){
      return;
    }
    this.OnAdded.emit(this.data);
  }

  evtOnCancel(): void{
    this.OnCanceled.emit(true);
  }

  evtSelectTipoDocumentoRelacionado(evt: DocumentoRelacionadoDTO | undefined | null){
    this._tipoDocumentoRelacionado.set(evt);
    this.formGroup.get('serie_correlativo')?.setValidators([
      Validators.required, 
      this.documentoRelacionadoValidator(this._tipoDocumentoRelacionado()?.codigo_sunat, this._motivoTraslado())
    ]);
    this.formGroup.get('serie_correlativo')?.updateValueAndValidity();
  }

  // functions

  documentoRelacionadoValidator(tipoDocumento: string | null | undefined, motivoTraslado?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      if (!valor || !tipoDocumento) {
        return null;
      }

      let pattern: RegExp | null = null;

      // console.log(valor, tipoDocumento);

      switch (tipoDocumento) {
        case '01': // Factura
          pattern = /^(F[A-Z0-9]{3}|E[0-9]{3}|[0-9]{1,4})-[0-9]{1,8}$/;
          break;
        case '03': // Boleta
          pattern = /^(B[A-Z0-9]{3}|EB[0-9]{2}|[0-9]{1,4})-[0-9]{1,8}$/;
          break;
        case '04': // Liquidación de compra
          pattern = /^(L[A-Z0-9]{3}|E[0-9]{3}|[0-9]{1,4})-[0-9]{1,8}$/;
          break;
        case '12': // Ticket
          pattern = /^[a-zA-Z0-9-]{1,20}-[a-zA-Z0-9-]{1,20}$/;
          break;
        case '48': // Comprobante operaciones
          pattern = /^[0-9]{1,4}-[0-9]{1,7}$/;
          break;
        case '09': // GRE remitente
          pattern = /^(T[A-Z0-9]{3}|EG07|EG02)-[0-9]{1,8}$/;
          break;
        case '49': // Constancia IVAP
        case '80': // Constancia detracción
          pattern = /^[0-9]{1,15}$/;
          break;
        case '81': // Código SCOP
          pattern = /^[a-zA-Z0-9]{1,20}$/;
          break;
        case '50': // Declaración Aduanera
          if (motivoTraslado === '08') {
            pattern = /^[0-9]{3}-[0-9]{4}-10-[0-9]{1,6}$/;
          } else if (motivoTraslado === '09') {
            pattern = /^[0-9]{3}-[0-9]{4}-40-[0-9]{1,6}$/;
          } else {
            pattern = /^[0-9]{3}-[0-9]{4}-[0-9]{2}-[0-9]{1,6}$/;
          }
          break;
        case '52': // Declaración Simplificada
          if (motivoTraslado === '08') {
            pattern = /^[0-9]{3}-[0-9]{4}-18-[0-9]{1,6}$/;
          } else if (motivoTraslado === '09') {
            pattern = /^[0-9]{3}-[0-9]{4}-48-[0-9]{1,6}$/;
          } else {
            pattern = /^[0-9]{3}-[0-9]{4}-[0-9]{2}-[0-9]{1,6}$/;
          }
          break;
        case '71': case '72': case '73': case '74':
        case '75': case '76': case '77': case '78':
          pattern = /^.{1,100}$/; // hasta 100 caracteres
          break;
      }

      if (pattern && !pattern.test(valor)) {
        return { formatoInvalido: `El número de documento no cumple con el formato para tipo de comprobante` };
      }

      return null;
    };
  }

}