import { Component } from '@angular/core';
import {
  BaseChartDirective
} from 'ng2-charts';

import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  CategoryScale,
  LinearScale,
  LineController
} from 'chart.js';

Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  CategoryScale,
  LinearScale,
  LineController
);
@Component({
  selector: 'app-player-profile',
  imports: [BaseChartDirective],
  templateUrl: './player-profile.component.html',
  styleUrl: './player-profile.component.css'
})
export class PlayerProfileComponent {
 radarChartData = {
    labels: [
      'Velocidad',
      'Definición',
      'Pase',
      'Defensa',
      'Resistencia',
      'Visión'
    ],
    datasets: [
      {
        data: [95, 92, 84, 60, 78, 88],
        label: 'Stats'
      }
    ]
  };

  lineChartData = {
    labels: [
      'P1',
      'P2',
      'P3',
      'P4',
      'P5'
    ],
    datasets: [
      {
        data: [6.8, 7.5, 8.2, 8.9, 9.2],
        label: 'Performance'
      }
    ]
  };
}
