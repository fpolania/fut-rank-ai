import { Injectable, inject } from '@angular/core';

import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  user,
} from '@angular/fire/auth';

import { Timestamp } from '@angular/fire/firestore';

import { Router } from '@angular/router';
import { UserService } from './user.service';
import { of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private userService = inject(UserService);
  currentUser = user(this.auth).pipe(
    switchMap((firebaseUser) => {
      if (!firebaseUser) return of(null);
      return this.userService.getUserById(firebaseUser.uid);
    }),
  );

  async loginWithGoogle(player: any) {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const firebaseUser = result.user;
      await this.userService.createUser({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        role: player?.role || 'player',
        document: player?.document || '',
        active: true,
        createdAt: Timestamp.now(),
        isSuperAdmin: false,
      });

      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Login Error', error);
    }
  }

  /* LOGOUT */

  async logout() {
    try {
      await signOut(this.auth);

      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout Error', error);
    }
  }
}
