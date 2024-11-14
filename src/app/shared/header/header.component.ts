import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass, NgIf, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  isOpen = false; // Boolean to track whether the menu is open
  isDropdownOpen = false; // Boolean to track whether the dropdown menu is open
  isAuthenticated = false; // Boolean to track whether the user is authenticated

  constructor(private authService: AuthService, private router: Router) {}

  // On component initialization, subscribe to user authentication status
  ngOnInit() {
    // Subscribe to the user observable to check authentication status
    this.authService.user$.subscribe((userId) => {
      this.isAuthenticated = !!userId; // Set authentication status based on the user ID
    });
  }

  // Method to toggle the state of the main menu (open/close)
  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  // Method to toggle the state of the dropdown menu (open/close)
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen; // Toggle the dropdown menu state
  }

  // Method to handle user logout
  logout() {
    this.authService.logout().then(() => {
      // Navigate to the login page after successful logout
      this.router.navigate(['/auth/log-in']);
    });
  }
}