import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class AuthService {

  private api =
    `${environment.apiUrl}/api/auth`;

  // ESTADO REACTIVO LOGIN

  private loggedIn =
    new BehaviorSubject<boolean>(
      this.estaLogueado()
    );

  public loggedIn$ =
    this.loggedIn.asObservable();

  constructor(
    private http: HttpClient
  ) {}

  // LOGIN

  login(data: any) {

    return this.http.post(
      `${this.api}/login`,
      data
    );

  }

  // GUARDAR SESIÓN

  guardarSesion(response: any) {

    console.log(
      'LOGIN RESPONSE:',
      response
    );

    // TOKEN

    localStorage.setItem(
      'token',
      response.token
    );

    // ROL

    localStorage.setItem(
      'rol',
      response.rol
    );

    // USUARIO

    const usuario = {

      idUsuario:

        response.usuario?.idUsuario ||

        response.idUsuario ||

        0,

      nombre:

        response.usuario?.nombre ||

        response.nombre ||

        '',

      correo:

        response.usuario?.correo ||

        response.correo ||

        ''

    };

    localStorage.setItem(
      'usuario',
      JSON.stringify(usuario)
    );

    // LOGIN TRUE

    this.loggedIn.next(true);

  }

  // REGISTRO

  registrar(data: any) {

    return this.http.post(

      `${environment.apiUrl}/api/usuarios/registro`,

      data

    );

  }

  // ROL

  obtenerRol(): string {

    return localStorage.getItem('rol') || '';

  }

  // VALIDAR LOGIN

  estaLogueado(): boolean {

    const token =
      localStorage.getItem('token');

    return !!token;

  }

  // LOGIN REACTIVO

  isLoggedIn(): boolean {

    return this.loggedIn.value;

  }

  // OBTENER USUARIO

  obtenerUsuario() {

    return JSON.parse(

      localStorage.getItem('usuario') || '{}'

    );

  }

  // NOMBRE USUARIO

  getUserName(): string {

    const usuario =
      this.obtenerUsuario();

    return usuario.nombre || '';

  }

  // CORREO USUARIO

  getUserEmail(): string {

    const usuario =
      this.obtenerUsuario();

    return usuario.correo || '';

  }

  // ID USUARIO

  obtenerIdUsuario(): number {

    const usuario =
      this.obtenerUsuario();

    return Number(usuario.idUsuario) || 0;

  }

  // TOKEN

  obtenerToken(): string {

    return localStorage.getItem('token') || '';

  }

  // LOGOUT

  logout() {

    // ELIMINAR SOLO SESIÓN

    localStorage.removeItem('token');

    localStorage.removeItem('rol');

    localStorage.removeItem('usuario');

    // CAMBIAR ESTADO

    this.loggedIn.next(false);

  }

}