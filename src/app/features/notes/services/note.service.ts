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
import { from, switchMap, take, Observable } from 'rxjs';
import { NoteModel } from '../models/note.model';
import { AuthService } from '../../../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  // Injecting the AuthService to handle user authentication
  private authService = inject(AuthService);
  private notesCollection;

  constructor(private firestore: Firestore) {
    // Setting up the Firestore collection for notes
    this.notesCollection = collection(this.firestore, 'notes');
  }

  // Adds a new note to the Firestore collection for the authenticated user
  addNote(note: NoteModel) {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Setting the userId on the note before saving it
    note.userId = userId;
    return addDoc(this.notesCollection, note);
  }

  // Retrieves notes for the currently authenticated user
  getUserNotes() {
    return this.authService.user$.pipe(
      take(1),
      switchMap((userId) => {
        if (!userId) {
          throw new Error('User not authenticated');
        }
        // Query to get notes specific to the user
        const userNotesQuery = query(
          this.notesCollection,
          where('userId', '==', userId)
        );
        return getDocs(userNotesQuery);
      })
    );
  }

  // Fetches a note by its ID and checks if the user has permission to view it
  async getNoteById(id: string) {
    const userId = this.authService.getUserId();
    const noteDoc = doc(this.notesCollection, id);
    const noteSnapshot = await getDoc(noteDoc);

    if (noteSnapshot.exists()) {
      const noteData = noteSnapshot.data() as NoteModel & { userId: string };

      // Verifies that the note belongs to the authenticated user
      if (noteData.userId === userId) {
        return noteData;
      } else {
        throw new Error('Unauthorized: You can only view your own notes.');
      }
    } else {
      throw new Error('Note not found.');
    }
  }

  // Updates an existing note if the authenticated user has permission
  async updateNote(id: string, note: NoteModel) {
    const userId = this.authService.getUserId();
    const noteDoc = doc(this.notesCollection, id);
    const noteSnapshot = await getDoc(noteDoc);

    // Checks if the note exists and if the user owns it before updating
    if (noteSnapshot.exists() && noteSnapshot.data()['userId'] === userId) {
      const noteData = { ...note };
      return updateDoc(noteDoc, noteData);
    } else {
      throw new Error('Unauthorized: You can only edit your own notes.');
    }
  }

  // Deletes a note if the authenticated user has permission
  deleteHabit(id: string): Observable<void> {
    const userId = this.authService.getUserId();
    const noteDoc = doc(this.notesCollection, id);

    return from(
      getDoc(noteDoc).then((habitSnapshot) => {
        // Checks if the note exists and if the user owns it before deleting
        if (
          habitSnapshot.exists() &&
          habitSnapshot.data()['userId'] === userId
        ) {
          return deleteDoc(noteDoc);
        } else {
          throw new Error('Unauthorized: You can only delete your own habits.');
        }
      })
    );
  }
}
