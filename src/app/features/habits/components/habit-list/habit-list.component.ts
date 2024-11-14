import {
  Component,
  OnInit,
  ViewChild,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { NgIf, NgFor, isPlatformBrowser, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { AuthService } from '../../../../auth/services/auth.service';
import { HabitService } from '../../services/habit.service';
import { HabitModel } from '../../models/habit.model';

@Component({
  selector: 'app-habit-list',
  standalone: true,
  imports: [NgIf, NgFor, BaseChartDirective, RouterLink, NgClass],
  templateUrl: './habit-list.component.html',
  styleUrl: './habit-list.component.css',
})
export default class HabitListComponent implements OnInit {
  activeTab: 'list' | 'charts' = 'list'; // Sets the active tab for the view
  isBrowser: boolean = false; // Determines if the code is running in the browser
  isAuthenticated = false; // Tracks if the user is authenticated
  habits: HabitModel[] = []; // Array to store user habits
  errorMessage: string | null = null; // Stores any error message

  // Chart.js config
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective; // Reference to the chart for manual updates
  public weeklyChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Weekly Habits',
        backgroundColor: '#42A5F5',
        borderColor: '#1E88E5',
        fill: true,
      },
    ],
  }; // Configures weekly habit data for the chart
  public dailyChartsData: {
    day: string;
    config: ChartConfiguration['data'];
  }[] = []; // Holds data for daily charts
  public weeklyChartType: ChartType = 'doughnut'; // Sets weekly chart type
  public dailyChartType: ChartType = 'doughnut'; // Sets daily chart type

  constructor(
    private habitService: HabitService, // Injects HabitService for accessing habit data
    private authService: AuthService, // Injects AuthService for authentication handling
    @Inject(PLATFORM_ID) platformId: Object // Injects platform ID to check if code runs in the browser
  ) {
    this.isBrowser = isPlatformBrowser(platformId); // Determines if code is running in a browser environment
  }

  ngOnInit(): void {
    this.authService.user$.subscribe((userId) => {
      // Subscribes to user authentication state
      this.isAuthenticated = !!userId;
      // Loads user habits if authenticated
      if (this.isAuthenticated) {
        this.loadUserHabits();
      } else {
        // Subscribes to user authentication state
        this.errorMessage = 'User not authenticated';
      }
    });
  }

  loadUserHabits() {
    this.habitService.getUserHabits().subscribe({
      next: (snapshot) => {
        // Maps document data to habits array
        this.habits = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as HabitModel),
        }));
        this.setupWeeklyChart(this.habits); // Sets up the weekly chart data
        this.setupDailyCharts(this.habits); // Sets up the daily charts data
      },
      error: (error) => {
        this.errorMessage = error.message; // Logs error message if data retrieval fails
        console.error('Error retrieving habits', error);
      },
    });
  }

  setupWeeklyChart(habits: HabitModel[]) {
    const totalMinutesInWeek = 7 * 1440; // Calculates total minutes in a week
    let habitPercentages: number[] = []; // Stores habit time percentages
    let habitLabels: string[] = []; // Stores labels for each habit
    let totalHabitTime = 0; // Tracks total time spent on habits

    habits.forEach((habit) => {
      const habitTimeInWeek = habit.timeAllocated * habit.days.length; // Total time spent on habit in a week
      totalHabitTime += habitTimeInWeek;

      const habitPercentage = (habitTimeInWeek / totalMinutesInWeek) * 100; // Calculates habit percentage
      habitPercentages.push(habitPercentage);
      habitLabels.push(habit.type);
    });

    const restOfWeekPercentage =
      100 - (totalHabitTime / totalMinutesInWeek) * 100; // Percentage for remaining time in the week
    habitPercentages.push(restOfWeekPercentage);
    habitLabels.push('Rest of the Week');

    this.weeklyChartData = {
      labels: habitLabels,
      datasets: [
        {
          data: habitPercentages,
          backgroundColor: [
            '#42A5F5',
            '#66BB6A',
            '#FFA726',
            '#FF7043',
            '#26C6DA',
            '#FFCA28',
            '#AB47BC',
            '#FFCC80',
          ],
          borderColor: '#1E88E5',
          fill: true,
        },
      ],
    };

    if (this.chart) {
      this.chart.update();
    }
  }

  setupDailyCharts(habits: HabitModel[]) {
    const daysOfWeek = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    daysOfWeek.forEach((day) => {
      const dayHabits = habits.filter((habit) =>
        habit.days.includes(day as any)
      ); // Filters habits for the day
      const totalHabitTime = dayHabits.reduce(
        (total, habit) => total + habit.timeAllocated,
        0
      ); // Total time for the day's habits
      const restOfDay = 1440 - totalHabitTime; // Remaining time in the day

      const habitPercentages = dayHabits.map(
        (habit) => (habit.timeAllocated / 1440) * 100
      ); // Percentage for each habit
      const restOfDayPercentage = (restOfDay / 1440) * 100; // Percentage for rest of the day

      const chartData = {
        labels: [...dayHabits.map((habit) => habit.type), 'Rest of the Day'],
        datasets: [
          {
            data: [...habitPercentages, restOfDayPercentage],
            label: `${day} Habits`,
            backgroundColor: [
              '#42A5F5',
              '#66BB6A',
              '#FFA726',
              '#FF7043',
              '#FFCC80',
            ],
            fill: true,
          },
        ],
      };

      this.dailyChartsData.push({ day, config: chartData });
    });
  }

  // Method to delete habit by ID and update charts
  deleteHabit(habitId: string | undefined) {
    if (!habitId) {
      console.error('Habit ID is undefined.');
      return;
    }

    this.habitService.deleteHabit(habitId).subscribe({
      next: () => {
        this.habits = this.habits.filter((habit) => habit.id !== habitId);

        this.setupWeeklyChart(this.habits);
        this.setupDailyCharts(this.habits);

        this.chart?.update();
      },
      error: (error) => {
        this.errorMessage = error.message;
        console.error('Error deleting habit', error);
      },
    });
  }
}
