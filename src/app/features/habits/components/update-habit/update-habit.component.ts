import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { HabitService } from '../../services/habit.service';
import { HabitModel, Days } from '../../models/habit.model';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-update-habit',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './update-habit.component.html',
  styleUrls: ['./update-habit.component.css'],
})
export default class UpdateHabitComponent implements OnInit {
  updateHabitForm!: FormGroup; // Form to update habit data
  errorMessage: string | null = null; // Holds any error messages for display
  habitId!: string; // Holds the ID of the habit to be updated
  days: Days[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  constructor(
    private fb: FormBuilder,
    private habitService: HabitService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm(); // Initialize the form on component load
    this.route.paramMap.subscribe((params) => {
      this.habitId = params.get('id')!; // Retrieve habit ID from route parameters
      this.loadHabitData(); // Load data for the selected habit
    });
  }

  // Initializes the update form with required fields and validation
  initializeForm() {
    this.updateHabitForm = this.fb.group({
      type: ['', Validators.required], // Type of habit
      hours: [0, [Validators.required, Validators.min(0)]], // Hours for habit duration
      minutes: [
        0,
        [Validators.required, Validators.min(0), Validators.max(59)],
      ], // Minutes for habit duration
      days: this.fb.array(this.days.map(() => new FormControl(false))), // Checkbox array for days of the week
      percentageOfTotal: [0], // Percentage of total weekly time dedicated to the habit
    });
  }

  // Loads existing habit data to populate the form for editing
  loadHabitData() {
    this.habitService
      .getHabitById(this.habitId)
      .then((habit) => {
        // Check if the habit belongs to the authenticated user
        if (habit.userId === this.authService.getUserId()) {
          const duration = moment.duration(habit.timeAllocated, 'minutes');
          this.updateHabitForm.patchValue({
            type: habit.type,
            hours: duration.hours(),
            minutes: duration.minutes(),
          });

          // Populate day checkboxes based on existing habit data
          this.days.forEach((day, index) => {
            if (habit.days.includes(day)) {
              (this.updateHabitForm.get('days') as FormArray)
                .at(index)
                .setValue(true);
            }
          });

          // Update the calculated percentage of total time
          this.updatePercentageOfTotal();
        } else {
          this.errorMessage = 'Unauthorized';
        }
      })
      .catch((error) => {
        this.errorMessage = 'Error loading habit data.';
        console.error(error);
      });
  }

  // Handles checkbox changes for days and updates percentage of total time
  onCheckboxChange(index: number) {
    const daysArray = this.updateHabitForm.get('days') as FormArray;
    daysArray.at(index).setValue(!daysArray.at(index).value);
    this.updatePercentageOfTotal();
  }

  // Calculates and updates the percentage of the week dedicated to the habit
  updatePercentageOfTotal() {
    const totalMinutesInWeek = 7 * 1440; // Total minutes in a week
    const hours = this.updateHabitForm.get('hours')?.value || 0;
    const minutes = this.updateHabitForm.get('minutes')?.value || 0;
    const timeAllocated = moment.duration({ hours, minutes }).asMinutes();
    const selectedDaysCount = (
      this.updateHabitForm.get('days') as FormArray
    ).controls.filter((control) => control.value).length;

    const totalTimeForHabit = selectedDaysCount * timeAllocated;
    const percentage = (totalTimeForHabit / totalMinutesInWeek) * 100;

    this.updateHabitForm.get('percentageOfTotal')?.setValue(percentage);
  }

  // Submits the updated habit data
  onSubmit() {
    if (this.updateHabitForm.valid) {
      const selectedDays = this.days.filter(
        (_, i) => (this.updateHabitForm.get('days') as FormArray).at(i).value
      );
      const hours = this.updateHabitForm.get('hours')?.value || 0;
      const minutes = this.updateHabitForm.get('minutes')?.value || 0;
      const timeAllocated = moment.duration({ hours, minutes }).asMinutes();

      const habitData: HabitModel = {
        ...this.updateHabitForm.value,
        timeAllocated,
        days: selectedDays,
      };

      this.habitService
        .updateHabit(this.habitId, habitData)
        .then(() => {
          this.router.navigate(['/habits']);
        })
        .catch((error) => {
          if (error.message.includes('Unauthorized')) {
            this.errorMessage =
              'You do not have permission to edit this habit.';
          } else {
            this.errorMessage = 'Error updating the habit.';
          }
          console.error(error);
        });
    }
  }
}
