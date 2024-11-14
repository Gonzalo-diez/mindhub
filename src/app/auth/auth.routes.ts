import { Routes } from "@angular/router";

export default [
    {
        path: 'sign-in',
        loadComponent: () => import('./components/sign-in/sign-in.component'),
    },
    {
        path: 'log-in',
        loadComponent: () => import('./components/log-in/log-in.component')
    },
] as Routes;