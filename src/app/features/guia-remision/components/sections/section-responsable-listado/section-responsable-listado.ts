import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  signal,
  Input,
  inject
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroQuestionMarkCircleSolid } from '@ng-icons/heroicons/solid';
import { InputNumberModule } from 'primeng/inputnumber';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { OverlayModule } from 'primeng/overlay';
import { DividerModule } from 'primeng/divider';
import { TextareaModule } from 'primeng/textarea';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { AlertService } from 'app/core/services/alert.service';
import { tablerAlertCircle } from '@ng-icons/tabler-icons';
import { CardModule } from 'primeng/card';
import { CatalogoApiService } from '@features/catalogo/services/catalogo-api.service';
import { PersonalDTO } from '@features/personal/models/personal.model';
import { MdlListaPersonalComponent } from '@features/personal/components/modals/mdl-lista-personal/mdl-lista-personal';

@Component({
  selector: 'app-section-responsable-listado',
  templateUrl: './section-responsable-listado.html',
  styleUrls: ['./section-responsable-listado.scss'],
  imports: [
    ButtonModule,
    RatingModule,
    TableModule,
    TagModule,
    FormsModule,
    InputTextModule,
    ToggleSwitchModule,
    ReactiveFormsModule,
    TooltipModule,
    NgIcon,
    InputNumberModule,
    MenuModule,
    BadgeModule,
    AvatarModule,
    OverlayModule,
    DividerModule,
    TextareaModule,
    SelectModule,
    CardModule,
    MdlListaPersonalComponent
  ],
  viewProviders: [provideIcons({ heroQuestionMarkCircleSolid, tablerAlertCircle })],
  providers: [DialogService],
})
export class SectionResponsableListadoComponent implements OnInit, AfterViewInit, OnDestroy {

  public dialogService = inject(DialogService);
  private alertService = inject(AlertService);
  private catalogoApiService = inject(CatalogoApiService);

  private _responsables = signal<PersonalDTO[]>([]);
  @Input() set responsables(value: PersonalDTO[]) {
      if (this._responsables() !== value) {
          this._responsables.set(value);
      }
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: any | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cols!: any[];

  form: FormGroup = new FormGroup({});

  private subs = new Subscription();

  submitted = false;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      items: this.fb.array([])
    });

    /*effect(() => {
        const detalle = this._responsables();
        if(detalle.length){
          (this.form.get('items') as FormArray).clear();
          this.handlerValueDetalle(detalle);
        }
    });*/
  }

  // getters
  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get f(): any {
    return this.form.controls;
  }

  get getFormData(): number[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.items as FormArray).controls.map((element: any) => {
      return element.get('id')?.value;
    });
  }

  get valid(): boolean {
    return this.form.valid;
  }

  get invalid(): boolean {
    return this.form.invalid;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }



  // events

  evtRemoveItems(index: number): void {
    this.items.removeAt(index);
  }

  evtOnSubmit(): boolean {
    this.submitted = true;
    if (this.form.invalid) {
      this.alertService.showToast({
        position: 'top-end',
        icon: 'warning',
        title: 'Se tiene que seleccionar al menos un responsable',
        showCloseButton: true,
        timerProgressBar: true,
        timer: 4000
      });
      return false;
    }

    return true;
  }

  evtAddPersonal(): void{
    this.ref = this.dialogService.open(MdlListaPersonalComponent, {
      header: 'Seleccionar personal',
      width: '50%',
      baseZIndex: 10000,
      closable: true
    });

    this.ref.OnSelect.subscribe((data: PersonalDTO) => {
      const existe = this.getFormData.some((item: number) => item === data.id);
      if(existe){
        this.alertService.showToast({
          position: 'top-end',
          icon: 'warning',
          title: 'El personal ya se encuentra agregado',
          showCloseButton: true,
          timerProgressBar: true,
          timer: 4000
        });
        return;
      }
      this.handleNewPerson(data);
    });
  }

  // handlers

  handleNewPerson(persona: PersonalDTO): FormGroup {
    return this.fb.group({
      id: [{value: persona.id, disabled: true}],
      nombre: [ {value: `${persona.nombre}, ${persona.apellido_paterno} ${persona.apellido_materno}`, disabled: true} , Validators.required],
      cargo: [ {value: `${persona.cargo}`, disabled: true} , Validators.required],
    });
  }

}
