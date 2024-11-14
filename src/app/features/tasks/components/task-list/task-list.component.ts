import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { AuthService } from '../../../../auth/services/auth.service';
import { TaskService } from '../../services/task.service';
import { TaskModel } from '../../models/task.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, NgClass],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css',
})
export default class TaskListComponent implements OnInit {
  isAuthenticated = false; // Tracks user authentication status
  tasks: TaskModel[] = []; // Stores all tasks of the user
  highPriorityTasks: TaskModel[] = []; // Stores tasks with high priority
  mediumPriorityTasks: TaskModel[] = []; // Stores tasks with medium priority
  lowPriorityTasks: TaskModel[] = []; // Stores tasks with low priority
  activeTab: 'high' | 'medium' | 'low' = 'high'; // Active tab for filtering tasks by priority
  errorMessage: string | null = null; // Holds error messages
  isLoading = true; // Indicates loading state for tasks

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Checks if the user is authenticated and loads tasks if true
    this.authService.user$.subscribe((userId) => {
      this.isAuthenticated = !!userId;

      if (this.isAuthenticated) {
        this.loadUserTasks(); // Loads the user's tasks if authenticated
      } else {
        this.errorMessage = 'User not authenticated'; // Shows error if not authenticated
      }
    });
  }

  // Loads the user's tasks by calling the task service
  loadUserTasks() {
    this.taskService.getUserTasks().subscribe({
      next: (snapshot) => {
        // Maps task data from the snapshot and stores it in the tasks array
        this.tasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as TaskModel),
        }));
        this.filterTasksByPriority(); // Filters tasks based on priority after loading
        this.isLoading = false; // Sets loading to false once tasks are loaded
      },
      error: (error) => {
        // Handles errors during task fetching
        this.errorMessage = error.message;
        console.error('Error while fetching tasks', error);
        this.isLoading = false; // Sets loading to false on error
      },
    });
  }

  // Filters the tasks by their priority and updates respective arrays
  filterTasksByPriority() {
    this.highPriorityTasks = this.tasks.filter((task) =>
      task.priority.includes('High')
    );
    this.mediumPriorityTasks = this.tasks.filter((task) =>
      task.priority.includes('Medium')
    );
    this.lowPriorityTasks = this.tasks.filter((task) =>
      task.priority.includes('Low')
    );
  }

  // Deletes a task and updates the task list
  deleteTask(taskId: string | undefined) {
    if (!taskId) {
      console.error('Task ID is undefined.');
      return;
    }

    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        // Filters out the deleted task from the list and updates the priority-based arrays
        this.tasks = this.tasks.filter((task) => task.id !== taskId);
        this.filterTasksByPriority(); // Re-filters tasks after deletion
      },
      error: (error) => {
        // Handles error during task deletion
        this.errorMessage = error.message;
        console.error('Error while deleting task', error);
      },
    });
  }
}