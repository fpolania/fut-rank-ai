import { Component, inject } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AsyncPipe } from '@angular/common';
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AsyncPipe],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  sidebarOpen = false;
  authService = inject(AuthService);

  toggleSidebar() {

    this.sidebarOpen =
      !this.sidebarOpen;

  }
  logout() {

    this.authService
      .logout();

  }
}
