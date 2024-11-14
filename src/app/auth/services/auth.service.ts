import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private currentUser = new BehaviorSubject<string | null>(null);

  constructor() {
    // Sets up a listener to update currentUser when the auth state changes
    onAuthStateChanged(this.auth, (user) => {
      if (typeof window !== 'undefined') {
        if (user) {
          localStorage.setItem('userId', user.uid);
          this.currentUser.next(user.uid);
        } else {
          localStorage.removeItem('userId');
          this.currentUser.next(null);
        }
      }
    });
  }

  // Exposes the current user as an observable, allowing other parts of the app to reactively track user state
  get user$() {
    return this.currentUser.asObservable();
  }

  // Registers a new user with email and password
  async register(user: UserModel): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, user.email, user.password)
      .then((credential) => {
        this.currentUser.next(credential.user.uid);
        return credential;
      })
      .catch((error) => {
        console.error('Registration error:', error);
        throw error;
      });
  }

  // Logs in a user with email and password
  async login(user: UserModel): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, user.email, user.password)
      .then((credential) => {
        this.currentUser.next(credential.user.uid);
        return credential;
      })
      .catch((error) => {
        console.error('Login error:', error);
        throw error;
      });
  }

  // Retrieves the current user's ID or null if not logged in
  getUserId() {
    return this.currentUser.value;
  }

  // Logs out the current user and updates currentUser to null
  async logout() {
    return signOut(this.auth).then(() => {
      this.currentUser.next(null);
    });
  }
}