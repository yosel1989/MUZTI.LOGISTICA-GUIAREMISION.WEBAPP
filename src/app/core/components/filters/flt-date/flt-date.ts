import { CommonModule, formatDate } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputIconModule } from 'primeng/inputicon';
import { Popover, PopoverModule } from 'primeng/popover';
import { InputText } from "primeng/inputtext";
import { SelectModule } from 'primeng/select';
import { AbstractControl, FormControl, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { ColumnsFilterDto } from 'app/core/models/filter';
import { TooltipModule } from 'primeng/tooltip';
import { AlertService } from 'app/core/services/alert.service';

@Component({
  selector: 'app-flt-date',
  imports: [
    ButtonModule, 
    PopoverModule, 
    CommonModule, 
    InputGroupModule, 
    InputGroupAddonModule, 
    IconFieldModule, 
    InputIconModule, 
    InputText,
    SelectModule,
    ReactiveFormsModule,
    DatePickerModule,
    FormsModule,
    DividerModule,
    MessageModule,
    TooltipModule
  ],
  templateUrl: './flt-date.html',
  styleUrl: './flt-date.scss',
  providers: []
})

export class FltDateComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() title: string = 'Filtrar';
  @Input() column: string = 'info';
  @Input() today: boolean = true;
  @Input() clear: boolean = true;
  @Output() OnValuesChange: EventEmitter<ColumnsFilterDto | null> = new EventEmitter<ColumnsFilterDto | null>(); 

  @ViewChild('popover') op!: Popover;

  filterModes = [
    { label: 'Hoy', value: 'today'},
    { label: 'Ayer', value: 'yesterday'},
    { label: 'Esta semana', value: 'week'},
    { label: 'Este mes', value: 'month'},
    { label: 'Fecha', value: 'date'},
    { label: 'Rango fechas', value: 'range'}
  ];

  submitted = false;
  ctrlMode: FormControl = new FormControl(null, Validators.required);
  ctrlText: FormControl = new FormControl(null);

  ctrlDateStart: FormControl = new FormControl(null);
  ctrlDateEnd: FormControl = new FormControl(null);
  ctrlDate: FormControl = new FormControl(null);

  dateStart: Date | null = null;
  dateEnd: Date | null = null;

  isMobile = false;

  constructor(
    private alertService: AlertService,
    private cd: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= 768;
    this.ctrlMode.valueChanges.subscribe((res: string) => {
      this.ctrlDateEnd.clearAsyncValidators();
      this.ctrlDateStart.clearAsyncValidators();
      this.ctrlDate.clearAsyncValidators();
    });
  }

  ngAfterViewInit() {
    if(this.today){
      this.ctrlMode.setValue('today');
      this.ctrlText.setValue('Hoy');
      this.dateStart = new Date();
      this.dateEnd = new Date();
      this.evtApply();
    }
  }

  ngOnDestroy(): void {
	
  }

  toggle(event: any) {
      this.op.toggle(event);
  }

  // Getters

  get filter(): ColumnsFilterDto | null{
    if(this.dateStart === null && this.dateEnd === null){
      return null;
    }

    return {
      data: this.column,
      search:{
        value: `${formatDate(this.dateStart!, 'yyyy-MM-dd', 'en-US')}|${formatDate(this.dateEnd!, 'yyyy-MM-dd', 'en-US')}`,
      }
    }
  }

  // Events
  
  evtApply(): void{

    this.submitted = true;
    try {

        const today = new Date();

        if(!(this.ctrlMode.value === 'range' || this.ctrlMode.value === 'date')){
          const filterMode = this.filterModes.find(d => d.value === this.ctrlMode.value);
          this.ctrlText.setValue(filterMode?.label);
        }

        switch( this.ctrlMode.value ) {
          case 'today': 
                  this.dateStart = today;
                  this.dateEnd = today;  
                  break;

          case 'yesterday': 
                  const yesterday = new Date();
                  yesterday.setDate(today.getDate() - 1);
                  this.dateStart = yesterday;
                  this.dateEnd = yesterday;  
                  break;

          case 'week': 
                  const dayOfWeek = today.getDay();
                  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                  const monday = new Date(today);
                  monday.setDate(today.getDate() + diffToMonday);
                  const diffToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
                  const sunday = new Date(today);
                  sunday.setDate(today.getDate() + diffToSunday);
                  this.dateStart = monday; 
                  this.dateEnd = sunday;
                  break;

          case 'month':
                  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); 
                  this.dateStart = startOfMonth;
                  this.dateEnd = endOfMonth;
                  break;

          case 'range':
                  this.ctrlDateStart.addValidators(Validators.required);
                  this.ctrlDateEnd.addValidators([Validators.required, this.dateEndAfterStartValidator(this.ctrlDateStart)]);
                  this.ctrlDateStart.updateValueAndValidity();
                  this.ctrlDateEnd.updateValueAndValidity();
                  this.handlerValidateError();
                  this.dateStart = this.ctrlDateStart.value;
                  this.dateEnd =this.ctrlDateEnd.value;
                  this.ctrlText.setValue(`${formatDate(this.ctrlDateStart.value, 'dd/MM/yyyy', 'en-US')} - ${formatDate(this.ctrlDateEnd.value, 'dd/MM/yyyy', 'en-US')}`);
                  break;

          case 'date':
                  this.ctrlDate.addValidators(Validators.required);
                  this.ctrlDate.updateValueAndValidity();
                  this.handlerValidateError();
                  this.dateStart = this.ctrlDate.value;
                  this.dateEnd = this.ctrlDate.value;
                  this.ctrlText.setValue(`${formatDate(this.ctrlDate.value, 'dd/MM/yyyy', 'en-US')}`);
                  break;

          default: 
                  break;
        }

        this.OnValuesChange.emit(this.filter);
        this.submitted = false;
        this.op.hide();
        this.cd.detectChanges();
    } catch (error: any) {
      this.alertService.showToast({
        icon: 'warning',
        title: error.message,
        showCloseButton: true
      });
    }
  }

  evtClear(): void{
    this.submitted = false;
    this.ctrlMode.setValue(null);
    this.ctrlText.setValue(null);
    this.ctrlDate.setValue(null);
    this.ctrlDate.clearValidators();
    this.ctrlDateStart.setValue(null);
    this.ctrlDateStart.clearValidators();
    this.ctrlDateEnd.setValue(null);
    this.ctrlDateEnd.clearValidators();
    this.dateEnd = null;
    this.dateStart = null;
    this.OnValuesChange.emit(this.filter);
    this.op.hide();
  }

  // Handlers

  handlerValidateError(): void{
    if(this.ctrlDate.invalid){
      throw new Error('Tiene que seleccionar la fecha.');
    }

    if(this.ctrlDateStart.invalid){
      throw new Error('Tiene que seleccionar la fecha inicial.');
    }

    if(this.ctrlDateEnd.invalid){
      if(this.ctrlDateEnd.hasError('required'))
        throw new Error('Tiene que seleccionar la fecha final.');

      if(this.ctrlDateEnd.hasError('dateEndBeforeStart'))
        throw new Error('La fecha final debe ser mayor a la fecha inicial.');
    }
  }

  // Validators

  dateEndAfterStartValidator(startControl: AbstractControl): ValidatorFn {
    return (endControl: AbstractControl): { [key: string]: any } | null => {
      const startDate = startControl.value;
      const endDate = endControl.value;

      if (!startDate || !endDate) {
        return null; // No validar si alguna fecha está vacía
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      return end >= start ? null : { dateEndBeforeStart: true };
    };
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth <= 768;
  }

}
