import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalLoadingComponent } from './shared/components/global-loading/global-loading.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalLoadingComponent],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'fut-rank-ai';
}
