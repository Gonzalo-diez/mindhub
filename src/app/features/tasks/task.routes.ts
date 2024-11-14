import { Routes } from "@angular/router";

export const taskRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/task-list/task-list.component'),
    },
    {
        path: 'addTask',
        loadComponent: () => import('./components/add-task/add-task.component'),
    },
    {
        path: 'updateTask/:id',
        loadComponent: () => import('./components/update-task/update-task.component'),
    },
];