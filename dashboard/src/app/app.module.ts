import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { routing } from './app.routing';
import { PagesModule } from './components/pages/pages.module';
import { WidgetsModule } from './components/widgets/widgets.module';
import { TagPanelService } from './services/api/tagpanel.service';
import { HttpService } from './services/util/http.service';
import { CommonService } from './services/util/common.service';
import { HttpClientModule } from '@angular/common/http';

const APP_PROVIDERS = [
  CommonService,
  HttpService,
  TagPanelService
]


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    PagesModule,
    WidgetsModule,
    HttpClientModule,
    routing
  ],
  providers: [...APP_PROVIDERS],
  bootstrap: [AppComponent]
})
export class AppModule { }
