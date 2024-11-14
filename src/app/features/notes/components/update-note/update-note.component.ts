import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NoteService } from '../../services/note.service';
import { NoteModel } from '../../models/note.model';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-update-note',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './update-note.component.html',
  styleUrl: './update-note.component.css',
})
export default class UpdateNoteComponent implements OnInit {
  // Form for updating note information
  updateNoteForm!: FormGroup;

  // Stores error messages to display to the user
  errorMessage: string | null = null;

  // ID of the note being updated
  noteId!: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private noteService: NoteService,
    private authService: AuthService
  ) {}

  // Initializes form and loads note data when component is created
  ngOnInit(): void {
    this.initializeForm();
    this.route.paramMap.subscribe((params) => {
      // Retrieves the note ID from route parameters
      this.noteId = params.get('id')!;
      // Loads note data for the specified note ID
      this.loadNoteData();
    });
  }

  // Initializes the form with validation rules
  initializeForm() {
    this.updateNoteForm = this.fb.group({
      title: ['', Validators.required], // Title field is required
      content: ['', Validators.required], // Content field is required
    });
  }

  // Loads note data from the NoteService
  loadNoteData() {
    this.noteService
      .getNoteById(this.noteId)
      .then((note) => {
        // Verifies if the user has permission to access this note
        if (note.userId === this.authService.getUserId()) {
          // Populates the form fields with existing note data
          this.updateNoteForm.patchValue({
            title: note.title,
            content: note.content,
          });
        } else {
          // Sets an error message if the user is not authorized
          this.errorMessage = 'Unauthorized';
        }
      })
      .catch((error) => {
        // Handles errors if the note could not be loaded
        this.errorMessage = 'Error loading note.';
        console.error(error);
      });
  }

  // Submits the form to update the note
  onSubmit() {
    if (this.updateNoteForm.valid) {
      // Prepares the updated note data
      const noteData: NoteModel = {
        ...this.updateNoteForm.value,
      };

      // Calls the service to update the note
      this.noteService
        .updateNote(this.noteId, noteData)
        .then(() => {
          // Navigates to the notes list after a successful update
          this.router.navigate(['/notes']);
        })
        .catch((error) => {
          // Handles errors based on authorization or other issues
          if (error.message.includes('Unauthorized')) {
            this.errorMessage = 'You do not have permission to edit this note.';
          } else {
            this.errorMessage = 'Error updating the note.';
          }
          console.error(error);
        });
    }
  }
}