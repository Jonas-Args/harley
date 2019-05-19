import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, RouteReuseStrategy, Routes } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { SMS } from '@ionic-native/sms/ngx';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { CommonService } from './services/util/common.service';
import { HttpService } from './services/util/http.service';
import { IncentiveService } from './services/api/Incentive.service';
import { HttpClientModule } from '@angular/common/http';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSelectModule, MatInputModule} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Camera } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/File/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
const APP_PROVIDERS = [
  CommonService,
  HttpService,
  IncentiveService
]

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, MatAutocompleteModule,BrowserAnimationsModule,MatSelectModule,MatInputModule, FormsModule,
    ReactiveFormsModule],
  providers: [
    StatusBar,
    SplashScreen,
    BarcodeScanner,
    SMS,
    SQLite,
    Toast,
    Camera,
    File,
    WebView,
    FilePath,
    NativeStorage,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ...APP_PROVIDERS
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
