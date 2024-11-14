import { Routes } from "@angular/router";

export const habitRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/habit-list/habit-list.component'),
    },
    {
        path: 'addHabit',
        loadComponent: () => import('./components/add-habit/add-habit.component'),
    },
    {
        path: 'updateHabit/:id',
        loadComponent: () => import('./components/update-habit/update-habit.component'),
    },
];