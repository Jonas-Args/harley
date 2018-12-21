import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MapComponent } from './map/map.component';

const SHARED_COMPONENTS = [
  MapComponent
];

const THIRD_PARTY_COMPONENTS = [
];

@NgModule({
  declarations: [
    ...SHARED_COMPONENTS,
    ...THIRD_PARTY_COMPONENTS,
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    ...SHARED_COMPONENTS,
  ],
})

export class WidgetsModule {}
