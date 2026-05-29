import { Component, inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoadingService } from '../../../../core/services/loading.service';
import { Plan } from '../../../models/plan';
import { PlanService } from '../../../services/plan.service';
import { successAlert, warningAlert } from '../../../../core/utils/alert.util';

@Component({
  selector: 'app-admin-plans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-plans.component.html',
  styleUrls: ['./admin-plans.component.css'],
})
export class AdminPlansComponent implements OnInit {
  private loadingService = inject(LoadingService);
  private planService = inject(PlanService);
  planForm: FormGroup;
  plans: Plan[] = [];
  editingPlan: Plan | null = null;

  constructor(private fb: FormBuilder) {
    this.planForm = this.fb.group({
      name: ['', [Validators.required]],
      price: [0, [Validators.required]],
      maxPlayers: [15, [Validators.required]],
      maxVideos: [1, [Validators.required]],
      maxAnalysis: [5, [Validators.required]],
      types: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.getPlans();
  }

  getPlans() {
    this.planService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
        console.log(this.plans);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  resetForm() {
    this.editingPlan = null;
    this.planForm.reset({
      name: '',
      price: 0,
      maxPlayers: 15,
      maxVideos: 1,
      maxAnalysis: 5,
    });
  }
  editPlan(plan: Plan) {
    this.editingPlan = plan;
    this.planForm.patchValue({
      name: plan.name,
      price: plan.price,
      maxPlayers: plan.maxPlayers,
      maxVideos: plan.maxVideos,
      maxAnalysis: plan.maxAnalysis,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
  async createPlan() {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }
    try {
      this.loadingService.show();
      if (this.editingPlan) {
        await this.planService.updatePlan(
          this.editingPlan.id!,
          this.planForm.value,
        );
        successAlert(
          'Plan actualizado ⚽🔥',
          'El plan fue actualizado correctamente.',
        );
      } else {
      console.log(this.planForm.controls['types'].value)  
        await this.planService.createPlan({
          ...this.planForm.value,
          active: true,
        });

        successAlert(
          'Plan creado 🤖🔥',
          'El plan ha sido creado exitosamente.',
        );
      }

      this.resetForm();
    } catch (error) {
      console.error(error);
      warningAlert('Error ⚽🔥', 'Ocurrió un error guardando el plan.');
    } finally {
      this.loadingService.hide();
    }
  }
  deletePlan(plan: Plan) {
    try {
      this.loadingService.show();
      this.planService.deletePlan(plan.id!).then(() => {
        this.loadingService.hide();
        successAlert(
          'Plan eliminado 🤖🔥',
          'El plan ha sido eliminado exitosamente.',
        );
      });
    } catch (error) {
      warningAlert('Error ⚽🔥', 'Ocurrió un error eliminando el Plan.');
      this.loadingService.hide();
    }
  }
}
