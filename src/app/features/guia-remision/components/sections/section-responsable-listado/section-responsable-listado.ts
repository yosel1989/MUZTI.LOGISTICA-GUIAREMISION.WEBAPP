import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  signal,
  Input,
  inject
} from '@angular/core';
import {
  FormGroup
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { TableModule } from 'primeng/table';
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
import { PersonalDTO } from '@features/personal/models/personal.model';
import { MdlListaPersonalComponent } from '@features/personal/components/modals/mdl-lista-personal/mdl-lista-personal';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-section-responsable-listado',
  templateUrl: './section-responsable-listado.html',
  styleUrls: ['./section-responsable-listado.scss'],
  imports: [
    ButtonModule,
    RatingModule,
    TableModule,
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
    ConfirmDialogModule
  ],
  viewProviders: [provideIcons({ heroQuestionMarkCircleSolid, tablerAlertCircle })],
  providers: [DialogService, ConfirmationService],
})
export class SectionResponsableListadoComponent implements OnInit, AfterViewInit, OnDestroy {

  public dialogService = inject(DialogService);
  private alertService = inject(AlertService);
  private confirmationService = inject(ConfirmationService);

  private _responsables = signal<PersonalDTO[]>([]);
  @Input() set responsables(value: PersonalDTO[]) {
      if (this._responsables() !== value) {
          this._responsables.set(value);
      }
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: any | undefined;

  form: FormGroup = new FormGroup({});

  private subs = new Subscription();

  submitted = false;

  items = signal<PersonalDTO[]>([]);

  get getFormData(): PersonalDTO[] {
    return this.items();
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
    this.confirmationService.confirm({
        header: '¿Desea remover el responsable seleccionado?',
        message: 'Confirmar la operación.',
        accept: () => {
          this.items.set(this.items().filter((_, i) => i !== index));
        },
    });
  }

  evtOnSubmit(): boolean {
    this.submitted = true;
    if(this.items().length === 0){
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
      width: '50%',
      keepInViewport: false,
      closable: true,
      modal: true,
      draggable: false,
      position: 'top',
      header: 'Seleccionar personal',
      styleClass: 'max-h-none!',
      maskStyleClass: 'py-4',
      contentStyle: {
          'padding': "0 !important"
      },
      appendTo: 'body',
    });

    const sub = this.ref.onChildComponentLoaded.subscribe((cmp: MdlListaPersonalComponent) => {
      const sub2 = cmp?.OnSelect.subscribe((data: PersonalDTO) => {
        const existe = this.items().some((item: PersonalDTO) => item.id === data.id);
        if(existe){
          this.alertService.showToast({
            position: 'top-end',
            icon: 'warning',
            title: 'El personal ya se encuentra agregado',
            showCloseButton: true,
            timerProgressBar: true,
            timer: 4000,
            target: 'body'
          });
          return;
        }
        this.handleNewPerson(data);
        this.ref.close();
      });
      const sub3 = cmp?.OnClose.subscribe(() => {
        this.ref?.close();
      });
      this.subs.add(sub2);
      this.subs.add(sub3);
    });
    
    this.subs.add(sub);
  }

  // handlers

  handleNewPerson(persona: PersonalDTO): void{
    this.items.set([...this.items(), persona]);
  }

}
