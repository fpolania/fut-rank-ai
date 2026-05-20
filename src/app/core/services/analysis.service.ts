import { inject, Injectable } from '@angular/core';

import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  updateDoc,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

import { MatchAnalysis } from '../interfaces/match-analysis.interface';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root',
})
export class AnalysisService {
  private firestore = inject(Firestore);
  private functions = inject(Functions);
  private analysisCollection = collection(this.firestore, 'match-analysis');

  createAnalysis(analysis: MatchAnalysis) {
    return addDoc(this.analysisCollection, analysis);
  }

  getAnalysis(): Observable<MatchAnalysis[]> {
    return collectionData(this.analysisCollection, {
      idField: 'id',
    }) as Observable<MatchAnalysis[]>;
  }
  async generateMatchAnalysis(payload: any) {
    const callable = httpsCallable(this.functions, 'generateMatchAnalysis');

    return callable(payload);
  }

  updateAnalysis(analysisId: string, data: Partial<MatchAnalysis>) {
    const analysisRef = doc(this.firestore, 'match-analysis', analysisId);
    return updateDoc(analysisRef, data);
  }
}
