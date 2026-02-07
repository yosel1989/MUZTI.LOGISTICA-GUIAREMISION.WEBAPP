import { Component, OnDestroy, OnInit, AfterViewInit, Output, EventEmitter, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { DocumentInvoiceType } from 'app/shared/models/document-invoice-type';
import { FAKE_DOCUMENT_INVOICE_TYPE_TO_DOCREF } from 'app/fake/items/data/fakeDocumenType';
import { MessageModule } from 'primeng/message';
import { OnlyNumberDirective } from 'app/core/directives/only-numbers.directive';

@Component({
  selector: 'app-mdl-editar-comprobante-referencia',
  templateUrl: './mdl-editar-comprobante-referencia.html',
  styleUrls: ['./mdl-editar-comprobante-referencia.scss'],                          
  imports: [
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    MessageModule,
    OnlyNumberDirective
  ],
})

export class MdlEditarComprobanteReferenciaComponent implements OnInit, AfterViewInit, OnDestroy{

  @Input() row: any;
  @Output() OnAdded : EventEmitter<any> = new EventEmitter<any>();
  @Output() OnCanceled : EventEmitter<boolean> = new EventEmitter<boolean>();

  formGroup: FormGroup = new FormGroup({});
  documentTypes: DocumentInvoiceType[] = FAKE_DOCUMENT_INVOICE_TYPE_TO_DOCREF;
  submitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      tipo_comprobante: new FormControl(this.row.tipo_comprobante, Validators.required),
      ruc_documento: new FormControl(this.row.ruc_documento, [Validators.required, Validators.minLength(11), Validators.maxLength(11)]),
      serie_correlativo: new FormControl(this.row.serie_correlativo, [Validators.required, this.serieCorrelativoValidator('tipo_comprobante'), Validators.pattern('^[A-Z0-9]{4}-\\d{8}$')]),
    });

    this.formGroup.get('tipo_comprobante')?.valueChanges.subscribe(() => { 
      this.formGroup.get('serie_correlativo')?.updateValueAndValidity(); 
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }

  // getters

  get f(): any{
    return this.formGroup.controls;
  }

  get data(): any{
    return {
      tipo_comprobante: this.formGroup.value.tipo_comprobante,
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

  // functions

  serieCorrelativoValidator(tipoControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null; // aún no está inicializado
      }

      const tipo = control.parent.get(tipoControlName)?.value;
      const serie = control.value;

      if (!tipo || !serie) {
        return null;
      }

      if (tipo === 'FACTURA' && !/^F/.test(serie)) { 
        return { serieInvalida: 'La serie debe comenzar con F cuando es FACTURA' }; 
      } 
      if (tipo === 'BOLETA' && !/^B/.test(serie)) { 
        return { serieInvalida: 'La serie debe comenzar con B cuando es BOLETA' }; 
      }

      return null;
    };
  }

}