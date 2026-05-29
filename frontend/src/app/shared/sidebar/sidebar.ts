import { Component } from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './sidebar.html',

  styleUrls: ['./sidebar.css']
})

export class Sidebar {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  logout() {

    this.authService.logout();

    this.router.navigate(['/home']);

  }

}
