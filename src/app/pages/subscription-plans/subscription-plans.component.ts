import { Component, OnInit } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';
import { PlanService } from '../../admin/services/plan.service';
import { Plan } from '../../admin/models/plan';
import { CommonModule } from '@angular/common';
import { PHONE } from '../../core/constants/emails.constant';

@Component({
  selector: 'app-subscription-plans',
  imports: [CommonModule],
  templateUrl: './subscription-plans.component.html',
  styleUrl: './subscription-plans.component.css',
})
export class SubscriptionPlansComponent implements OnInit {
  plans: Plan[] = [];
  constructor(
    private loadingService: LoadingService,
    private planService: PlanService,
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }
  loadPlans(): void {
    this.loadingService.show();
    this.planService.getPlans().subscribe({
      next: (plans) => {
        const order = ['PLAN FREE', 'PLAN PRO', 'PLAN ELITE'];
        this.plans = plans.sort(
          (a, b) => order.indexOf(a.name) - order.indexOf(b.name),
        );
        this.loadingService.hide();
      },
      error: (error) => {
        console.error(error);
        this.loadingService.hide();
      },
    });
  }
  isFeatured(plan: any): boolean {
    return plan?.name?.toUpperCase()?.includes('PRO') ?? false;
  }

  getPlanIcon(plan: any): string {
    const name = plan?.name?.toUpperCase() || '';
    if (name.includes('PRO')) {
      return 'bi-trophy-fill';
    }
    if (name.includes('ELITE')) {
      return 'bi-robot';
    }
    return 'bi-lightning-charge-fill';
  }
  selectPlan(plan: Plan) {
    const message = `
Hola 👋

Estoy interesado en adquirir el ${plan.name} de FutRankAI.

📋 Detalles del plan:
💰 Precio: ${plan.price === 0 ? 'Gratis' : '$' + plan.price}
👥 Jugadores: ${plan.maxPlayers}
🎥 Videos: ${plan.maxVideos}
🤖 Análisis IA: ${plan.maxAnalysis}
⚽ Modalidades: ${plan.types}

¿Me puedes brindar información para activarlo?
`;

    window.open(
      `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`,
      '_blank',
    );
  }
}
