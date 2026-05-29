import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  mensaje: string;
  tipo: 'success' | 'error' | 'warning' | 'info';
  duracion?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  toast$ = this.toastSubject.asObservable();

  mostrar(mensaje: string, tipo: Toast['tipo'] = 'info', duracion = 4000) {
    this.toastSubject.next({ mensaje, tipo, duracion });
  }

  success(mensaje: string) { this.mostrar(mensaje, 'success'); }
  error(mensaje: string) { this.mostrar(mensaje, 'error'); }
  warning(mensaje: string) { this.mostrar(mensaje, 'warning'); }
  info(mensaje: string) { this.mostrar(mensaje, 'info'); }
}
