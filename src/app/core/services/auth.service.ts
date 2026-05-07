import {
  Injectable,
  inject
} from '@angular/core';

import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  user
} from '@angular/fire/auth';

import {
  Timestamp
} from '@angular/fire/firestore';

import {
  Router
} from '@angular/router';
import { UserService } from './user.service';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /* INJECTS */

  private auth =
    inject(Auth);

  private router =
    inject(Router);

  private userService =
    inject(UserService);

  /* CURRENT USER */

  currentUser =
    user(this.auth);

  /* LOGIN GOOGLE */

  async loginWithGoogle() {

    try {

      const provider =
        new GoogleAuthProvider();

      const result =
        await signInWithPopup(
          this.auth,
          provider
        );

      const firebaseUser =
        result.user;

      /* SAVE USER IN FIRESTORE */
debugger
      await this.userService
        .createUser({

          uid:
            firebaseUser.uid,

          name:
            firebaseUser.displayName || '',

          email:
            firebaseUser.email || '',

          photoURL:
            firebaseUser.photoURL || '',

          role:
            'player',

          active:
            true,

          createdAt:
            Timestamp.now()

        });

      /* REDIRECT */

      this.router.navigate([
        '/dashboard'
      ]);

    } catch (error) {

      console.error(
        'Login Error',
        error
      );

    }

  }

  /* LOGOUT */

  async logout() {

    try {

      await signOut(
        this.auth
      );

      this.router.navigate([
        '/login'
      ]);

    } catch (error) {

      console.error(
        'Logout Error',
        error
      );

    }

  }

}