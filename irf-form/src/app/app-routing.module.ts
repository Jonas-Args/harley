import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', loadChildren: './pages/list/list.module#ListPageModule' },
  { path: 'irf', loadChildren: './pages/irf/irf.module#irfPageModule' },
  { path: 'request', loadChildren: './pages/request/request.module#requestModule' },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
