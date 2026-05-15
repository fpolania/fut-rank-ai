import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  collectionData,
  doc,
  updateDoc,
  Timestamp,
  deleteDoc,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

import { TeamApplication } from '../interfaces/team-application.interface';

import { PlayerService } from './player.service';

@Injectable({
  providedIn: 'root',
})
export class TeamApplicationService {
  private firestore = inject(Firestore);

  private playerService = inject(PlayerService);

  getApplications(): Observable<TeamApplication[]> {
    const applicationsRef = collection(this.firestore, 'team-applications');
    return collectionData(applicationsRef, {
      idField: 'id',
    }) as Observable<TeamApplication[]>;
  }

  async approveApplication(application: TeamApplication) {
    const applicationRef = doc(
      this.firestore,
      `team-applications/${application.id}`,
    );
    await updateDoc(applicationRef, {
      status: 'approved',
    });

    await this.playerService.addPlayer(application.number, {
      name: application.name,
      age: application.age,
      position: application.position,
      preferredFoot: application.foot,
      number: application.number,
      photo:
        'https://firebasestorage.googleapis.com/v0/b/fut-rank-ai.firebasestorage.app/o/WhatsApp%20Image%202026-05-11%20at%205.19.16%20PM.jpeg?alt=media&token=eed667c6-d83a-4256-a62f-072cba204f6b',
      goals: 0,
      assists: 0,
      matchesPlayed: 0,
      averageRating: 0,
      mvps: 0,
      speed: 50,
      stamina: 50,
      vision: 50,
      finishing: 50,
      defense: 50,
      dribbling: 50,
      active: true,
      createdAt: Timestamp.now(),
    });
  }

  async updateStatus(id: string, status: string) {
    const applicationRef = doc(this.firestore, `team-applications/${id}`);
    if (status === 'approved') {
      return await deleteDoc(applicationRef);
    }
    return await updateDoc(applicationRef, {
      status,
    });
  }
}
