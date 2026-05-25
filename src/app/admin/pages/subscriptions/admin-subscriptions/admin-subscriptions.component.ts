import { Component, inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PlanService } from '../../../services/plan.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { TeamService } from '../../../services/team.service';
import { Team } from '../../../models/team.interface';
import { Plan } from '../../../models/plan';
import { successAlert, warningAlert } from '../../../../core/utils/alert.util';
import { SubscriptionService } from '../../../services/subscription.service';
import { Subscription } from '../../../models/subscription.interface';
import { throws } from 'assert';

@Component({
  selector: 'app-admin-subscriptions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-subscriptions.component.html',
  styleUrls: ['./admin-subscriptions.component.css'],
})
export class AdminSubscriptionsComponent implements OnInit {
  editingSubscription: any = null;
  subscriptionForm: FormGroup;
  private planService = inject(PlanService);
  private loadingService = inject(LoadingService);
  private teamService = inject(TeamService);
  private subscriptionService = inject(SubscriptionService);
  teams: Team[] = [];
  plans: Plan[] = [];
  selectedPlan: Plan | null = null;
  selectedTeam: Team | null = null;
  subscriptions: Subscription[] = [];

  constructor(private fb: FormBuilder) {
    this.subscriptionForm = this.fb.group({
      teamId: ['', [Validators.required]],
      planId: ['', [Validators.required]],
      status: ['active', [Validators.required]],
      currentPeriodEnd: ['', [Validators.required]],
    });
  }
  ngOnInit() {
    this.getTeams();
    this.getPlans();
    this.getSubscriptions();
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
  getSubscriptions() {
    this.subscriptionService.getSubscriptions().subscribe({
      next: (subscriptions) => {
        this.subscriptions = subscriptions;
        console.log(this.subscriptions, 'pruebas');
      },

      error: (error) => {
        console.error(error);
      },
    });
  }
  onPlanChange(event: any) {
    const selectedPlan = this.plans.find((p) => p.id === event.target.value);
    this.selectedPlan = selectedPlan || null;
  }
  onTeamChange(event: any) {
    const selectedTeam = this.teams.find((t) => t.id === event.target.value);
    this.selectedTeam = selectedTeam || null;
  }
  formatDate(date: any): string {
    if (!date) {
      return '';
    }
    const parsedDate = date?.toDate ? date.toDate() : new Date(date);
    return parsedDate.toLocaleDateString('es-CO');
  }
  async createSubscription() {
    if (this.subscriptionForm.invalid) {
      this.subscriptionForm.markAllAsTouched();
      return;
    }
    try {
      this.loadingService.show();
      const formValue = {
        ...this.subscriptionForm.value,

        currentPeriodEnd: new Date(
          this.subscriptionForm.value.currentPeriodEnd,
        ),
      };
      if (this.editingSubscription) {
        await this.subscriptionService.updateSubscription(
          this.editingSubscription.id!,
          {
            ...formValue,
            planName: this.selectedPlan?.name,
            teamName: this.selectedTeam?.name,
            price: this.selectedPlan?.price,
            maxPlayers: this.selectedPlan?.maxPlayers,
            maxVideos: this.selectedPlan?.maxVideos,
            maxAnalysis: this.selectedPlan?.maxAnalysis,
            updatedAt: new Date(),
          },
        );

        successAlert(
          'Suscripción actualizada 💳🔥',
          'La suscripción fue actualizada correctamente.',
        );
      } else {
        await this.subscriptionService.createSubscription({
          ...formValue,
          teamName: this.selectedTeam?.name,
          planName: this.selectedPlan?.name,
          price: this.selectedPlan?.price,
          currency: 'COP',
          maxPlayers: this.selectedPlan?.maxPlayers,
          maxVideos: this.selectedPlan?.maxVideos,
          maxAnalysis: this.selectedPlan?.maxAnalysis,
          status: 'active',
          currentPeriodStart: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        successAlert(
          'Suscripción creada 🚀💳',
          'La suscripción fue creada exitosamente.',
        );
      }

      this.resetForm();
    } catch (error) {
      console.error(error);
      warningAlert('Error 💳😮‍💨', 'Ocurrió un error guardando la suscripción.');
    } finally {
      this.loadingService.hide();
    }
  }

  editSubscription(subscription: any) {
    this.editingSubscription = subscription;
    const formattedDate = subscription.currentPeriodEnd
      ?.toDate?.()
      ?.toISOString()
      .split('T')[0];
    this.subscriptionForm.patchValue({
      teamId: subscription.teamId,
      planId: subscription.planId,
      status: subscription.status,
      currentPeriodEnd: formattedDate,
    });
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  resetForm() {
    this.editingSubscription = null;
    this.subscriptionForm.reset({
      team: '',
      plan: '',
      status: 'active',
      currentPeriodEnd: '',
    });
  }
  async deleteSubscription(subscription: Subscription) {
    try {
      this.loadingService.show();
      await this.subscriptionService.deleteSubscription(subscription.id!);
      successAlert(
        'Suscripción eliminada 🗑️🔥',
        'La suscripción fue eliminada correctamente.',
      );
    } catch (error) {
      console.error(error);
      warningAlert('Error 😮‍💨', 'No se pudo eliminar la suscripción.');
    } finally {
      this.loadingService.hide();
    }
  }
}
