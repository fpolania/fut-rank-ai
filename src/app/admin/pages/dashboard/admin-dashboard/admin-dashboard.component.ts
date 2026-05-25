import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent {
  stats = [
    {
      title: 'Teams activos',
      value: 1,
      icon: '⚽',
    },

    {
      title: 'Usuarios',
      value: 12,
      icon: '👥',
    },

    {
      title: 'Análisis IA',
      value: 8,
      icon: '🤖',
    },

    {
      title: 'Videos analizados',
      value: 3,
      icon: '🎥',
    },
  ];
}
