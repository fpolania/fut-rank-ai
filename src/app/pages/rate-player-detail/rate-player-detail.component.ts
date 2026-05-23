import { Component, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { MatchService } from '../../core/services/match.service';
import { RatingService } from '../../core/services/rating.service';
import { LoadingService } from '../../core/services/loading.service';
import {
  successAlert,
  warningAlert,
  errorAlert,
} from '../../core/utils/alert.util';
import { PlayerService } from '../../core/services/player.service';
import { BAD_WORDS } from '../../core/constants/bad-words.constant';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-rate-player-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rate-player-detail.component.html',
  styleUrl: './rate-player-detail.component.css',
})
export class RatePlayerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private matchService = inject(MatchService);
  authService = inject(AuthService);
  private ratingService = inject(RatingService);
  private playerService = inject(PlayerService);
  private loadingService = inject(LoadingService);

  matchId: string | null = null;
  match: any;
  currentPlayerDocument = '';
  currenPlayerRole = '';
  badWords = BAD_WORDS;
  playersForm = this.fb.group({
    players: this.fb.array([]),
  });

  ngOnInit(): void {
    this.matchId = this.route.snapshot.paramMap.get('id');
    this.authService.currentUser.subscribe((user: any) => {
      if (!user) {
        return;
      }
      this.currentPlayerDocument = user.document || '';
      this.currenPlayerRole = user.role || '';
      if (this.matchId) {
        this.getMatch();
      }
    });
  }

  get playersArray(): FormArray {
    return this.playersForm.get('players') as FormArray;
  }

  get playersControls() {
    return this.playersArray.controls;
  }

  async getMatch() {
    if (!this.matchId) return;
    this.loadingService.show();
    try {
      const match = await new Promise<any>((resolve) => {
        this.matchService
          .getMatchById(this.matchId!)
          .subscribe((data) => resolve(data));
      });

      this.match = match;
      const ratings = await new Promise<any[]>((resolve) => {
        this.ratingService
          .getMatchRatings(this.matchId!)
          .subscribe((data) => resolve(data));
      });

      const players = match.players.filter((player: any) => {
        if (player.attended !== true) {
          return false;
        }

        if (String(player.playerId) === String(this.currentPlayerDocument)) {
          return false;
        }

        const playerRating = ratings.find(
          (rating: any) => String(rating.playerId) === String(player.playerId),
        );

        const alreadyRated =
          playerRating?.data?.some(
            (item: any) =>
              String(item.ratedBy) === String(this.currentPlayerDocument),
          ) || false;
        return !alreadyRated;
      });

      if (!players.length) {
        warningAlert(
          'Calificaciones completas ⚽🔥',
          'Ya calificaste a todos los jugadores.',
        );

        this.router.navigate(['/rate-players']);
        return;
      }

      this.buildForm(players);
    } catch (error) {
      console.error(error);
      errorAlert('Ups 😮‍💨', 'Error cargando el partido.');
    } finally {
      this.loadingService.hide();
    }
  }

  /* BUILD FORM */

  buildForm(players: any[]) {
    this.playersArray.clear();
    players.forEach((player: any) => {
      this.playersArray.push(
        this.fb.group({
          playerId: [player.playerId],
          name: [player.name],
          photo: [player.photo],
          position: [player.position],
          rating: [
            0,
            [Validators.required, Validators.min(1), Validators.max(5)],
          ],
          comment: [
            '',
            [
              Validators.required,
              Validators.minLength(10),
              Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.,]+$/),
            ],
          ],
          isMvp: [false],
        }),
      );
    });
  }

  toggleMvp(index: number) {
    debugger;
    const player = this.playersArray.at(index);
    const currentValue = player.get('isMvp')?.value;
    player.get('isMvp')?.setValue(!currentValue);
  }

  canSendRatings(): boolean {
    return this.playersArray.controls.some((control) => control.valid);
  }

  async sendRatings() {
    if (!this.matchId || !this.canSendRatings()) {
      return;
    }
    this.loadingService.show();
    try {
      const validPlayers = this.playersArray.controls.filter(
        (control) => control.valid,
      );
      for (const player of validPlayers) {
        const value = player.value;
        const newData = {
          ratedBy: this.currentPlayerDocument,
          rating: value.rating,
          comment: value.comment,
          anonymous: false,
          isMvp: value.isMvp,
          createdAt: new Date(),
        };
        const currentRating = await new Promise<any>((resolve) => {
          this.ratingService
            .getRatingByPlayerAndMatch(value.playerId!, this.matchId!)
            .subscribe((data) => resolve(data));
        });

        if (currentRating) {
          const updatedData = [...currentRating.data, newData];
          const total = updatedData.reduce(
            (acc: number, item: any) => acc + item.rating,
            0,
          );
          const averageRating = Number((total / updatedData.length).toFixed(1));
          await this.ratingService.updateRating(currentRating.id, {
            data: updatedData,
            averageRating,
            totalRatings: updatedData.length,
          });
        } else {
          await this.ratingService.addRating({
            playerId: value.playerId!,
            matchId: this.matchId,
            playerName: value.name!,
            averageRating: value.rating!,
            totalRatings: 1,
            createdAt: new Date() as any,
            data: [newData as any],
          });
        }

        const playerRatings = await new Promise<any[]>((resolve) => {
          this.ratingService
            .getPlayerRatings(value.playerId!)
            .subscribe((data) => resolve(data));
        });

        const totalGlobal = playerRatings.reduce(
          (acc, rating) => acc + rating.averageRating,
          0,
        );

        const globalAverage = playerRatings.length
          ? Number((totalGlobal / playerRatings.length).toFixed(1))
          : 0;

        const currentPlayer = await new Promise<any>((resolve) => {
          this.playerService
            .getPlayerById(value.playerId!)
            .subscribe((data) => resolve(data));
        });

        const updateData: any = {
          averageRating: globalAverage,
        };

        if (value.isMvp) {
          updateData.mvps = (currentPlayer.mvps || 0) + 1;
        }
        await this.playerService.updatePlayer(value.playerId!, updateData);
        if (value.isMvp) {
          await this.matchService.updateMatch(this.matchId, {
            mvpPlayerId: value.playerId!,
            mvpPlayerName: value.name!,
          });
        }
      }

      successAlert(
        'Calificaciones enviadas ⭐🔥',
        'Las calificaciones fueron registradas correctamente.',
      );
      this.getMatch();
      this.playersForm.reset();
      this.buildForm([]);
    } catch (error) {
      console.error(error);
      errorAlert('Ups 😮‍💨', 'Ocurrió un error enviando las calificaciones.');
    } finally {
      this.loadingService.hide();
    }
  }
  sanitizeComment(event: any) {
    const input = event.target as HTMLInputElement;
    let sanitizedValue = input.value;
    this.badWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      sanitizedValue = sanitizedValue.replace(regex, '**');
    });
    input.value = sanitizedValue;
  }
}
