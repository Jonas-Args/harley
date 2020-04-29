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
import {
  MatSelectModule,
  MatInputModule,
  MatButtonModule,
  MatFormFieldModule,
  MatAutocompleteModule,
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
import { Base64 } from "@ionic-native/base64";
import { Network } from "@ionic-native/network";
import { ListPage } from "../pages/list/list.page";
import { RetrieveilFormPage } from "../pages/retrieval-form/retrieval-form.page";
import { SqliteService } from "./services/util/sqlite.service";
import { SQLite } from "@ionic-native/sqlite";
import { BackgroundGeolocation } from "@ionic-native/background-geolocation";
import { Home } from "../pages/home/home.page";
import { RetrievalItemPage } from "../pages/retrieval-item/retrieval-item.page";
import { PurchaseFormPage } from "../pages/purchase-form/purchase-form.page";
import { PurchaseItemPage } from "../pages/purchase-item/purchase-item.page";
import { SqlitePurchaseService } from "./services/util/sqlite-purchase.service";
import { SqlitePurchaseEntryService } from "./services/util/sqlite-purchase-entry.service";
import { PurchasePerDatePage } from "../pages/purchase-summary/per-date/purchase-per-date.page";
import { PurchasePerPeriodPage } from "../pages/purchase-summary/per-period/purchase-per-period.page";
import { RetrievalPerDatePage } from "../pages/retrieval-summary/per-date/retrieval-per-date.page";
import { RetrievalPerPeriodPage } from "../pages/retrieval-summary/per-period/retrieval-per-period.page";
import { MaintenancePage } from "../pages/maintenance/maintenance.page";
import { SqlitePanelMainService } from "./services/util/sqlite-panel-main.service";
import { SqliteDocuPicService } from "./services/util/sqlite-docupic.service";
import { FTP } from "@ionic-native/ftp";
import { DocupicItems } from "../pages/docupic-items/docupic-items.page";
import { SqliteEOPService } from "./services/util/sqlite-eop.service";
import { DocupicItemEop } from "../pages/docupic-item-eop/docupic-item-eop.page";
import { DocupicItemHhp } from "../pages/docupic-item-hhp/docupic-item-hhp.page";
import { SqliteHHPService } from "./services/util/sqlite-hhp.service";
import { DataSyncPage } from "../pages/data-sync/data-sync.page";
import { SignIn } from "../pages/sign-in/sign-in.page";

const APP_PROVIDERS = [
  CommonService,
  IncentiveService,
  StorageService,
  SqliteService,
  HttpService,
  IrfFormService,
  SqlitePurchaseService,
  SqlitePurchaseEntryService,
  SqlitePanelMainService,
  SqliteDocuPicService,
  SqliteEOPService,
  SqliteHHPService
];

@NgModule({
  declarations: [
    MyApp,
    RetrieveilFormPage,
    Home,
    ListPage,
    RetrievalItemPage,
    PurchaseFormPage,
    PurchaseItemPage,
    PurchasePerDatePage,
    PurchasePerPeriodPage,
    RetrievalPerDatePage,
    RetrievalPerPeriodPage,
    MaintenancePage,
    DocupicItems,
    DocupicItemEop,
    DocupicItemHhp,
    DataSyncPage,
    SignIn
  ],
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
    AutoCompleteModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    RetrieveilFormPage,
    Home,
    ListPage,
    RetrievalItemPage,
    PurchaseFormPage,
    PurchaseItemPage,
    PurchasePerDatePage,
    PurchasePerPeriodPage,
    RetrievalPerDatePage,
    RetrievalPerPeriodPage,
    MaintenancePage,
    DocupicItems,
    DocupicItemEop,
    DocupicItemHhp,
    DataSyncPage,
    SignIn
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BarcodeScanner,
    SMS,
    Camera,
    File,
    NativeStorage,
    Toast,
    FileOpener,
    FilePath,
    Base64,
    Network,
    SQLite,
    BackgroundGeolocation,
    SqlitePurchaseService,
    SqlitePurchaseEntryService,
    SqlitePanelMainService,
    SqliteDocuPicService,
    SqliteEOPService,
    SqliteHHPService,
    FTP,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ...APP_PROVIDERS,
  ],
})
export class AppModule { }
