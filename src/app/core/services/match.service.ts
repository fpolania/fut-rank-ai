import {
  Injectable,
  inject
}
  from '@angular/core';

import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  docData,
  updateDoc,
  deleteDoc,
  query,
  where
}
  from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Match } from '../interfaces/match.interface';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  private firestore = inject(Firestore);
  private matchesCollection =
    collection(
      this.firestore,
      'matches'
    );

  addMatch(match: Match) {
    return addDoc(
      this.matchesCollection,
      match
    );
  }

  getMatches(teamId: string): Observable<Match[]> {
    const q = query(
      this.matchesCollection,
      where('teamId', '==', teamId)
    );
    return collectionData(q, {
      idField: 'id'
    }) as Observable<Match[]>;
  }
  getMatchById(id: string) {
    const matchDoc =
      doc(
        this.firestore,
        `matches/${id}`
      );
    return docData(
      matchDoc,
      {
        idField: 'id'
      }
    );

  }

  updateMatch(
    id: string,
    data: any
  ) {

    const matchRef =
      doc(
        this.firestore,
        `matches/${id}`
      );

    return updateDoc(
      matchRef,
      data
    );

  }
  updateMatchScore(
    matchId: string,
    scoreA: number,
    scoreB: number
  ) {
    const matchRef =
      doc(
        this.firestore,
        `matches/${matchId}`
      );
    return updateDoc(
      matchRef,
      {
        scoreA,
        scoreB
      }
    );
  }
  deleteMatch(id: string) {
    const matchRef =
      doc(
        this.firestore,
        `matches/${id}`
      );
    return deleteDoc(
      matchRef
    );
  }
}