import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { errorAlert, successAlert } from '../../core/utils/alert.util';
import { LoadingService } from '../../core/services/loading.service';
import { TeamSettingsService } from '../../core/services/settings.service';
declare const bootstrap: any;
@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AsyncPipe,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent implements OnInit {
  sidebarOpen = false;
  authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  private teamSettingsService = inject(TeamSettingsService);
  user = this.authService.currentUser;
  teamName: string = 'NO DEFINIDO';
  openTeamSettings = false;

  ngOnInit(): void {
    this.loadTeamSettings();
  }
  async loadTeamSettings() {
    const settings = await this.teamSettingsService.getTeamSettings();
    if (settings?.['name']) {
      this.teamName = settings['name'];
    }
  }
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  logout() {
    this.authService.logout();
  }
  closeSidebar() {
    this.sidebarOpen = false;
  }
  async saveTeamSettings() {
    try {
      this.loadingService.show();
      await this.teamSettingsService.saveTeamSettings(this.teamName);
      successAlert(
        'Equipo actualizado ⚽🔥',
        'El nombre del equipo fue actualizado correctamente.',
      );
      this.openTeamSettings = false;
    } catch (error) {
      console.error(error);
      errorAlert('Ups 😮‍💨', 'No se pudo actualizar el equipo.');
    } finally {
      this.loadingService.hide();
    }
  }
}
