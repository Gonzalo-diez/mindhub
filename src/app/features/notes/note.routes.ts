import { Routes } from "@angular/router";

export const noteRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/note-list/note-list.component'),
    },
    {
        path: 'addNote',
        loadComponent: () => import('./components/add-note/add-note.component'),
    },
    {
        path: 'updateNote/:id',
        loadComponent: () => import('./components/update-note/update-note.component'),
    },
];