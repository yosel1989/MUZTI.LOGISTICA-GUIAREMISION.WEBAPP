// src/app/shared/services/alert.service.ts
import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  showSwalAlert(options: SweetAlertOptions): any {
    return Swal.fire({
        ...options,
      customClass: {
        popup: ['text-gray-900', 'dark:text-white', 'p-6', 'p-card'],
        title: ['text-gray-900', 'dark:text-white', 'text-lg'],
        confirmButton: ['p-button', 'bg-primary'],
        cancelButton: ['p-button', 'p-button-secondary', 'ml-2'],
        timerProgressBar: ['bg-primary!'],
      },
      backdrop: ` rgba(0,0,0,0.4) left top no-repeat `
    });
  }

  showToast(options: SweetAlertOptions): any {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });

    return Toast.fire({
      ...options,
      background: 'var(--card)',
      customClass: {
        popup: ['bg-[--card]!', 'text-gray-900', 'dark:text-white', 'rounded-xl!', 'p-6', 'border-1!'],
        title: ['text-gray-900', 'dark:text-white', 'text-lg'],
        confirmButton: ['bg-blue-600', 'text-gray-900', 'dark:text-white', 'px-4', 'py-2', 'rounded'],
        timerProgressBar: ['bg-blue-400']
      },
    });
  }

}
