import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  docData,
  updateDoc,
  deleteDoc,
  setDoc,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

import { Player } from '../interfaces/player.interface';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private firestore = inject(Firestore);

  private playersCollection = collection(this.firestore, 'players');

  async addPlayer(id: string, player: Player) {
    const playerRef = doc(this.firestore, `players/${id}`);
    return setDoc(playerRef, player);
  }

  getPlayers(): Observable<Player[]> {
    return collectionData(this.playersCollection, {
      idField: 'id',
    }) as Observable<Player[]>;
  }
  getPlayerById(id: string) {
    const playerDoc = doc(this.firestore, `players/${id}`);
    return docData(playerDoc, {
      idField: 'id',
    });
  }

  updatePlayer(id: string, data: any) {
    const playerDoc = doc(this.firestore, `players/${id}`);
    return updateDoc(playerDoc, data);
  }

  deletePlayer(id: string) {
    const playerDoc = doc(this.firestore, `players/${id}`);
    return deleteDoc(playerDoc);
  }

  updatePlayerStats(playerId: string, data: any) {
    const playerDoc = doc(this.firestore, `players/${playerId}`);
    return updateDoc(playerDoc, data);
  }
}
