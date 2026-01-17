import { AfterViewInit, Component, HostBinding, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerLoader2 } from '@ng-icons/tabler-icons';
import { AuthApiService } from '../../services/auth-api.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { StorageService } from '../../../../core/services/storage.service';
import { AuthRequest, User } from '../../services/auth.interface';

@Component({
  selector: 'app-auth',
  imports: [NgIcon, FormsModule, ReactiveFormsModule, PasswordModule, InputTextModule, MessageModule, ToastModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  viewProviders: [provideIcons({ tablerLoader2 })],
  providers: [ MessageService]
})
export class AuthComponent implements AfterViewInit, OnDestroy{

  messageService = inject(MessageService);

  @HostBinding('class') claseHost = 'flex w-full';

  isSubmitted = false;
  loadingSubmit: boolean = false;
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
  get f(): any {
    return this.frmAuth.controls;
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

    this.loadingSubmit = true;

    this.authApi.login(this.formData).subscribe({
      next: (res: User) => {
        if(!res.profiles.find((x: any) => x.appId === 37)){
          this.handlerOnSubmitFormError("No tienes permisos suficientes para ingresar al sistema.");
          this.loadingSubmit = false;
          return;
        }

        this.loadingSubmit = false;
        this.handlerOnSubmitSuccess(res);
      },
      error: (err: any) => {
        this.handlerOnSubmitFormError(err.error ?? "Ocurrió un error, intente nuevamente.");
        this.loadingSubmit = false;
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
      title: `<span class="font-bold">Bienvenid@ <br> ${res.firstName} ${res.lastName}</span>`,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didClose: () => {
        if(this.hasProfile(1255, res)) // Charity
        {
          this.router.navigate(['/admin/report/orders']);
        }else{
          this.router.navigate(['/admin/dashboard']);
        }
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

    this.alertService.showToast({
      position: 'bottom-end',
      icon: "error",
      title: mensaje,
      showCloseButton: true,
      timerProgressBar: true
    });
  }

  handlerOnSubmitFormError(mensaje: string): void {
    this.alertService.showToast({
      position: 'bottom-end',
      icon: "error",
      title: mensaje,
      showCloseButton: true,
      timerProgressBar: true,
    });
  }

  hasProfile(profile: number, user: User): boolean{
    const profileIds = user?.profiles.map((x: any) => x.id);
    return profileIds?.includes(profile) ?? false;
  }

}
