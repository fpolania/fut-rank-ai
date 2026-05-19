import { Component, inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CompetitionService } from '../../core/services/competition.service';
import { LoadingService } from '../../core/services/loading.service';
import { errorAlert, successAlert } from '../../core/utils/alert.util';
import { Competition } from '../../core/interfaces/competition.interface';

@Component({
  selector: 'app-competition-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './competition-create.component.html',
  styleUrls: ['./competition-create.component.css'],
})
export class CompetitionCreateComponent implements OnInit {
  competitionForm!: FormGroup;
  private loadingService = inject(LoadingService);
  competitions: Competition[] = [];
  selectedCompetition: Competition | null = null;
  constructor(
    private fb: FormBuilder,
    private competitionService: CompetitionService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getCompetitions();
  }
  getCompetitions() {
    this.loadingService.show();
    this.competitionService.getCompetitions().subscribe({
      next: (competitions) => {
        this.competitions = competitions;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error(error);
        this.loadingService.hide();
      },
    });
  }
  initForm() {
    this.competitionForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['tournament', [Validators.required]],
      season: ['2026', [Validators.required]],
      active: [true, [Validators.required]],
    });
  }

  async saveCompetition() {
    if (this.competitionForm.invalid) {
      return;
    }

    try {
      this.loadingService.show();
      if (this.selectedCompetition) {
        await this.competitionService.updateCompetition(
          this.selectedCompetition.id!,
          this.competitionForm.value,
        );

        successAlert(
          'Competencia actualizada 🏆🔥',
          'La competencia fue actualizada correctamente.',
        );
      } else {
        /* CREATE */
        await this.competitionService.createCompetition({
          ...this.competitionForm.value,

          createdAt: new Date(),
        } as any);

        successAlert(
          'Competencia creada 🏆🔥',
          'La competencia fue creada correctamente.',
        );
      }

      this.selectedCompetition = null;
      this.competitionForm.reset({
        type: 'tournament',
        season: '2026',
        active: true,
      });
    } catch (error) {
      console.error(error);
      errorAlert('Ups 😮‍💨', 'No se pudo guardar la competencia.');
    } finally {
      this.loadingService.hide();
    }
  }
  deleteCompetition(id: string) {
    try {
      this.loadingService.show();
      this.competitionService.deleteCompetition(id).then(() => {
        this.loadingService.hide();
        successAlert(
          'Competencia eliminada 🏆🔥',
          'La competencia fue eliminada correctamente.',
        );
      });
    } catch (error) {
      console.error(error);
      this.loadingService.hide();
      errorAlert('Ups 😮‍💨', 'No se pudo eliminar la competencia.');
    }
  }
  async editCompetition(competition: Competition) {
    this.selectedCompetition = competition;
    this.competitionForm.patchValue({
      name: competition.name,
      type: competition.type,
      season: competition.season,
      active: competition.active,
    });
  }
}
