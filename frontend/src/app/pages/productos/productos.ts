import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';
import { ProductCard } from '../../shared/product-card/product-card';
import { Spinner } from '../../shared/spinner/spinner';
import { Paginator } from '../../shared/paginator/paginator';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCard,
    Spinner,
    Paginator
  ],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css'],
})
export class Productos implements OnInit {
  productos: any[] = [];
  categorias: any[] = [];
  busqueda = '';
  filtroGenero = '';
  filtroCategoria = '';
  cargando = true;

  paginaActual = 1;
  elementosPorPagina = 12;

  get productosPagina() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    return this.productos.slice(inicio, inicio + this.elementosPorPagina);
  }

  get totalPaginas() {
    return Math.max(1, Math.ceil(this.productos.length / this.elementosPorPagina));
  }

  get tituloCatalogo(): string {
    if (this.filtroCategoria) {
      const cat = this.categorias.find(c => String(c.idCategoria) === this.filtroCategoria);
      if (cat) return `Catálogo de ${cat.nombre}`;
    }
    if (this.filtroGenero === 'HOMBRE') return 'Catálogo de Hombre';
    if (this.filtroGenero === 'MUJER') return 'Catálogo de Mujer';
    if (this.filtroGenero === 'UNISEX') return 'Catálogo de Unisex';
    return 'Catálogo';
  }

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoriaService.listarCategorias().subscribe((data: any) => {
      this.categorias = data;
    });

    this.route.queryParams.subscribe((params) => {
      const genero = params['genero'] || '';
      const categoria = params['categoria'] || '';
      const busqueda = params['busqueda'] || '';

      this.filtroGenero = genero;
      this.filtroCategoria = categoria;
      this.busqueda = busqueda;
      this.paginaActual = 1;
      this.listarProductos();
    });
  }

  listarProductos() {
    this.cargando = true;
    const params: any = {};

    if (this.busqueda) params.busqueda = this.busqueda;
    if (this.filtroGenero) params.genero = this.filtroGenero;
    if (this.filtroCategoria) params.categoria = this.filtroCategoria;

    this.productoService.listarConFiltros(params).subscribe({
      next: (data: any) => {
        this.productos = data;
        this.cargando = false;
      },
      error: () => {
        this.productos = [];
        this.cargando = false;
      }
    });
  }

  String(value: any): string {
    return String(value);
  }

  aplicarFiltros() {
    const queryParams: any = {};
    if (this.filtroGenero) queryParams.genero = this.filtroGenero;
    if (this.filtroCategoria) queryParams.categoria = this.filtroCategoria;
    if (this.busqueda) queryParams.busqueda = this.busqueda;
    this.router.navigate(['/productos'], { queryParams });
  }

  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
