import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
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

  
  getCompetitions(teamId: string): Observable<Competition[]> {
    const q = teamId
      ? query(this.competitionCollection, where('teamId', '==', teamId))
      : this.competitionCollection;
  
    return collectionData(q, {
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
