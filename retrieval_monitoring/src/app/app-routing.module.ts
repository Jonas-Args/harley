import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'irf', pathMatch: 'full' },
  { path: 'list', loadChildren: './pages/list/list.module#ListPageModule' },
  { path: 'irf', loadChildren: './pages/irf/irf.module#irfPageModule' },
  { path: 'tagpanel', loadChildren: './pages/tagpanel/tagpanel.module#tagpanelPageModule' },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
