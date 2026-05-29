import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginator.html',
  styleUrls: ['./paginator.css']
})
export class Paginator {
  @Input() paginaActual = 1;
  @Input() totalPaginas = 1;
  @Output() cambioPagina = new EventEmitter<number>();

  get paginas(): number[] {
    const rango: number[] = [];
    const inicio = Math.max(1, this.paginaActual - 2);
    const fin = Math.min(this.totalPaginas, this.paginaActual + 2);
    for (let i = inicio; i <= fin; i++) {
      rango.push(i);
    }
    return rango;
  }

  irAPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.cambioPagina.emit(pagina);
  }
}
