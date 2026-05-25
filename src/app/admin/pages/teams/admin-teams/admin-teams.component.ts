import { Component, inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PlanService } from '../../../services/plan.service';
import { Plan } from '../../../models/plan';
import { LoadingService } from '../../../../core/services/loading.service';
import { successAlert, warningAlert } from '../../../../core/utils/alert.util';
import { Team } from '../../../models/team.interface';
import { TeamService } from '../../../services/team.service';

@Component({
  selector: 'app-admin-teams',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-teams.component.html',
  styleUrls: ['./admin-teams.component.css'],
})
export class AdminTeamsComponent implements OnInit {
  private planService = inject(PlanService);
  private loadingService = inject(LoadingService);
  private teamService = inject(TeamService);
  editingTeam: any = null;
  teamForm: FormGroup;
  teams: Team[] = [];
  plans: Plan[] = [];
  editingPlan: Team | null = null;
  selectedPlan: Plan | null = null;

  constructor(private fb: FormBuilder) {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required]],
      city: ['', Validators.required],
      plan: ['', [Validators.required]],
      ownerId: ['', [Validators.required]],
      ownerEmail: ['', [Validators.required]],
      ownerName: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.getPlans();
    this.getTeams();
  }
  getTeams() {
    this.teamService.getTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getPlans() {
    this.planService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  onPlanChange(event: any) {
    this.selectedPlan =
      this.plans.find((plan) => plan.id === event.target.value) || null;
  }

  async createTeam() {
    if (this.teamForm.invalid) {
      this.teamForm.markAllAsTouched();
      return;
    }

    try {
      this.loadingService.show();
      if (this.editingTeam) {
        await this.teamService.updateTeam(this.editingTeam.id!, {
          ...this.teamForm.value,
          updatedAt: new Date(),
        });

        successAlert(
          'Team actualizado ⚽🔥',
          'El team fue actualizado correctamente.',
        );
      } else {
        await this.teamService.createTeam({
          ...this.teamForm.value,
          planName: this.selectedPlan?.name || '',
          maxPlayers: this.selectedPlan?.maxPlayers || 0,
          maxVideos: this.selectedPlan?.maxVideos || 0,
          maxAnalysis: this.selectedPlan?.maxAnalysis || 0,
          active: true,
          subscriptionStatus: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        successAlert('Team creado 🚀⚽', 'El equipo fue creado exitosamente.');
      }
      this.resetForm();
    } catch (error) {
      console.error(error);
      warningAlert('Error ⚽🔥', 'Ocurrió un error guardando el team.');
    } finally {
      this.loadingService.hide();
    }
  }

  editTeam(team: any) {
    this.editingTeam = team;
    this.teamForm.patchValue({
      name: team.name,
      city: team.city,
      plan: team.plan,
      ownerId: team.ownerId,
      ownerEmail: team.ownerEmail,
      ownerName: team.ownerName,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  resetForm() {
    this.editingTeam = null;
    this.teamForm.reset({
      name: '',
      city: '',
      plan: '',
      ownerId: '',
      ownerEmail: '',
      ownerName: '',
    });
  }
  deleteTeam(team: Team) {
    try {
      this.loadingService.show();
      this.teamService.deleteTeam(team.id!);
      successAlert(
        'Team eliminado 🗑️⚽',
        'El equipo fue eliminado correctamente.',
      );
    } catch (error) {
      warningAlert('Error 🚨', 'Ocurrió un error eliminando el team.');
    } finally {
      this.loadingService.hide();
    }
  }
}
