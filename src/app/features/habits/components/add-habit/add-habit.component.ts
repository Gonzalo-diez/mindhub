import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import * as moment from "moment";
import { HabitService } from '../../services/habit.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { HabitModel, Days } from '../../models/habit.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-habit',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './add-habit.component.html',
  styleUrl: './add-habit.component.css',
})
export default class AddHabitComponent {
  isAuthenticated = false; // Tracks if the user is authenticated
  days: Days[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]; // Array of days in the week for selection

  habit: Omit<HabitModel, 'userId'> = {
    type: '',
    days: [],
    timeAllocated: 0,
    percentageOfTotal: 0,
  };

  hours: number = 0; // Holds the number of hours for the habit, max 24 hours
  minutes: number = 0; // Holds the number of minutes for the habit, max 59 minutes

  constructor(
    private habitService: HabitService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to user authentication state to check if the user is logged in
    this.authService.user$.subscribe((userId) => {
      this.isAuthenticated = !!userId;
    });
  }

  addHabit() {
    // Get the user's ID
    const userId = this.authService.getUserId();

    // Log error and exit if user is not authenticated
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    // Add user ID to the habit data before submission
    const habitWithUserId: HabitModel = {
      ...this.habit,
      userId: userId,
    };

    // Check form validity before submitting data
    if (this.isFormValid()) {
      this.habitService
        .addHabit(habitWithUserId)
        .then(() => {
          console.log('Habit added successfully');
          this.clearForm(); // Clear the form after successful addition
        })
        .catch((error) => {
          console.error('Error adding habit:', error);
        });
    } else {
      console.log('Please fill out all required fields.');
    }
  }

  // Checks if all required fields in the form are filled
  isFormValid(): boolean {
    return (
      this.habit.type !== '' &&
      this.habit.days !== null &&
      this.habit.timeAllocated > 0 &&
      this.habit.percentageOfTotal > 0
    );
  };

  // Toggle the selection of a day of the week
  toggleDaySelection(day: Days) {
    const index = this.habit.days.indexOf(day);
    if (index === -1) {
      this.habit.days.push(day);
    } else {
      this.habit.days.splice(index, 1);
    }
    // Update the percentage of total time after changing day selection
    this.updatePercentageOfTotal();
  }

  // Update the habit's percentage of total weekly time based on selection
  updatePercentageOfTotal() {
    const totalHoursInWeek = 168;
    const timePerDay = this.habit.timeAllocated / 60;
    const totalTimeForHabit = this.habit.days.length * timePerDay;

    this.habit.percentageOfTotal = (totalTimeForHabit / totalHoursInWeek) * 100;
  }

  // Set the allocated time for the habit in minutes, with hours and minutes input
  setTimeAllocated(hours: number, minutes: number) {
    if (minutes > 59) {
      minutes = 59;
    }

    if (hours > 24) {
      hours = 24;
    }

    const totalMinutes = moment.duration({ hours, minutes }).asMinutes();
    this.habit.timeAllocated = totalMinutes;
    this.updatePercentageOfTotal();
  }

  // Retrieve and format the allocated time into hours and minutes
  getTimeAllocated() {
    const duration = moment.duration(this.habit.timeAllocated, 'minutes');
    return {
      hours: Math.floor(duration.asHours()),
      minutes: duration.minutes(),
    };
  }

  // Clear the form fields and reset inputs after adding a habit
  clearForm() {
    this.habit = {
      type: '',
      days: [],
      timeAllocated: 1,
      percentageOfTotal: 1,
    };
    this.hours = 0;
    this.minutes = 0;
    this.router.navigate(['/']); // Redirect to the homepage after clearing the form
  };
}