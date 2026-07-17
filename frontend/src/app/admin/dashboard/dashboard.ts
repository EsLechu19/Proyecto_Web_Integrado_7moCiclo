import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { Spinner } from '../../shared/spinner/spinner';

import { ProductoService } from '../../services/producto.service';
import { UsuarioService } from '../../services/usuario.service';
import { CategoriaService } from '../../services/categoria.service';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    Sidebar,
    Spinner
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  totalProductos = 0;
  totalUsuarios = 0;
  totalCategorias = 0;
  totalPedidos = 0;
  cargando = true;

  productosPorCategoria: { nombre: string; cantidad: number; color: string }[] = [];
  pedidosPorEstado: { estado: string; cantidad: number; color: string }[] = [];
  productosTop: any[] = [];
  productosCriticos: any[] = [];

  readonly colores = ['#e94560', '#53d8fb', '#e9c46a', '#a855f7', '#22c55e', '#f97316', '#06b6d4', '#ec4899'];

  constructor(
    private productoService: ProductoService,
    private usuarioService: UsuarioService,
    private categoriaService: CategoriaService,
    private pedidoService: PedidoService,
    private cdr: ChangeDetectorRef,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle('StyloStore | Admin - Dashboard');
    this.cargarConteos();
  }

  get totalVendidos(): number {
    return this.pedidosPorEstado.reduce((s, p) => s + p.cantidad, 0);
  }

  cargarConteos() {
    this.cargando = true;

    this.productoService.listarProductos().subscribe({
      next: (data: any) => {
        this.totalProductos = data.length;
        const calcStock = (p: any) => p.tallas?.reduce((s: number, t: any) => s + (t.stock || 0), 0) ?? 0;
        this.productosTop = [...data].sort((a, b) => calcStock(b) - calcStock(a)).slice(0, 5);
        this.productosCriticos = data.filter((p: any) => p.tallas?.some((t: any) => t.stock < 5)).sort((a: any, b: any) => {
          const minA = Math.min(...(a.tallas?.map((t: any) => t.stock) || [0]));
          const minB = Math.min(...(b.tallas?.map((t: any) => t.stock) || [0]));
          return minA - minB;
        });

        const mapa = new Map<string, number>();
        data.forEach((p: any) => {
          const nom = p.categoria?.nombre || 'Sin categoría';
          mapa.set(nom, (mapa.get(nom) || 0) + 1);
        });
        this.productosPorCategoria = Array.from(mapa.entries()).map(([nombre, cantidad], i) => ({
          nombre, cantidad, color: this.colores[i % this.colores.length]
        }));
        this.cdr.detectChanges();
      }
    });

    this.usuarioService.listarUsuarios().subscribe({
      next: (data: any) => {
        this.totalUsuarios = data.length;
        this.cdr.detectChanges();
      }
    });

    this.categoriaService.listarCategorias().subscribe({
      next: (data: any) => {
        this.totalCategorias = data.length;
        this.cdr.detectChanges();
      }
    });

    this.pedidoService.listarPedidos().subscribe({
      next: (data: any) => {
        this.totalPedidos = data.length;
        const mapa = new Map<string, number>();
        data.forEach((p: any) => {
          const est = p.estado || 'PENDIENTE';
          mapa.set(est, (mapa.get(est) || 0) + 1);
        });
        const coloresEstado: Record<string, string> = {
          PENDIENTE: '#eab308', EN_PROCESO: '#3b82f6', ENVIADO: '#8b5cf6',
          ENTREGADO: '#22c55e', CANCELADO: '#ef4444'
        };
        this.pedidosPorEstado = Array.from(mapa.entries()).map(([estado, cantidad]) => ({
          estado, cantidad, color: coloresEstado[estado] || '#64748b'
        }));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  stockTotal(p: any): number {
    return p.tallas?.reduce((s: number, t: any) => s + (t.stock || 0), 0) ?? 0;
  }

  get donutGradient(): string {
    if (this.pedidosPorEstado.length === 0) return '';
    const total = this.pedidosPorEstado.reduce((s, p) => s + p.cantidad, 0);
    if (total === 0) return '';
    let acum = 0;
    return this.pedidosPorEstado.map(p => {
      const pct = (p.cantidad / total) * 100;
      const start = acum;
      const end = acum + pct;
      acum = end;
      return `${p.color} ${start}% ${end}%`;
    }).join(', ');
  }

}
