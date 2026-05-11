import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  Firestore,
  collection,
  addDoc,
  Timestamp,
} from '@angular/fire/firestore';

import Swal from 'sweetalert2';
import { LoadingService } from '../../core/services/loading.service';
import { errorAlert, successAlert } from '../../core/utils/alert.util';

@Component({
  selector: 'app-join-team',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './join-team.component.html',
  styleUrls: ['./join-team.component.css'],
})
export class JoinTeamComponent {
  private fb = inject(FormBuilder);
  private firestore = inject(Firestore);
  private loadingService = inject(LoadingService);

  positions = ['Arquero', 'Defensa', 'Mediocampo', 'Delantero'];
  joinForm = this.fb.group({
    name: [
      '',
      [Validators.required, Validators.pattern('^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$')],
    ],
    age: [null, [Validators.required, Validators.pattern('^[1-9][0-9]?$')]],
    position: ['', [Validators.required]],
    foot: ['', [Validators.required]],
    city: ['Bogotá', [Validators.required]],
    number: [
      '',
      [
        Validators.required,
        Validators.pattern(/^3\d{9}$/),
        Validators.minLength(10),
        Validators.maxLength(10),
      ],
    ],

    strengths: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.pattern('^[A-Za-zÁÉÍÓÚáéíóúÑñ ,.]+$'),
      ],
    ],
  });

  async submitApplication() {
    if (this.joinForm.invalid) return;

    this.loadingService.show();

    try {
      const applicationsRef = collection(this.firestore, 'team-applications');

      await addDoc(applicationsRef, {
        ...this.joinForm.value,
        status: 'pending',
        createdAt: Timestamp.now(),
      });

      this.loadingService.hide();
      successAlert(
        'Postulación enviada ⚽',
        'Tu información fue registrada correctamente. Muy pronto nuestro equipo se pondrá en contacto contigo para el proceso de evaluación.',
      );
      this.joinForm.reset();
    } catch (error) {
      console.error(error);
      this.loadingService.hide();
      errorAlert('Ups 😮‍💨', 'No se pudo enviar la postulación.');
    }
  }
}
