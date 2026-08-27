import { DatePipe } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { AlertService } from './alert.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  private alertService = inject(AlertService);
  private breakpointObserver = inject(BreakpointObserver);

  private datePipe = new DatePipe('en-US')

  dateFormat(stringDateISO: string, format: string, locale: string = 'es-PE'): any {
    return this.datePipe.transform(stringDateISO, format, undefined, locale) || '';
  }

  copy(body?: string, message?: string): void{
    navigator.clipboard.writeText(body || '').then(() => {
      this.alertService.showToast({ icon: 'success', title: message || 'Copiado al portapapeles', position: "top-end" });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromArray(numItems: number): Array<any>{
    return Array.from({ length: numItems });
  }

  isMobile(): boolean {
    return this.breakpointObserver.isMatched([
      Breakpoints.Handset,
      Breakpoints.Small
    ]);
  }
}
