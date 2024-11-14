import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NoteService } from '../../services/note.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { NoteModel } from '../../models/note.model';

@Component({
  selector: 'app-add-note',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-note.component.html',
  styleUrl: './add-note.component.css',
})
export default class AddNoteComponent {
  // Property to track user authentication status
  isAuthenticated = false;

  // Note model, excluding userId, initialized with empty values
  note: Omit<NoteModel, 'userId'> = {
    title: '',
    content: '',
  };

  constructor(
    // Injects the NoteService for managing note data
    private noteService: NoteService,
    // Injects the AuthService for authentication handling
    private authService: AuthService
  ) {}

  // Method to add a new note
  addNote() {
    // Retrieves the authenticated user's ID
    const userId = this.authService.getUserId();

    // Checks if user is authenticated
    if (!userId) {
      console.error('User is not authenticated');
      return;
    }

    // Creates a note object that includes the userId
    const noteWithUserId: NoteModel = {
      ...this.note,
      userId: userId,
    };

    // Checks if the form fields are valid before saving
    if (this.isFormValid()) {
      // Adds the note to the service
      this.noteService
        .addNote(noteWithUserId)
        .then(() => {
          console.log('Note added successfully');
          // Clears the form after successfully adding the note
          this.clearForm();
        })
        .catch((error) => {
          console.error('Error adding task:', error);
        });
    } else {
      console.log('Please fill out all required fields');
    }
  }

  // Checks if all form fields are completed
  isFormValid(): boolean {
    return this.note.title !== '' && this.note.content !== '';
  }

  // Clears the form fields by resetting the note object
  clearForm() {
    this.note = {
      title: '',
      content: '',
    };
  }
}
