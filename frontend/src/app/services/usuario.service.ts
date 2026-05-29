import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class UsuarioService {

  private api = 'http://localhost:8080/api/usuarios';

  constructor(
    private http: HttpClient
  ) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  listarUsuarios() {
    return this.http.get(this.api, this.getHeaders());
  }

  eliminarUsuario(id: number) {
    return this.http.delete(
      `${this.api}/${id}`,
      this.getHeaders()
    );
  }

  actualizarUsuario(id: number, usuario: any) {
    return this.http.put(
      `${this.api}/${id}`,
      usuario,
      this.getHeaders()
    );
  }

}
