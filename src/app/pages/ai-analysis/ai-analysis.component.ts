import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatchService } from '../../core/services/match.service';
import { Match } from '../../core/interfaces/match.interface';
import { UploadFileService } from '../../core/services/upload-file.service';
import { LoadingService } from '../../core/services/loading.service';
import { successAlert, warningAlert } from '../../core/utils/alert.util';
import { AnalysisService } from '../../core/services/analysis.service';
import { MatchAnalysis } from '../../core/interfaces/match-analysis.interface';
import { AuthService } from '../../core/services/auth.service';
import { SubscriptionService } from '../../admin/services/subscription.service';

@Component({
  selector: 'app-ai-analysis',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ai-analysis.component.html',
  styleUrl: './ai-analysis.component.css',
})
export class AiAnalysisComponent implements OnInit {
  private fb = inject(FormBuilder);
  private matchService = inject(MatchService);
  private fileUpload = inject(UploadFileService);
  private loadingService = inject(LoadingService);
  private aiAnalysisService = inject(AnalysisService);
  authService = inject(AuthService);
  private subscriptionService = inject(SubscriptionService);
  matches: Match[] = [];
  selectedColor = 'black';
  selectedType: any;
  selectedVideo: File | null = null;
  videoUrl = '';
  loading = false;
  currentUser: any = null;
  uploadingVideo = false;
  matchSelected: any = '';
  analyses: MatchAnalysis[] = [];
  teamName: string = '';
  types: any = [];
  analysisForm = this.fb.group({
    matchId: ['', [Validators.required]],
    focus: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.getCurrentUser();
  }

  getAnalyses() {
    this.loadingService.show();
    this.aiAnalysisService
      .getAnalysisByTeam(this.currentUser.teamId)
      .subscribe({
        next: (analyses) => {
          this.analyses = analyses;
          this.loadingService.hide();
        },
        error: (error: any) => {
          console.error(error);
          this.loadingService.hide();
        },
      });
  }
  getTypesFut() {
    const subscription =
      this.subscriptionService.getCurrentSubscription() as any;
    if (!subscription?.types) {
      return;
    }
    this.types = subscription.types
      .split('-')
      .map((type: string) => type.trim());
  }
  macthSelected(event: any) {
    this.matchSelected = this.matches.find((m) => m.id === event.target.value);
  }
  getMatches() {
    this.matchService.getMatches(this.currentUser.teamId).subscribe({
      next: (matches) => {
        this.matches = matches.filter((match) => match.finished);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  getCurrentUser() {
    this.authService.currentUser.subscribe({
      next: (user) => {
        this.currentUser = user;
        if (this.currentUser.uid) {
          this.getName(this.currentUser.teamId);
          this.getMatches();
          this.getAnalyses();
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  async getName(teamId: string) {
    this.teamName = await this.authService.getTeamName(teamId);
    this.getTypesFut();
  }
  onVideoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    if (!file.type.includes('video')) {
      warningAlert(
        'Archivo no válido ⚽🔥',
        'El archivo seleccionado no es un video. Por favor, selecciona un archivo de video.',
      );

      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;
      if (duration > 300) {
        warningAlert(
          'Video muy largo ⚽🔥',
          'El video no puede superar los 5 minutos.',
        );
        return;
      }
      this.selectedVideo = file;
    };
    video.src = URL.createObjectURL(file);
  }

  async uploadVideo() {
    if (!this.selectedVideo) return;
    try {
      this.loadingService.show();
      this.uploadingVideo = true;
      this.videoUrl = await this.fileUpload.uploadFile(
        this.selectedVideo,
        'analysis-videos',
      );
      this.loadingService.hide();
    } catch (error) {
      console.error(error);
      this.loadingService.hide();
    } finally {
      this.uploadingVideo = false;
      this.loadingService.hide();
    }
  }

  clearVideo() {
    this.selectedVideo = null;
    this.videoUrl = '';
  }

  selectColor(color: string) {
    this.selectedColor = color;
  }

  selectType(type: 'FUT 5' | 'FUT 8') {
    this.selectedType = type;
  }
  formatAnalysis(text: string) {
    if (!text) {
      return '';
    }
    return text
      .replace(/## (.*?)/g, '<h3>$1</h3>')
      .replace(/\b(white|black|blue|red|green)\b/gi, this.teamName)
      .replace(/\n/g, '<br>');
  }
  async saveData() {
    if (this.analysisForm.invalid) {
      return;
    }
    if (!this.videoUrl) {
      warningAlert(
        'Video requerido ⚽🔥',
        'Debes subir un video para generar el análisis.',
      );
      return;
    }
    const subscription = this.subscriptionService.getCurrentSubscription();
    if (!subscription) {
      warningAlert(
        'Plan no encontrado ⚽',
        'No se encontró una suscripción activa.',
      );
      return;
    }
    if (!subscription.currentPeriodStart) {
      warningAlert(
        'Error de suscripción ⚽',
        'La suscripción no tiene fecha de inicio configurada.',
      );
      return;
    }
    const totalVideos = this.analyses.filter(
      (analysis) =>
        analysis.createdAt &&
        new Date(analysis.createdAt) >=
          new Date(subscription.currentPeriodStart!),
    ).length;

    const canUploadVideo = this.subscriptionService.canUploadVideo(
      subscription,
      totalVideos,
    );
    if (!canUploadVideo) {
      warningAlert(
        'Límite alcanzado 🎥',
        `Tu plan permite máximo ${subscription.maxVideos} videos por período.`,
      );
      return;
    }

    try {
      this.loadingService.show();
      this.loading = true;
      const payload = {
        matchId: this.analysisForm.value.matchId,
        focus: this.analysisForm.value.focus,
        teamColor: this.selectedColor,
        matchType: this.selectedType,
        videoUrl: this.videoUrl,
        status: 'pending',
        matchName: this.matchSelected?.title || 'Partido sin nombre',
        teamId: this.currentUser.teamId,
        createdAt: Date.now(),
      };
      await this.aiAnalysisService.createAnalysis(payload as any);
      successAlert(
        'Análisis iniciado 🤖🔥',
        'La IA comenzará a procesar el video.',
      );

      this.analysisForm.reset();
      this.selectedColor = 'black';
      this.selectedType = 'FUT 5';
      this.clearVideo();
      this.getAnalyses();
    } catch (error) {
      console.error(error);
      warningAlert('Error ⚽🔥', 'Ocurrió un error generando el análisis.');
    } finally {
      this.loadingService.hide();
      this.loading = false;
    }
  }
  async viewAnalysis(analysis: MatchAnalysis) {
    try {
      this.loading = true;
      this.loadingService.show();
      const response = await this.aiAnalysisService.generateMatchAnalysis({
        videoUrl: analysis.videoUrl,
        teamColor: analysis.teamColor,
        matchType: analysis.matchType,
        focus: analysis.focus,
      });
      await this.aiAnalysisService.updateAnalysis(analysis.id!, {
        analysis: response.analysis,
        status: 'completed',
      });

      successAlert(
        'Análisis completado 🤖⚽',
        'La IA terminó el análisis correctamente.',
      );
    } catch (error) {
      console.error(error);
      warningAlert('Error IA 😮‍💨', 'No se pudo generar el análisis.');
    } finally {
      this.loading = false;
      this.loadingService.hide();
    }
  }
}
