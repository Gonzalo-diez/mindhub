import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    {
        path: 'home',
        loadChildren: () => import('./features/home/home.routes'),
    },
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes'),
    },
    {
        path: 'habits',
        loadChildren: () => import('./features/habits/habit.routes').then(m => m.habitRoutes),
    },
    {
        path: 'notes',
        loadChildren: () => import('./features/notes/note.routes').then(m => m.noteRoutes),
    },
    {
        path: 'tasks',
        loadChildren: () => import('./features/tasks/task.routes').then(m => m.taskRoutes),
    }
];
