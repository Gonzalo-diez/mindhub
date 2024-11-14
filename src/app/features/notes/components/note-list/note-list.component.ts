import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../../../auth/services/auth.service';
import { NoteService } from '../../services/note.service';
import { NoteModel } from '../../models/note.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.css',
})
export default class NoteListComponent implements OnInit {
  // Tracks user authentication status
  isAuthenticated = false;

  // Array to hold user's notes
  notes: NoteModel[] = [];

  // Stores any error messages for display
  errorMessage: string | null = null;

  constructor(
    private noteService: NoteService,
    private authService: AuthService
  ) {}

  // Initializes component and subscribes to user authentication state
  ngOnInit(): void {
    // Checks if the user is authenticated
    this.authService.user$.subscribe((userId) => {
      this.isAuthenticated = !!userId;

      // If authenticated, load the user's notes
      if (this.isAuthenticated) {
        this.loadUserNotes();
      } else {
        // Display an error message if the user is not authenticated
        this.errorMessage = 'User not authenticated';
      }
    });
  }

  // Loads the notes for the authenticated user
  loadUserNotes() {
    this.noteService.getUserNotes().subscribe({
      // Maps retrieved documents to NoteModel objects
      next: (snapshot) => {
        this.notes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as NoteModel),
        }));
      },
      // Handles errors if notes could not be retrieved
      error: (error) => {
        this.errorMessage = error.message;
        console.error('Error retrieving notes', error);
      },
    });
  }

  // Deletes a note by its ID
  deleteNote(noteId: string | undefined) {
    if (!noteId) {
      console.error('Note ID is undefined.');
      return;
    }

    this.noteService.deleteHabit(noteId).subscribe({
      // Updates notes array after successful deletion
      next: () => {
        this.notes = this.notes.filter((note) => note.id !== noteId);
      },
      // Handles errors if the note could not be deleted
      error: (error) => {
        this.errorMessage = error.message;
        console.error('Error deleting the note', error);
      },
    });
  }
}
