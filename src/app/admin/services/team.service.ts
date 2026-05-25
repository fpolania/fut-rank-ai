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

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private firestore = inject(Firestore);
  private teamsRef = collection(this.firestore, 'teams');

  createTeam(team: Team) {
    return addDoc(
      this.teamsRef,

      {
        ...team,

        createdAt: new Date(),

        updatedAt: new Date(),
      },
    );
  }

  getTeams(): Observable<Team[]> {
    return collectionData(
      this.teamsRef,

      {
        idField: 'id',
      },
    ) as Observable<Team[]>;
  }

  /* UPDATE */

  updateTeam(id: string, data: Partial<Team>) {
    const teamDoc = doc(this.firestore, `teams/${id}`);

    return updateDoc(
      teamDoc,

      {
        ...data,

        updatedAt: new Date(),
      },
    );
  }

  /* DELETE */

  deleteTeam(id: string) {
    const teamDoc = doc(this.firestore, `teams/${id}`);

    return deleteDoc(teamDoc);
  }
}
