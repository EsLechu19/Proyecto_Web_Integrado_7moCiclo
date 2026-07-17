import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { PedidoService } from '../../services/pedido.service';
import { ToastService } from '../../services/toast.service';
import { Spinner } from '../../shared/spinner/spinner';

declare var bootstrap: any;

@Component({
  selector: 'app-pedidos',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    Sidebar,
    Spinner
  ],

  templateUrl: './pedidos.html',

  styleUrls: ['./pedidos.css']
})

export class Pedidos implements OnInit {

  pedidos: any[] = [];
  pedidoSeleccionado: any = null;
  detallePedido: any[] = [];
  historialPedido: any[] = [];
  nuevoEstado: string = '';
  cargando = true;
  estados = ['PENDIENTE', 'EN_PROCESO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];

  constructor(
    private pedidoService: PedidoService,
    private toastService: ToastService,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle('StyloStore | Admin - Pedidos');
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando = true;
    this.pedidoService.listarPedidos().subscribe({
      next: (data: any) => {
        this.pedidos = data;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        console.log(err);
      }
    });
  }

  abrirDetalle(pedido: any) {
    this.pedidoSeleccionado = pedido;
    this.nuevoEstado = pedido.estado;

    this.pedidoService.obtenerDetalle(pedido.idPedido).subscribe({
      next: (data: any) => {
        this.detallePedido = data;
      },
      error: () => {
        this.detallePedido = [];
      }
    });

    this.pedidoService.obtenerHistorial(pedido.idPedido).subscribe({
      next: (data: any) => {
        this.historialPedido = data;
      },
      error: () => {
        this.historialPedido = [];
      }
    });

    const modal = new bootstrap.Modal(document.getElementById('detallePedidoModal'));
    modal.show();
  }

  actualizarEstado() {
    if (!this.pedidoSeleccionado || !this.nuevoEstado) return;

    this.pedidoService.actualizarEstado(this.pedidoSeleccionado.idPedido, this.nuevoEstado).subscribe({
      next: () => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('detallePedidoModal'));
        modal?.hide();
        this.toastService.success('Estado actualizado correctamente');
        this.cargarPedidos();
      },
      error: (err) => {
        this.toastService.error(err.error?.mensaje || 'Error al actualizar el estado');
        console.log(err);
      }
    });
  }

}
