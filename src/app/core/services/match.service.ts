import { Injectable, inject }
  from '@angular/core';

import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  updateDoc
} from '@angular/fire/firestore';

import { Observable }
  from 'rxjs';

import { Match }
  from '../interfaces/match.interface';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  private firestore =
    inject(Firestore);

  private matchesCollection =
    collection(
      this.firestore,
      'matches'
    );

  /* CREATE MATCH */

  addMatch(match: Match) {

    return addDoc(
      this.matchesCollection,
      match
    );

  }

  /* GET MATCHES */

  getMatches():
    Observable<Match[]> {

    return collectionData(
      this.matchesCollection,
      {
        idField: 'id'
      }
    ) as Observable<Match[]>;

  }

  /* UPDATE SCORE */

  updateMatchScore(
    matchId: string,
    scoreA: number,
    scoreB: number
  ) {

    const matchRef = doc(
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

}