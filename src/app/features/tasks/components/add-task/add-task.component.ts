import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { TaskModel, TaskPriority, TaskStatus } from '../../models/task.model';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css',
})
export default class AddTaskComponent {
  isAuthenticated = false; // Tracks user authentication status
  priorities: TaskPriority[] = ['Low', 'Medium', 'High']; // Available task priority options
  statuses: TaskStatus[] = ['Pending', 'In Progress', 'Completed']; // Available task status options

  // Initial task model excluding userId as it will be added upon form submission
  task: Omit<TaskModel, 'userId'> = {
    title: '',
    description: '',
    priority: [],
    dueDate: null,
    status: [],
  };

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Checks user authentication status on component initialization
    this.authService.user$.subscribe((userId) => {
      this.isAuthenticated = !!userId;
    });
  }

  // Adds a task if the user is authenticated and form is valid
  addTask() {
    const userId = this.authService.getUserId();

    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    // Adds userId to the task object
    const taskWithUserId: TaskModel = {
      ...this.task,
      userId: userId,
    };

    // Validates form fields before submitting the task
    if (this.isFormValid()) {
      this.taskService
        .addTask(taskWithUserId)
        .then(() => {
          console.log('Task added successfully');
          this.clearForm(); // Clears the form after successful submission
        })
        .catch((error) => {
          console.error('Error adding task:', error);
        });
    } else {
      console.log('Please fill out all required fields.');
    }
  }

  // Checks if all required form fields are filled out
  isFormValid(): boolean {
    return (
      this.task.title !== '' &&
      this.task.description !== '' &&
      this.task.priority !== null &&
      this.task.dueDate !== null &&
      this.task.status !== null
    );
  }

  // Toggles selection of task priority
  togglePrioritySelection(priority: TaskPriority) {
    const index = this.task.priority.indexOf(priority);
    if (index === -1) {
      this.task.priority.push(priority);
    } else {
      this.task.priority.splice(index, 1);
    }
  }

  // Toggles selection of task status
  toggleStatusSelection(taskStatus: TaskStatus) {
    const index = this.task.status.indexOf(taskStatus);
    if (index === -1) {
      this.task.status.push(taskStatus);
    } else {
      this.task.status.splice(index, 1);
    }
  }

  // Clears the form fields after task submission or reset
  clearForm() {
    this.task = {
      title: '',
      description: '',
      priority: [],
      dueDate: null,
      status: [],
    };
  }
}