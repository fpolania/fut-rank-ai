import { inject, Injectable } from '@angular/core';

import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  updateDoc,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { Team } from '../models/team.interface';
import { Subscription } from '../models/subscription.interface';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private firestore = inject(Firestore);
  private subscriptionsRef = collection(this.firestore, 'subscriptions');

  createSubscription(subscription: Subscription) {
    return addDoc(
      this.subscriptionsRef,

      {
        ...subscription,

        createdAt: new Date(),

        updatedAt: new Date(),
      },
    );
  }

  /* GET */

  getSubscriptions(): Observable<Subscription[]> {
    return collectionData(
      this.subscriptionsRef,

      {
        idField: 'id',
      },
    ) as Observable<Subscription[]>;
  }

  /* UPDATE */

  updateSubscription(id: string, data: Partial<Subscription>) {
    const subscriptionDoc = doc(
      this.firestore,

      `subscriptions/${id}`,
    );

    return updateDoc(
      subscriptionDoc,

      {
        ...data,

        updatedAt: new Date(),
      },
    );
  }

  /* DELETE */

  deleteSubscription(id: string) {
    const subscriptionDoc = doc(
      this.firestore,

      `subscriptions/${id}`,
    );

    return deleteDoc(subscriptionDoc);
  }

  /* =========================================================
    VALIDATIONS
  ========================================================= */

  /* PLAYERS */

  canCreatePlayer(team: Team, currentPlayers: number): boolean {
    return currentPlayers < (team.maxPlayers || 0);
  }

  /* VIDEOS */

  canUploadVideo(team: Team, currentVideos: number): boolean {
    return currentVideos < (team.maxVideos || 0);
  }

  /* IA */

  canGenerateAnalysis(team: Team, currentAnalysis: number): boolean {
    return currentAnalysis < (team.maxAnalysis || 0);
  }

  /* =========================================================
    SUBSCRIPTION STATUS
  ========================================================= */

  isSubscriptionActive(team: Team): boolean {
    if (!team.currentPeriodEnd) {
      return false;
    }

    const now = new Date();

    const endDate = new Date(team.currentPeriodEnd);

    return now <= endDate && team.subscriptionStatus === 'active';
  }
}
