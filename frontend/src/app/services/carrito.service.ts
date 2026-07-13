import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class CarritoService {

  private api =
    `${environment.apiUrl}/api/carrito`;

  private cantidadSource =
    new BehaviorSubject<number>(0);

  cantidad$ =
    this.cantidadSource.asObservable();

  constructor(
    private http: HttpClient
  ) {}

  private refreshSource =
    new Subject<void>();

  refresh$ =
    this.refreshSource.asObservable();

  forzarRefresh() {
    this.refreshSource.next();
  }

  actualizarCantidad(cantidad: number) {
    this.cantidadSource.next(cantidad);
  }

  obtenerCantidadActual() {
    return this.cantidadSource.value;
  }

  private obtenerHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  obtenerCarrito(idUsuario: number) {
    return this.http.get(
      `${this.api}/${idUsuario}`,
      this.obtenerHeaders()
    );
  }

  agregarProducto(idUsuario: number, idProducto: number, cantidad: number, talla?: string) {
    let url = `${this.api}/agregar?idUsuario=${idUsuario}&idProducto=${idProducto}&cantidad=${cantidad}`;
    if (talla) url += `&talla=${talla}`;
    return this.http.post(url, {}, this.obtenerHeaders());
  }

  actualizarCantidadBD(idDetalle: number, cantidad: number) {
    return this.http.put(
      `${this.api}/actualizar?idDetalle=${idDetalle}&cantidad=${cantidad}`,
      {},
      this.obtenerHeaders()
    );
  }

  eliminarItem(idDetalle: number) {
    return this.http.delete(
      `${this.api}/eliminar/${idDetalle}`,
      this.obtenerHeaders()
    );
  }

  // ========================================
  // CARRITO LOCAL (invitado)
  // ========================================

  getCarritoLocal(): any[] {
    return JSON.parse(localStorage.getItem('carritoTemp') || '[]');
  }

  saveCarritoLocal(carrito: any[]) {
    localStorage.setItem('carritoTemp', JSON.stringify(carrito));
  }

  agregarProductoLocal(producto: any, cantidad: number, talla?: string): any[] {
    const carrito = this.getCarritoLocal();
    const existe = carrito.find(
      (item: any) => item.producto.idProducto === producto.idProducto && item.talla === (talla || '')
    );

    if (existe) {
      const stockDisp = this.stockTallaLocal(producto, existe.talla);
      if (existe.cantidad >= stockDisp) return carrito;
      existe.cantidad += cantidad;
    } else {
      carrito.push({ producto, cantidad, talla: talla || '' });
    }

    this.saveCarritoLocal(carrito);
    const totalItems = this.calcularCantidad(carrito);
    this.actualizarCantidad(totalItems);
    return carrito;
  }

  private stockTallaLocal(producto: any, talla: string): number {
    if (talla && producto.tallas && producto.tallas.length > 0) {
      const t = producto.tallas.find((t: any) => t.talla === talla);
      if (t) return t.stock;
    }
    return 0;
  }

  eliminarProductoLocal(idProducto: number): any[] {
    let carrito = this.getCarritoLocal();
    const item = carrito.find((x: any) => x.producto.idProducto === idProducto);
    const restar = item?.cantidad || 0;
    carrito = carrito.filter((x: any) => x.producto.idProducto !== idProducto);
    this.saveCarritoLocal(carrito);
    this.actualizarCantidad(Math.max(0, this.obtenerCantidadActual() - restar));
    return carrito;
  }

  limpiarCarritoLocal() {
    localStorage.removeItem('carritoTemp');
    this.actualizarCantidad(0);
  }

  // ========================================
  // UTILIDADES
  // ========================================

  calcularTotal(items: any[]): number {
    return items.reduce(
      (sum, item) => sum + (item.producto?.precio ?? 0) * item.cantidad,
      0
    );
  }

  calcularCantidad(items: any[]): number {
    return items.reduce((sum, item) => sum + item.cantidad, 0);
  }

}
