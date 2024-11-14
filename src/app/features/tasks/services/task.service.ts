import { inject, Injectable } from '@angular/core';
import { take, switchMap, from, Observable } from 'rxjs';
import {
  Firestore,
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from '@angular/fire/firestore';
import { TaskModel } from '../models/task.model';
import { AuthService } from '../../../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private authService = inject(AuthService); // Injecting the AuthService to get user data
  private tasksCollection; // Firestore collection reference for tasks

  constructor(private firestore: Firestore) {
    this.tasksCollection = collection(this.firestore, 'tasks'); // Reference to the "tasks" collection in Firestore
  }

  // Add a new task to the Firestore collection
  addTask(task: TaskModel) {
    const userId = this.authService.getUserId(); // Get the user ID from AuthService

    if (!userId) {
      throw new Error('User not authenticated'); // Throw error if user is not authenticated
    }

    task.userId = userId; // Associate the task with the authenticated user
    return addDoc(this.tasksCollection, task); // Add the task to Firestore
  }

  // Get tasks belonging to the authenticated user
  getUserTasks() {
    return this.authService.user$.pipe(
      // Get user ID from the AuthService observable
      take(1),
      switchMap((userId) => {
        if (!userId) {
          throw new Error('User not authenticated'); // Throw error if user is not authenticated
        }
        const userTasksQuery = query(
          this.tasksCollection,
          where('userId', '==', userId)
        ); // Query tasks for the specific user
        return getDocs(userTasksQuery); // Return tasks matching the userId
      })
    );
  }

  // Get a specific task by its ID
  async getTaskById(id: string) {
    const userId = this.authService.getUserId(); // Get the authenticated user ID
    const taskDoc = doc(this.tasksCollection, id); // Reference to the specific task document
    const taskSnapshot = await getDoc(taskDoc); // Fetch the task document

    if (taskSnapshot.exists()) {
      const taskData = taskSnapshot.data() as TaskModel & { userId: string };

      if (taskData.userId === userId) {
        return taskData; // Return task if it belongs to the authenticated user
      } else {
        throw new Error('Unauthorized: You can only view your own tasks.'); // Throw error if the task doesn't belong to the user
      }
    } else {
      throw new Error('Task not found.'); // Throw error if task does not exist
    }
  }

  // Update a task
  async updateTask(id: string, task: TaskModel) {
    const userId = this.authService.getUserId(); // Get the authenticated user ID
    const taskDoc = doc(this.tasksCollection, id); // Reference to the specific task document
    const taskSnapshot = await getDoc(taskDoc); // Fetch the task document

    if (taskSnapshot.exists() && taskSnapshot.data()['userId'] === userId) {
      const taskData = { ...task }; // Prepare updated task data
      return updateDoc(taskDoc, taskData); // Update the task in Firestore
    } else {
      throw new Error('Unauthorized: You can only edit your own tasks.'); // Throw error if task doesn't belong to the user
    }
  }

  // Delete a task
  deleteTask(id: string): Observable<void> {
    const userId = this.authService.getUserId(); // Get the authenticated user ID
    const taskDoc = doc(this.tasksCollection, id); // Reference to the specific task document

    return from(
      getDoc(taskDoc).then((taskSnapshot) => {
        if (taskSnapshot.exists() && taskSnapshot.data()['userId'] === userId) {
          return deleteDoc(taskDoc); // Delete the task if it belongs to the authenticated user
        } else {
          throw new Error('Unauthorized: You can only delete your own tasks.'); // Throw error if task doesn't belong to the user
        }
      })
    );
  }
}