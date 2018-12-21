import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './pages.routing';
import { PagesComponent } from './pages.component';
import { NoContentComponent } from './no-content/no-content.component';

const PAGES_COMPONENTS = [
  NoContentComponent
]

@NgModule({
  imports: [
    CommonModule, 
    routing
  ],
  declarations: [
    PagesComponent,
    ...PAGES_COMPONENTS
  ]
})

export class PagesModule {

}
