import { Injectable, inject }
from '@angular/core';

import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  query,
  where
} from '@angular/fire/firestore';

import { Observable }
from 'rxjs';

import { Rating }
from '../interfaces/rating.interface';

@Injectable({
  providedIn: 'root'
})
export class RatingService {

  private firestore =
    inject(Firestore);

  private ratingsCollection =
    collection(
      this.firestore,
      'ratings'
    );

  /* CREATE RATING */

  addRating(rating: Rating) {

    return addDoc(
      this.ratingsCollection,
      rating
    );

  }

  /* GET PLAYER RATINGS */

  getPlayerRatings(
    playerId: string
  ): Observable<Rating[]> {

    const ratingsQuery =
      query(
        this.ratingsCollection,
        where(
          'playerId',
          '==',
          playerId
        )
      );

    return collectionData(
      ratingsQuery,
      {
        idField: 'id'
      }
    ) as Observable<Rating[]>;

  }

  /* GET MATCH RATINGS */

  getMatchRatings(
    matchId: string
  ): Observable<Rating[]> {

    const ratingsQuery =
      query(
        this.ratingsCollection,
        where(
          'matchId',
          '==',
          matchId
        )
      );

    return collectionData(
      ratingsQuery,
      {
        idField: 'id'
      }
    ) as Observable<Rating[]>;

  }

}