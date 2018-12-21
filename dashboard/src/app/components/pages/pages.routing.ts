import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

export const routes: Routes = [
  { 
    path: '',
    loadChildren: './dashboard/dashboard.module#DashboardModule'
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, { useHash: false });
