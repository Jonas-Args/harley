import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { MyApp } from "./app.component";

import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { SMS } from "@ionic-native/sms";
import { NativeStorage } from "@ionic-native/native-storage";
import { Camera } from "@ionic-native/camera";
import { File } from "@ionic-native/file";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";

import {
  MatSelectModule,
  MatInputModule,
  MatButtonModule,
  MatFormFieldModule,
  MatAutocompleteModule
} from "@angular/material";
import { Toast } from "@ionic-native/toast";
import { FileOpener } from "@ionic-native/file-opener";
import { CommonService } from "./services/util/common.service";
import { IncentiveService } from "./services/api/Incentive.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { StorageService } from "./services/util/storage.service";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AutoCompleteModule } from "ionic2-auto-complete";
import { FilePath } from "@ionic-native/file-path";
import { HttpService } from "./services/util/http.service";
import { IrfFormService } from "./services/api/irf-form.service";
import { SqliteService } from "./services/api/sqlite.service";
import { Base64 } from "@ionic-native/base64";
import { Network } from "@ionic-native/network";
import { ListPage } from "../pages/list/list.page";
import { tagpanelPage } from "../pages/tagpanel/tagpanel.page";
import { CsvService } from "./services/util/csv.service";
import { Home } from "../pages/home/home.page";
import { Retrieval } from "../pages/retrieval/retrieval.page";

const APP_PROVIDERS = [
  CommonService,
  IncentiveService,
  StorageService,
  HttpService,
  IrfFormService,
  CsvService,
  SqliteService
];

@NgModule({
  declarations: [MyApp, Retrieval, Home, ListPage, tagpanelPage],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    BrowserAnimationsModule,
    AutoCompleteModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [MyApp, Retrieval, Home, ListPage, tagpanelPage],
  providers: [
    StatusBar,
    SplashScreen,
    BarcodeScanner,
    SMS,
    Camera,
    File,
    NativeStorage,
    SQLite,
    Toast,
    FileOpener,
    FilePath,
    Base64,
    Network,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ...APP_PROVIDERS
  ]
})
export class AppModule {}
