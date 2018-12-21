import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { routing } from './dashboard.routing';
import { DashboardComponent } from './dashboard.component';
import { WidgetsModule } from '../../widgets/widgets.module';

@NgModule({
  imports: [
    CommonModule,
    routing,
    FormsModule,
    ReactiveFormsModule,
    WidgetsModule
  ],
  declarations: [
    DashboardComponent,
  ],
})

export class DashboardModule {}
