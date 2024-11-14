import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from '@angular/fire/firestore';
import { HabitModel } from '../models/habit.model';
import { AuthService } from '../../../auth/services/auth.service';
import { switchMap, take, from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HabitService {
  // Injects the authentication service to get the current user's ID.
  private authService = inject(AuthService);
  // Reference to the "habits" collection in Firestore.
  private habitsCollection;

  constructor(private firestore: Firestore) {
    // Initializes the "habits" collection in Firestore.
    this.habitsCollection = collection(this.firestore, 'habits');
  }

  // Method to add a new habit.
  addHabit(habit: HabitModel) {
    // Gets the authenticated user's ID.
    const userId = this.authService.getUserId();

    // Throws an error if the user is not authenticated.
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Sets the user's ID in the habit before saving it.
    habit.userId = userId;
    // Adds the habit to the Firestore collection.
    return addDoc(this.habitsCollection, habit);
  }

  // Method to retrieve habits for the authenticated user.
  getUserHabits() {
    return this.authService.user$.pipe(
      // Takes the last emitted value from the observable (the user ID).
      take(1),
      // Switches to a query that returns the habits of the authenticated user.
      switchMap((userId) => {
        // Throws an error if the user is not authenticated.
        if (!userId) {
          throw new Error('User not authenticated');
        }
        // Creates a Firestore query to fetch the user's habits.
        const userHabitsQuery = query(
          this.habitsCollection,
          where('userId', '==', userId)
        );
        // Returns the documents from the query.
        return getDocs(userHabitsQuery);
      })
    );
  }

  // Method to retrieve a specific habit by its ID.
  async getHabitById(id: string): Promise<HabitModel & { userId: string }> {
    // Gets the authenticated user's ID.
    const userId = this.authService.getUserId();
    // Creates a reference to the habit document.
    const habitDoc = doc(this.habitsCollection, id);

    // Retrieves a snapshot of the document.
    const habitSnapshot = await getDoc(habitDoc);

    // Checks if the document exists.
    if (habitSnapshot.exists()) {
      const habitData = habitSnapshot.data() as HabitModel & { userId: string };

      // Verifies that the authenticated user owns the habit.
      if (habitData.userId === userId) {
        // Returns the habit data if the user is authorized.
        return habitData;
      } else {
        throw new Error('Unauthorized: You can only view your own habits.');
      }
    } else {
      throw new Error('Habit not found.');
    }
  }

  // Method to update a specific habit.
  async updateHabit(id: string, habit: Partial<HabitModel>) {
    // Gets the authenticated user's ID.
    const userId = this.authService.getUserId();
    // Creates a reference to the habit document.
    const habitDoc = doc(this.habitsCollection, id);
    // Retrieves a snapshot of the habit document.
    const habitSnapshot = await getDoc(habitDoc);

    // Checks if the habit exists and if the authenticated user owns it.
    if (habitSnapshot.exists() && habitSnapshot.data()['userId'] === userId) {
      // Updates the document in Firestore with the new data.
      return updateDoc(habitDoc, { ...habit });
    } else {
      throw new Error('Unauthorized: You can only edit your own habits.');
    }
  }

  // Method to delete a specific habit.
  deleteHabit(id: string): Observable<void> {
    // Gets the authenticated user's ID.
    const userId = this.authService.getUserId();
    // Creates a reference to the habit document.
    const habitDoc = doc(this.habitsCollection, id);

    // Uses a promise converted to an observable to perform the delete operation.
    return from(
      getDoc(habitDoc).then((habitSnapshot) => {
        // Checks if the habit exists and if the authenticated user owns it.
        if (
          habitSnapshot.exists() &&
          habitSnapshot.data()['userId'] === userId
        ) {
          // Deletes the document from Firestore.
          return deleteDoc(habitDoc);
        } else {
          throw new Error('Unauthorized: You can only delete your own habits.');
        }
      })
    );
  }
}
