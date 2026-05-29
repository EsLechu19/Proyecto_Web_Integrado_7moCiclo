import { Component } from '@angular/core';

import {
  Router,
  RouterOutlet
} from '@angular/router';

import { CommonModule } from '@angular/common';

import { Navbar } from './shared/navbar/navbar';

import { Footer } from './shared/footer/footer';

import { Login } from './auth/login/login';

import { Register } from './auth/register/register';

import { ToastComponent } from './shared/toast/toast';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',

  standalone: true,

  imports: [
    CommonModule,
    RouterOutlet,
    Navbar,
    Footer,
    Login,
    Register,
    ToastComponent
  ],

  templateUrl: './app.html',

  styleUrls: ['./app.css']
})

export class App {

  constructor(
    public router: Router,
    private authService: AuthService
  ) {}

  mostrarAdmin(): boolean {
    return this.router.url.includes('/admin') && this.authService.obtenerRol() === 'ADMIN';
  }

}