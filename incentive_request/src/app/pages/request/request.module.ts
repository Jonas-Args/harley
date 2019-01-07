import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSelectModule, MatInputModule} from '@angular/material';

import { requestPage } from './request.page';

const routes: Routes = [
  {
    path: '',
    component: requestPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    MatAutocompleteModule,
    MatSelectModule,
    MatInputModule
  ],
  declarations: [requestPage]
})
export class requestModule {}
