import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Productos } from './pages/productos/productos';
import { DetalleProducto } from './pages/detalle-producto/detalle-producto';
import { ClienteDashboard } from './cliente/cliente-dashboard/cliente-dashboard';
import { Carrito } from './cliente/carrito/carrito';
import { Perfil } from './cliente/perfil/perfil';
import { Historial } from './cliente/historial/historial';
import { Dashboard } from './admin/dashboard/dashboard';
import { Categorias } from './admin/categorias/categorias';

import { Pedidos } from './admin/pedidos/pedidos';

import { Usuarios } from './admin/usuarios/usuarios';
import { ProductosAdmin } from './admin/productosAdmin/productosAdmin';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: 'home',
    component: Home,
  },

  {
    path: 'login',
    component: Login,
  },

  {
    path: 'register',
    component: Register,
  },

  {
    path: 'productos',
    component: Productos,
  },

  {
    path: 'productos/:id',
    component: DetalleProducto,
  },

  {
    path: 'cliente',
    component: ClienteDashboard,
    children: [
      { path: '', redirectTo: 'carrito', pathMatch: 'full' },
      { path: 'carrito', component: Carrito },
      { path: 'perfil', component: Perfil },
      { path: 'historial', component: Historial },
    ]
  },

  {
    path: 'carrito',
    component: Carrito,
  },

  {
    path: 'perfil',
    redirectTo: 'cliente/perfil',
  },

  {
    path: 'historial',
    redirectTo: 'cliente/historial',
  },

  {
    path: 'admin',
    component: Dashboard,
  },

  {
    path: 'admin/productosAdmin',
    component: ProductosAdmin,
  },

  {
    path: 'admin/categorias',
    component: Categorias,
  },

  {
    path: 'admin/pedidos',
    component: Pedidos,
  },

  {
    path: 'admin/usuarios',
    component: Usuarios,
  },

  {
    path: '**',
    redirectTo: 'home',
  },
];
