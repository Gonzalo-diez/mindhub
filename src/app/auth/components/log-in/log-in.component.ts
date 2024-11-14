import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export default class SignInComponent {
  // Form group for login form fields and validations
  logInForm: FormGroup;
  // Variable to store login error message
  loginError: string | null = null;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {
    // Initialize the form with email and password fields, adding validation
    this.logInForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Method to handle form submission
  onSubmit() {
    // Check if the form is valid before submitting
    if(this.logInForm.valid) {
      const { email, password } = this.logInForm.value;
      // Call login function from AuthService with provided email and password
      this.authService.login({ email, password })
      .then(() => {
        // Reset any existing login error and navigate to the home page on successful login
        this.loginError = null;
        this.router.navigate(['/']);
      })
      .catch(error => {
        // Log the error in the console and set the login error message for the UI
        console.error("Error de login:", error);
        this.loginError = "Invalid email or password";
      });
    } else {
      // Log an error message if the form is invalid
      console.error("Formulario inválido");
    }
  }
}
