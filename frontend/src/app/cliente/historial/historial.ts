import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { PedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Spinner } from '../../shared/spinner/spinner';

declare var bootstrap: any;

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [
    CommonModule,
    Spinner
  ],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class Historial implements OnInit {

  iconoEstado(estado: string): string {
    const mapa: Record<string, string> = {
      'PENDIENTE': 'bi-clock',
      'EN_PROCESO': 'bi-gear',
      'ENVIADO': 'bi-truck',
      'ENTREGADO': 'bi-check-circle',
      'CANCELADO': 'bi-x-circle'
    };
    return mapa[estado] || 'bi-question';
  }

  pedidos: any[] = [];
  pedidoSeleccionado: any = null;
  detallePedido: any[] = [];
  cargando = false;

  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle('StyloStore | Historial de Pedidos');
    this.cargarHistorial();
  }

  cargarHistorial() {
    const idUsuario = this.authService.obtenerIdUsuario();

    if (!idUsuario) {
      return;
    }

    this.cargando = true;
    this.pedidoService
      .historial(idUsuario)
      .subscribe({
        next: (data: any) => {
          this.pedidos = data;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.cargando = false;
          console.log(err);
        }
      });
  }

  abrirDetalle(pedido: any) {
    this.pedidoSeleccionado = pedido;

    this.pedidoService.obtenerDetalle(pedido.idPedido).subscribe({
      next: (data: any) => {
        this.detallePedido = data;
      },
      error: () => {
        this.detallePedido = [];
      }
    });

    const modal = new bootstrap.Modal(document.getElementById('detalleHistorialModal'));
    modal.show();
  }

  cancelarPedido(pedido: any) {
    if (!confirm('¿Estás seguro de cancelar este pedido?')) return;

    this.pedidoService.actualizarEstado(pedido.idPedido, 'CANCELADO').subscribe({
      next: () => {
        this.toastService.success('Pedido cancelado correctamente');
        this.cargarHistorial();
      },
      error: (err) => {
        this.toastService.error(err.error?.mensaje || 'Error al cancelar el pedido');
        console.log(err);
      }
    });
  }

}
