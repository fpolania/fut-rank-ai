import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';

import Swal from 'sweetalert2';

import { AuthService } from '../../core/services/auth.service';

import { TeamPlayersService } from '../../core/services/team-players.service';
import { LoadingService } from '../../core/services/loading.service';

declare const bootstrap: any;

@Component({
  selector: 'app-login',

  standalone: true,

  imports: [CommonModule, RouterLink],

  templateUrl: './login.component.html',

  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  private teamPlayersService = inject(TeamPlayersService);
  validatedPlayer = false;
  playerLoged: any;

  async login() {
    await this.authService.loginWithGoogle(this.playerLoged);
  }

  async showDocumentPrompt() {
    const opened = document.querySelector(
      '.offcanvas.show',
    ) as HTMLElement | null;
    if (opened) {
      const inst =
        bootstrap.Offcanvas.getInstance(opened) ??
        new bootstrap.Offcanvas(opened);
      inst.hide();
      await new Promise((r) => setTimeout(r, 250));
    }
    const { value: userDocument, isDismissed } = await Swal.fire({
      title: 'Acceso al equipo ⚽',
      input: 'text',
      inputLabel: 'Ingresa tu Llave',
      inputPlaceholder: 'Número de llave',
      inputAttributes: {
        maxlength: '20',
        autocapitalize: 'off',
        autocorrect: 'off',
      },
      confirmButtonText: 'Validar acceso',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      returnFocus: false,
    });
    if (isDismissed || !userDocument) return;
    const normalizedDocument = userDocument.trim();
    try {
      this.loadingService.show();
      this.playerLoged =
        await this.teamPlayersService.getPlayerByDocument(normalizedDocument);
        console.log(this.playerLoged)
      if (!this.playerLoged) {
        this.loadingService.hide();
        await Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: 'No perteneces al equipo.',
        });
        return;
      }
      this.validatedPlayer = true;
      this.loadingService.hide();
      await Swal.fire({
        icon: 'success',
        title: 'Acceso aprobado',
        text: 'Ahora continúa con Google 🚀',
      });
    } catch (error) {
      console.error(error);
      this.loadingService.hide();
      await Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Error validando acceso.',
      });
    }
  }
}
