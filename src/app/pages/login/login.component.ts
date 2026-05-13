import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';
import { TEAM_PLAYERS } from '../../core/constants/team-players.constant';
import { RouterLink } from '@angular/router';
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

  async login() {
    await this.authService.loginWithGoogle();
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

    const {
      value: userDocument,

      isDismissed,
    } = await Swal.fire({
      title: 'Acceso al equipo ⚽',
      input: 'text',
      inputLabel: 'Ingresa tu Llave',

      inputPlaceholder: 'Número de llave',

      inputAttributes: {
        maxlength: '20',

        autocapitalize: 'off',

        autocorrect: 'off',
      },

      confirmButtonText: 'Continuar',

      cancelButtonText: 'Cancelar',

      showCancelButton: true,

      returnFocus: false,
    });

    if (isDismissed || !userDocument) return;

    const normalizedDocument = userDocument.trim();

    const player = TEAM_PLAYERS.find(
      (current) => current.document === normalizedDocument,
    );

    if (!player) {
      await Swal.fire({
        icon: 'error',

        title: 'Acceso denegado',

        text: 'No perteneces al equipo.',
      });

      return;
    }

    sessionStorage.setItem(
      'teamPlayer',

      JSON.stringify(player),
    );

    this.login();
  }
}
