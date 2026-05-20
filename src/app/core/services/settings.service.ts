import { inject, Injectable } from '@angular/core';

import {
  doc,
  Firestore,
  getDoc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class TeamSettingsService {
  private firestore = inject(Firestore);

  async getTeamSettings() {
    const settingsRef = doc(this.firestore, 'settings', 'team');
    const snapshot = await getDoc(settingsRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }

    return null;
  }

  async saveTeamSettings(teamName: string) {
    const settingsRef = doc(this.firestore, 'settings', 'team');
    const snapshot = await getDoc(settingsRef);
    if (snapshot.exists()) {
      await updateDoc(settingsRef, {
        name: teamName,
        updatedAt: new Date(),
      });

      return;
    }

    await setDoc(settingsRef, {
      name: teamName,
      createdAt: new Date(),
    });
  }
}
