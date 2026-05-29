import { Injectable, inject } from '@angular/core';

import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { TeamPlayer } from '../interfaces/teamPlayer.interface';

@Injectable({
  providedIn: 'root',
})
export class TeamPlayersService {
  private firestore = inject(Firestore);

  private teamPlayersRef = collection(this.firestore, 'team_players');
  getPlayers(teamId?: string): Observable<TeamPlayer[]> {

    const playersQuery = teamId
      ? query(
          this.teamPlayersRef,
          where('teamId', '==', teamId),
        )
      : query(
          this.teamPlayersRef,
          orderBy('createdAt', 'desc'),
        );
  
    return collectionData(playersQuery, {
      idField: 'id',
    }) as Observable<TeamPlayer[]>;
  }
  async createPlayer(player: TeamPlayer): Promise<void> {
    await addDoc(this.teamPlayersRef, {
      ...player,
      active: true,
      createdAt: new Date(),
    });
  }

  async updatePlayer(id: string, player: Partial<TeamPlayer>): Promise<void> {
    const playerDoc = doc(this.firestore, `team_players/${id}`);

    await updateDoc(playerDoc, {
      ...player,
    });
  }

  async deletePlayer(id: string): Promise<void> {
    const playerDoc = doc(this.firestore, `team_players/${id}`);
    await deleteDoc(playerDoc);
  }

  async getPlayerByDocument(
    documentNumber: string,
  ): Promise<TeamPlayer | null> {
    const playersRef = collection(this.firestore, 'team_players');

    const q = query(playersRef, where('document', '==', documentNumber));

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    return {
      id: snapshot.docs[0].id,

      ...snapshot.docs[0].data(),
    } as TeamPlayer;
  }
}
