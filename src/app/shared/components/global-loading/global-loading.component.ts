import {
  Component,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  LoadingService
} from '../../../core/services/loading.service';

@Component({
  selector: 'app-global-loading',
  imports: [
    CommonModule
  ],
   standalone: true,
  templateUrl:'./global-loading.component.html',
  styleUrl:'./global-loading.component.css'
})
export class GlobalLoadingComponent {

  loadingService =
    inject(LoadingService);

}