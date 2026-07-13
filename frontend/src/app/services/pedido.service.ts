import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private api = `${environment.apiUrl}/api/pedidos`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  historial(idUsuario: number) {
    return this.http.get(
      `${this.api}/usuario/${idUsuario}`,
      this.getHeaders()
    );
  }

  confirmarPedido(idUsuario: number) {
    return this.http.post(
      `${this.api}/confirmar/${idUsuario}`,
      {},
      this.getHeaders()
    );
  }

  listarPedidos() {
    return this.http.get(
      this.api,
      this.getHeaders()
    );
  }

  obtenerDetalle(idPedido: number) {
    return this.http.get(
      `${this.api}/${idPedido}/detalle`,
      this.getHeaders()
    );
  }

  actualizarEstado(idPedido: number, estado: string) {
    return this.http.put(
      `${this.api}/${idPedido}/estado?estado=${estado}`,
      {},
      this.getHeaders()
    );
  }

}
