import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { Competition } from '../interfaces/competition.interface';

@Injectable({
  providedIn: 'root',
})
export class CompetitionService {
  firestore = inject(Firestore);
  competitionCollection = collection(this.firestore, 'competitions');

  createCompetition(competition: Competition) {
    return addDoc(this.competitionCollection, competition);
  }

  getCompetitions(): Observable<Competition[]> {
    return collectionData(this.competitionCollection, {
      idField: 'id',
    }) as Observable<Competition[]>;
  }

  updateCompetition(id: string, data: Partial<Competition>) {
    const competitionDoc = doc(this.firestore, `competitions/${id}`);

    return updateDoc(competitionDoc, data);
  }

  deleteCompetition(id: string) {
    const competitionDoc = doc(this.firestore, `competitions/${id}`);

    return deleteDoc(competitionDoc);
  }
}
