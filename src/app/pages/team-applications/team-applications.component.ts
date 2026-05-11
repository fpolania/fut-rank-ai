import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { TeamApplicationService } from '../../core/services/team-application.service';
import { TeamApplication } from '../../core/interfaces/team-application.interface';
import { LoadingService } from '../../core/services/loading.service';
import { errorAlert, successAlert } from '../../core/utils/alert.util';

@Component({
  selector: 'app-team-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-applications.component.html',
  styleUrls: ['./team-applications.component.css'],
})
export class TeamApplicationsComponent implements OnInit {
  private applicationService = inject(TeamApplicationService);
  applications$!: Observable<TeamApplication[]>;
  private loadingService = inject(LoadingService);
  ngOnInit(): void {
    this.applications$ = this.applicationService.getApplications();
  }

  async approvePlayer(application: TeamApplication) {
    this.loadingService.show();
    try {
      await this.applicationService.approveApplication(application);
      await this.applicationService.updateStatus(
        application.id as any,
        'approved',
      );
      this.loadingService.hide();
      successAlert(
        'Jugador aprobado ⚽',
        'El jugador fue agregado al equipo correctamente.',
      );
    } catch (error) {
      console.error(error);
      this.loadingService.hide();
      errorAlert('Ups 😮‍💨', 'No se pudo aprobar el jugador.');
    }
  }

  async changeStatus(id: string, status: string) {
    this.loadingService.show();
    try {
      await this.applicationService.updateStatus(id, status);
      this.loadingService.hide();
      successAlert(
        'Estado actualizado ⚽',
        'La postulación fue actualizada correctamente.',
      );
    } catch (error) {
      console.error(error);
      this.loadingService.hide();
      errorAlert('Ups 😮‍💨', 'No se pudo actualizar la postulación.');
    }
  }
}
