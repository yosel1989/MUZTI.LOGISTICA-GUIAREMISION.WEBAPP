import { AfterViewInit, Component, HostBinding, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthApiService } from '../../services/auth-api.service';
import { StorageService } from '../../../../core/services/storage.service';
import { AuthRequest, User, UserProfile } from '../../services/auth.interface';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AlertService } from 'app/core/services/alert.service';
import { environment } from 'environments/environment';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-auth',
  imports: [ 
    FormsModule, 
    ReactiveFormsModule, 
    PasswordModule, 
    InputTextModule, 
    MessageModule, 
    ToastModule,
    ButtonModule,
    CardModule
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  providers: [ MessageService]
})
export class AuthComponent implements AfterViewInit, OnDestroy{

  messageService = inject(MessageService);
  private route = inject(ActivatedRoute);

  @HostBinding('class') claseHost = 'flex w-full';

  isSubmitted = false;
  loadingSubmit = signal(false);
  frmAuth: FormGroup;

  constructor(
    private authApi: AuthApiService, 
    private fb: FormBuilder, 
    private alertService: AlertService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.frmAuth = this.fb.group({
      usuario: new FormControl(null, Validators.required),
      clave: new FormControl(null, Validators.required)
    });
  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy(): void {

  }

  // Getters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get f(): any {
    return this.frmAuth.controls;
  }

  /** Pantalla donde estaba el usuario cuando expiró su sesión (solo rutas internas). */
  get returnUrl(): string | null {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    return url?.startsWith('/') && !url.startsWith('//') ? url : null;
  }

  get formData(): AuthRequest {
    return { 
      username: this.f.usuario.value,
      password: this.f.clave.value 
    };
  }

  // Events
  evtOnSubmit(): void {

    this.isSubmitted = true;

    if(this.frmAuth.invalid) {
      this.frmAuth.markAllAsTouched();
      this.handlerOnSubmitFormInvalid();
      return;
    }

    this.loadingSubmit.set(true);

    this.authApi.login(this.formData).subscribe({
      next: (res: User) => {
        if(!res.profiles.find((x: UserProfile) => x.appId === environment.appId)){
          this.handlerOnSubmitFormError("No tienes permisos suficientes para ingresar al sistema.");
          this.loadingSubmit.set(false);
          return;
        }

        this.loadingSubmit.set(false);
        this.handlerOnSubmitSuccess(res);
      },
      error: (err: HttpErrorResponse) => {
        this.handlerOnSubmitFormError(err.error ?? "Ocurrió un error, intente nuevamente.");
        this.loadingSubmit.set(false);
      }
    });
  }

  // Handlers
  
  handlerOnSubmitSuccess(res: User): void {
    this.storageService.setToken(res.token);
    this.storageService.setRefreshToken(res.refreshToken);
    this.storageService.setUser(JSON.stringify(res));
    this.alertService.showSwalAlert({
      icon: 'success',
      title: `<span class="font-semibold">Bienvenid@ <br> ${res.firstName} ${res.lastName}</span>`,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didClose: () => {
        this.router.navigateByUrl(this.returnUrl ?? '/administracion/guia-remision');
      },
    });
  }

  handlerOnSubmitFormInvalid(): void {
    let mensaje = "";

    if (this.f['usuario'].hasError('required') && this.f['clave'].hasError('required')) {
      mensaje = "Debe ingresar el usuario y contraseña";
    }
    else if (this.f['usuario'].hasError('required')) {
      mensaje = "Debe ingresar un usuario";
    }
    else if (this.f['clave'].hasError('required')) {
      mensaje = "Debe ingresar una contraseña";
    }

    /*this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe rellenar todos los campos requeridos.', life: 3000 });*/

    this.alertService.error(mensaje);
  }

  handlerOnSubmitFormError(mensaje: string): void {
    this.alertService.error(mensaje);
  }

  hasProfile(profile: number, user: User): boolean{
    const profileIds = user?.profiles.map((x: UserProfile) => x.id);
    return profileIds?.includes(profile) ?? false;
  }

}
