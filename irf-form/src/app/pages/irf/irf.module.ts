import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSelectModule, MatInputModule} from '@angular/material';

import { irfPage } from './irf.page';

const routes: Routes = [
  {
    path: '',
    component: irfPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    HttpClientModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatInputModule
  ],
  declarations: [irfPage]
})
export class irfPageModule {}
