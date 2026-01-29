// src/app/shared/services/alert.service.ts
import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { ToastrService  } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private hotToast: ToastrService){

  }

  showSwalAlert(options: SweetAlertOptions): any {
    return Swal.fire({
        ...options,
      background: 'bg-white!',
      customClass: {
        popup: ['bg-white!', 'text-gray-900', 'dark:text-white', 'rounded-xl!', 'p-6', 'border-1!'],
        title: ['text-gray-900', 'dark:text-white', 'text-lg'],
        confirmButton: ['bg-blue-600', 'text-gray-900', 'dark:text-white', 'px-4', 'py-2', 'rounded'],
        timerProgressBar: ['bg-gray-400!']
      },
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
        popup: ['bg-white!', 'text-gray-900', 'dark:text-white', 'rounded-xl!', 'px-6', 'py-3!', 'border-2!', 'border-gray-300!'],
        title: ['text-gray-900', 'dark:text-white', 'text-[14px]!', 'font-semibold!'],
        confirmButton: ['bg-blue-600', 'text-gray-900', 'dark:text-white', 'px-4', 'py-2', 'rounded'],
        timerProgressBar: ['bg-blue-400']
      },
    });
  }

  showHotToast(title: string | undefined, message:string | undefined, type: 'success' | 'error' | 'info' | 'warning' = 'success', options: {}) 
  { 
    switch (type) { 
      case 'success': 
        this.hotToast.success(title, message, {timeOut: 99999}); 
        break; 
      case 'error': 
        this.hotToast.error(title, message, {timeOut: 99999}); 
        break; 
      case 'info': 
        this.hotToast.info(title, message, {timeOut: 99999}); 
        break; 
      case 'warning': 
        this.hotToast.warning(title, message, {timeOut: 99999}); 
        break; 
    } 
  }

}
