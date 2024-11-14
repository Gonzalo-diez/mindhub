import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export default class SignInComponent {
  // Form group to manage the sign-in form fields and their validation states
  signInForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {
    // Initialize the form with fields for email and password, adding validation rules
    this.signInForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]], // Email field with required and email format validators
      password: ['', [Validators.required, Validators.minLength(6)]] // Password field with required and minimum length validators
    });
  }

  // Method to handle form submission
  onSubmit() {
    // Check if the form is valid before submitting
    if(this.signInForm.valid) {
      const { email, password } = this.signInForm.value;
      // Call register function from AuthService with provided email and password
      this.authService.register({ email, password })
        .then(() => {
          // Navigate to the home page on successful registration
          this.router.navigate(['/']);
        })
        .catch(error => {
          // Log the registration error in the console
          console.error("Registration error:", error);
        });
    } else {
      // Log an error message if the form is invalid
      console.error("Invalid form submission");
    }
  }
}