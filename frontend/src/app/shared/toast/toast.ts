import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrls: ['./toast.css']
})
export class ToastComponent implements OnInit {
  toasts: (Toast & { id: number })[] = [];
  private counter = 0;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toast$.subscribe(toast => {
      const id = ++this.counter;
      this.toasts.push({ ...toast, id });
      setTimeout(() => this.remover(id), toast.duracion || 4000);
    });
  }

  remover(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  claseTipo(tipo: Toast['tipo']): string {
    const mapa: Record<string, string> = {
      success: 'bg-success text-white',
      error: 'bg-danger text-white',
      warning: 'bg-warning text-dark',
      info: 'bg-info text-white'
    };
    return mapa[tipo] || 'bg-info text-white';
  }
}
