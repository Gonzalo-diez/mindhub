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
import { TaskService } from '../../services/task.service';
import { TaskModel, TaskPriority, TaskStatus } from '../../models/task.model';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-update-task',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, NgFor],
  templateUrl: './update-task.component.html',
  styleUrls: ['./update-task.component.css'],
})
export default class UpdateTaskComponent implements OnInit {
  updateTaskForm!: FormGroup; // Form to handle task update data
  taskId!: string; // Holds the task ID
  priority: TaskPriority[] = ['Low', 'Medium', 'High']; // List of task priorities
  status: TaskStatus[] = ['Pending', 'In Progress', 'Completed']; // List of task statuses
  errorMessage: string | null = null; // Holds error messages

  constructor(
    private taskService: TaskService, // Injecting TaskService to interact with tasks
    private router: Router, // Injecting Router to navigate after submitting the form
    private route: ActivatedRoute, // To read route parameters (task ID)
    private fb: FormBuilder, // Injecting FormBuilder to create reactive forms
    private authService: AuthService // Injecting AuthService to verify the user
  ) {}

  ngOnInit(): void {
    this.initializeForm(); // Initializes the update form
    // Subscribe to route parameter changes to get taskId from URL
    this.route.paramMap.subscribe((params) => {
      this.taskId = params.get('id')!; // Retrieve task ID from URL
      this.loadTaskData(); // Loads the data for the task to be updated
    });
  }

  // Initializes the form group with necessary controls
  initializeForm() {
    this.updateTaskForm = this.fb.group({
      title: ['', Validators.required], // Title of the task
      description: ['', Validators.required], // Description of the task
      priority: this.fb.array(this.priority.map(() => new FormControl(false))), // Priority checkboxes
      dueDate: [new Date(), Validators.required], // Due date for the task
      completed: [false], // Task completion status
      status: this.fb.array(this.status.map(() => new FormControl(false))), // Status checkboxes
    });
  }

  // Loads the task data for the specified taskId
  loadTaskData() {
    this.taskService
      .getTaskById(this.taskId)
      .then((task) => {
        // Check if the task belongs to the authenticated user
        if (task.userId === this.authService.getUserId()) {
          // Pre-fill form fields with existing task data
          this.updateTaskForm.patchValue({
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
          });

          // Set the correct priority checkboxes based on the task data
          this.priority.forEach((priority, index) => {
            if (task.priority.includes(priority)) {
              (this.updateTaskForm.get('priority') as FormArray)
                .at(index)
                .setValue(true);
            }
          });

          // Set the correct status checkboxes based on the task data
          this.status.forEach((status, index) => {
            if (task.status.includes(status)) {
              (this.updateTaskForm.get('status') as FormArray)
                .at(index)
                .setValue(true);
            }
          });
        } else {
          // If the user does not own the task, show unauthorized error message
          this.errorMessage = 'Unauthorized';
        }
      })
      .catch((error) => {
        // Handle errors while loading the task data
        this.errorMessage = 'Error to load task.';
        console.error(error);
      });
  }

  // Handles checkbox change for priority selection
  onCheckboxChangePriority(index: number) {
    const priorityArray = this.updateTaskForm.get('priority') as FormArray;
    priorityArray.at(index).setValue(!priorityArray.at(index).value);
  }

  // Handles checkbox change for status selection
  onCheckboxChangeStatus(index: number) {
    const statusArray = this.updateTaskForm.get('status') as FormArray;
    statusArray.at(index).setValue(!statusArray.at(index).value);
  }

  // Handles form submission for updating the task
  onSubmit() {
    if (this.updateTaskForm.valid) {
      // Filter selected priorities and statuses based on checkbox values
      const selectedPriority = this.priority.filter(
        (_, i) => (this.updateTaskForm.get('priority') as FormArray).at(i).value
      );
      const selectedStatus = this.status.filter(
        (_, i) => (this.updateTaskForm.get('status') as FormArray).at(i).value
      );

      // Prepare the updated task data
      const taskData: TaskModel = {
        ...this.updateTaskForm.value,
        priority: selectedPriority,
        status: selectedStatus,
      };

      // Call the task service to update the task
      this.taskService
        .updateTask(this.taskId, taskData)
        .then(() => {
          // Navigate to the task list page upon successful update
          this.router.navigate(['/tasks']);
        })
        .catch((error) => {
          // Handle error if the task update fails
          if (error.message.includes('Unauthorized')) {
            this.errorMessage = 'Access denied to update task, unauthorized user.'; // Unauthorized error
          } else {
            this.errorMessage = 'Error to update the task.'; // General error
          }
          console.error(error);
        });
    }
  }
}