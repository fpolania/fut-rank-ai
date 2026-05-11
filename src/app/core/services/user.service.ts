import { Injectable, inject } from '@angular/core';

import { Firestore, doc, setDoc, docData } from '@angular/fire/firestore';

import { Observable } from 'rxjs';

import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);

  /* CREATE USER */

  async createUser(user: User) {
    const userRef = doc(this.firestore, `users/${user.uid}`);

    return setDoc(userRef, user);
  }

  getUserById(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);

    return docData(userRef) as Observable<User>;
  }

  getUser(uid: string): Observable<User> {
    const userRef = doc(this.firestore, `users/${uid}`);

    return docData(userRef, {
      idField: 'uid',
    }) as Observable<User>;
  }
}
