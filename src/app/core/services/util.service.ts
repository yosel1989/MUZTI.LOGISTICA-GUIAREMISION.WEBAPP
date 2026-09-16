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

  lightenColor(hex: string, percent: number = 20): string {
    // Quitar el #
    hex = hex.replace(/^#/, "");

    // Convertir a valores RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Mezclar con blanco según el porcentaje
    r = Math.round(r + (255 - r) * (percent / 100));
    g = Math.round(g + (255 - g) * (percent / 100));
    b = Math.round(b + (255 - b) * (percent / 100));

    // Convertir a hex
    const toHex = (x: number) => x.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
