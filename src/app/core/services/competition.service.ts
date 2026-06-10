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
  getDocs,
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

  async deleteCompetition(
    competitionId: string,
    teamId: string,
  ): Promise<void> {
    const competitionsRef = collection(this.firestore, 'competitions');

    const q = query(
      competitionsRef,
      where('id', '==', competitionId),
      where('teamId', '==', teamId),
    );

    const snapshot = await getDocs(q);
    snapshot.forEach(async (docSnap) => {
      await deleteDoc(docSnap.ref);
    });
  }
}
