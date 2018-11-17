import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'tagpanel', pathMatch: 'full' },
  { path: 'home', loadChildren: './pages/home/home.module#HomePageModule' },
  { path: 'new-item', loadChildren: './pages/new-item/new-item.module#NewItemPageModule' },
  { path: 'update-item', loadChildren: './pages/update-item/update-item.module#UpdateItemPageModule' },
  { path: 'tagpanel', loadChildren: './pages/tagpanel/tagpanel.module#tagpanelPageModule' },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
