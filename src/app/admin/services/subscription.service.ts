import { inject, Injectable } from '@angular/core';

import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';

import { BehaviorSubject, Observable } from 'rxjs';
import { Team } from '../models/team.interface';
import { Subscription } from '../models/subscription.interface';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private firestore = inject(Firestore);
  private subscriptionsRef = collection(this.firestore, 'subscriptions');

  private currentSubscription: Subscription | null = null;

  private subscriptionSubject = new BehaviorSubject<Subscription | null>(null);

  currentSubscription$ = this.subscriptionSubject.asObservable();

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

  getSubscriptions(): Observable<Subscription[]> {
    return collectionData(
      this.subscriptionsRef,

      {
        idField: 'id',
      },
    ) as Observable<Subscription[]>;
  }

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

  deleteSubscription(id: string) {
    const subscriptionDoc = doc(
      this.firestore,

      `subscriptions/${id}`,
    );

    return deleteDoc(subscriptionDoc);
  }

  canCreatePlayer(subscription: Subscription, currentPlayers: number): boolean {
    return currentPlayers < (subscription.maxPlayers ?? 0);
  }

  canUploadVideo(subscription: Subscription, currentVideos: number): boolean {
    return currentVideos < (subscription.maxVideos ?? 0);
  }

  canGenerateAnalysis(
    subscription: Subscription,
    currentAnalysis: number,
  ): boolean {
    return currentAnalysis < (subscription.maxAnalysis ?? 0);
  }

  isSubscriptionActive(subscription: Subscription): boolean {
    if (!subscription.currentPeriodEnd) {
      return false;
    }
    const now = new Date();
    const endDate = new Date(subscription.currentPeriodEnd);
    return now <= endDate && subscription.status === 'active';
  }
  async getSubscriptionByTeamId(teamId: string): Promise<Subscription | null> {
    try {
      const q = query(this.subscriptionsRef, where('teamId', '==', teamId));
      const response = await getDocs(q);
      if (response.empty) {
        return null;
      }

      const doc = response.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as Subscription;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  setCurrentSubscription(subscription: Subscription) {
    this.currentSubscription = subscription;

    this.subscriptionSubject.next(subscription);
  }
  getCurrentSubscription(): Subscription | null {
    return this.currentSubscription;
  }
  validateAccess(subscription: Subscription | null): string | null {
    if (!subscription) {
      return 'No se encontró una suscripción para tu equipo.';
    }

    if (subscription.status === 'cancelled') {
      return 'Tu suscripción fue cancelada.';
    }

    if (subscription.status !== 'active') {
      return 'Tu suscripción está inactiva.';
    }

    const now = new Date();

    if (!subscription.currentPeriodEnd) {
      return 'No existe fecha de vencimiento.';
    }

    const endDate = new Date(
      (subscription.currentPeriodEnd as any).seconds * 1000,
    );

    if (now > endDate) {
      return `Tu suscripción venció el ${endDate.toLocaleDateString('es-CO')}.`;
    }

    return null;
  }
}
