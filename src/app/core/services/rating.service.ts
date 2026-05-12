import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  query,
  where,
  updateDoc,
  doc,
} from '@angular/fire/firestore';

import { map, Observable } from 'rxjs';

import { Rating } from '../interfaces/rating.interface';

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private firestore = inject(Firestore);

  private ratingsCollection = collection(this.firestore, 'ratings');

  /* CREATE RATING */

  addRating(rating: Rating) {
    return addDoc(this.ratingsCollection, rating);
  }

  /* GET PLAYER RATINGS */

  getPlayerRatings(playerId: string): Observable<Rating[]> {
    const ratingsQuery = query(
      this.ratingsCollection,
      where('playerId', '==', playerId),
    );

    return collectionData(ratingsQuery, {
      idField: 'id',
    }) as Observable<Rating[]>;
  }

  getMatchRatings(matchId: string): Observable<Rating[]> {
    const ratingsQuery = query(
      this.ratingsCollection,
      where('matchId', '==', matchId),
    );

    return collectionData(ratingsQuery, {
      idField: 'id',
    }) as Observable<Rating[]>;
  }
  getRatingByPlayerAndMatch(playerId: string, matchId: string) {
    const ratingsRef = collection(this.firestore, 'ratings');

    const q = query(
      ratingsRef,

      where('playerId', '==', playerId),

      where('matchId', '==', matchId),
    );

    return collectionData(q, {
      idField: 'id',
    }).pipe(map((ratings: any[]) => (ratings.length ? ratings[0] : null)));
  }
  updateRating(ratingId: string, data: any) {
    const ratingDoc = doc(this.firestore, `ratings/${ratingId}`);

    return updateDoc(ratingDoc, data);
  }
}
