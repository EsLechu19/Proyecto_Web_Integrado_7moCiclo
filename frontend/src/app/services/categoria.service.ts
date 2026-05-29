import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private api = 'http://localhost:8080/api/categorias';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  listarCategorias() {
    return this.http.get(this.api);
  }

  obtenerCategoria(id: number) {
    return this.http.get(`${this.api}/${id}`);
  }

  crearCategoria(categoria: any) {
    return this.http.post(this.api, categoria, this.getHeaders());
  }

  actualizarCategoria(id: number, categoria: any) {
    return this.http.put(`${this.api}/${id}`, categoria, this.getHeaders());
  }

  eliminarCategoria(id: number) {
    return this.http.delete(`${this.api}/${id}`, this.getHeaders());
  }
}
