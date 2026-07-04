import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Sidebar } from '../../shared/sidebar/sidebar';

import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';
import { ToastService } from '../../services/toast.service';

declare var bootstrap: any;

@Component({
  selector: 'app-productos-admin',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    Sidebar
  ],

  templateUrl: './productosAdmin.html',

  styleUrls: ['./productosAdmin.css']
})

export class ProductosAdmin implements OnInit {

  productos: any[] = [];

  categorias: any[] = [];

  productoSeleccionado: any = { categoria: { idCategoria: 1 }, tallas: [], imagenes: '' };
  imagenUrls: string[] = [];

  modal: any;

  modalVer: any;

  cargando = false;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle('StyloStore | Admin - Productos');
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarCategorias() {

    this.categoriaService
      .listarCategorias()
      .subscribe({
        next: (data: any) => {
          this.categorias = data;
        },
        error: (err) => {
          console.log(err);
        }
      });

  }

  // =========================
  // LISTAR PRODUCTOS
  // =========================

  cargarProductos() {

    this.productoService
      .listarProductos()
      .subscribe({

        next: (data: any) => {
          this.productos = data;
          setTimeout(() => this.cdr.detectChanges());
        },

        error: (err) => {
          console.log(err);
        }

      });

  }

  // =========================
  // ABRIR MODAL CREAR / EDITAR
  // =========================

  abrirModal(producto?: any) {

    if (producto) {
      this.productoSeleccionado = {
        ...producto,
        tallas: producto.tallas ? producto.tallas.map((t: any) => ({ ...t })) : [],
        categoria: {
          idCategoria:
            producto.categoria?.idCategoria || 1
        },
        imagenes: producto.imagenes || ''
      };
      this.imagenUrls = this.obtenerArrayImagenes(producto.imagenes);
    }

    else {

      this.productoSeleccionado = {
        nombre: '',
        descripcion: '',
        precio: 0,
        color: '',
        genero: 'UNISEX',
        imagenes: '',
        tallas: [{ talla: '', stock: 0 }],
        categoria: {
          idCategoria: 1
        }
      };
      this.imagenUrls = [''];

    }

    this.modal = new bootstrap.Modal(
      document.getElementById('productoModal')
    );

    this.modal.show();

  }

  // =========================
  // GESTION DE TALLAS
  // =========================

  agregarTalla() {
    this.productoSeleccionado.tallas.push({ talla: '', stock: 0 });
  }

  eliminarTalla(index: number) {
    if (this.productoSeleccionado.tallas.length <= 1) {
      this.toastService.warning('Debe haber al menos una talla');
      return;
    }
    this.productoSeleccionado.tallas.splice(index, 1);
  }

  obtenerArrayImagenes(imagenes: string): string[] {
    if (!imagenes) return [];
    try {
      const parsed = JSON.parse(imagenes);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  agregarImagen() {
    this.imagenUrls.push('');
  }

  eliminarImagen(index: number) {
    if (this.imagenUrls.length <= 1) {
      this.toastService.warning('Debe haber al menos una imagen');
      return;
    }
    this.imagenUrls.splice(index, 1);
  }

  // =========================
  // GUARDAR PRODUCTO
  // =========================

  guardarProducto() {

    if (!this.productoSeleccionado.nombre) {
      this.toastService.warning('Ingrese nombre');
      return;
    }

    if (this.productoSeleccionado.precio === null || this.productoSeleccionado.precio === undefined) {
      this.toastService.warning('Ingrese precio');
      return;
    }

    const tallasValidas = this.productoSeleccionado.tallas?.filter((t: any) => t.talla?.trim() && t.stock >= 0);
    if (!tallasValidas || tallasValidas.length === 0) {
      this.toastService.warning('Agregue al menos una talla con stock');
      return;
    }

    this.productoSeleccionado.tallas = tallasValidas;
    this.productoSeleccionado.imagenes = this.imagenUrls.filter(u => u.trim()).length > 0
      ? JSON.stringify(this.imagenUrls.filter(u => u.trim()))
      : null;

    if (this.productoSeleccionado.idProducto) {

      this.productoService
        .actualizarProducto(

          this.productoSeleccionado.idProducto,

          this.productoSeleccionado

        )
        .subscribe({

          next: () => {

            this.cargarProductos();

            this.modal.hide();
            this.toastService.success('Producto actualizado');

          },

          error: (err) => {

            console.log(err);

          }

        });

    }

    else {

      this.productoService
        .crearProducto(this.productoSeleccionado)
        .subscribe({

          next: () => {

            this.cargarProductos();

            this.modal.hide();
            this.toastService.success('Producto creado');

          },

          error: (err) => {

            console.log(err);

          }

        });

    }

  }

  // =========================
  // ELIMINAR
  // =========================

  eliminarProducto(id: number) {

    if (!confirm('¿Eliminar producto?')) {
      return;
    }

    this.productoService
      .eliminarProducto(id)
      .subscribe({

        next: () => {

          this.productos = this.productos.filter(
            p => p.idProducto !== id
          );

          this.cdr.detectChanges();
          this.toastService.success('Producto eliminado');

        },

        error: (err) => {

          console.log(err);

        }

      });

  }

  // =========================
  // STOCK TOTAL
  // =========================

  stockTotal(producto: any): number {
    if (producto.tallas && producto.tallas.length > 0) {
      return producto.tallas.reduce((sum: number, t: any) => sum + t.stock, 0);
    }
    return 0;
  }

  // =========================
  // VER PRODUCTO
  // =========================

  verProducto(producto: any) {

    this.productoSeleccionado = producto;

    this.modalVer = new bootstrap.Modal(
      document.getElementById('verProductoModal')
    );

    this.modalVer.show();

  }

}