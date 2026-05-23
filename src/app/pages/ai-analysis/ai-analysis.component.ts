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
import { get } from 'http';
import { TeamSettingsService } from '../../core/services/settings.service';

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
  private teamSettingsService = inject(TeamSettingsService);
  matches: Match[] = [];
  selectedColor = 'black';
  selectedType: 'FUT 5' | 'FUT 8' = 'FUT 5';
  selectedVideo: File | null = null;
  videoUrl = '';
  loading = false;
  uploadingVideo = false;
  matchSelected: any = '';
  analyses: MatchAnalysis[] = [];
  teamName: string = '';
  analysisForm = this.fb.group({
    matchId: ['', [Validators.required]],
    focus: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.getMatches();
    this.getAnalyses();
  }
  async loadTeamSettings() {
    const settings = await this.teamSettingsService.getTeamSettings();
    if (settings?.['name']) {
      this.teamName = settings['name'];
    }
  }
  getAnalyses() {
    this.loadingService.show();
    this.aiAnalysisService.getAnalysis().subscribe({
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
  macthSelected(event: any) {
    this.matchSelected = this.matches.find((m) => m.id === event.target.value);
    console.log('MATCH SELECTED:', this.matchSelected);
  }
  getMatches() {
    this.matchService.getMatches().subscribe({
      next: (matches) => {
        this.matches = matches.filter((match) => match.finished);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  onVideoSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    /* VALID VIDEO */

    if (!file.type.includes('video')) {
      warningAlert(
        'Archivo no válido ⚽🔥',

        'El archivo seleccionado no es un video. Por favor, selecciona un archivo de video.',
      );

      return;
    }

    /* VALID DURATION */

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
