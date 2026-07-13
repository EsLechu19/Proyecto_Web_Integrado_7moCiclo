import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ProductoService {

  private api = `${environment.apiUrl}/api/productos`;

  constructor(
    private http: HttpClient
  ) { }

  private getHeaders() {

    const token = localStorage.getItem('token');

    return {

      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })

    };

  }

  // LISTAR

  listarProductos() {

    return this.http.get(this.api);

  }

  // OBTENER POR ID

  obtenerProducto(id: number) {

    return this.http.get(
      `${this.api}/${id}`
    );

  }

  // BUSCAR

  buscar(nombre: string) {

    return this.http.get(
      `${this.api}/buscar?nombre=${nombre}`
    );

  }

  // CREAR

  crearProducto(producto: any) {

    return this.http.post(
      this.api,
      producto,
      this.getHeaders()
    );

  }

  // ACTUALIZAR

  actualizarProducto(id: number, producto: any) {

    return this.http.put(
      `${this.api}/${id}`,
      producto,
      this.getHeaders()
    );

  }

  // ELIMINAR

  eliminarProducto(id: number) {

    return this.http.delete(
      `${this.api}/${id}`,
      this.getHeaders()
    );

  }

  // LISTAR POR CATEGORIA

  listarPorCategoria(idCategoria: number) {

    return this.http.get(
      `${this.api}/categoria/${idCategoria}`
    );

  }

  // FILTRAR POR GENERO

  filtrarPorGenero(genero: string) {

    return this.http.get(
      `${this.api}/genero?genero=${genero}`
    );

  }

  // FILTRAR POR GENERO Y CATEGORIA

  filtrarPorGeneroYCategoria(genero: string, categoriaId: number) {

    return this.http.get(
      `${this.api}/genero/${genero}/categoria/${categoriaId}`
    );

  }

  listarUltimosPorGenero(genero: string) {
    return this.http.get(`${this.api}/ultimos/genero?genero=${genero}`);
  }

  listarUltimosPorCategoria(idCategoria: number) {
    return this.http.get(`${this.api}/ultimos/categoria/${idCategoria}`);
  }

  listarConFiltros(params: any) {
    const query = new URLSearchParams(params).toString();
    return this.http.get(`${this.api}/filtrar?${query}`);
  }

  obtenerDestacados(limite: number = 4) {
    return this.http.get(`${this.api}/top?limite=${limite}`);
  }

}