import { Component, OnInit, OnDestroy } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { SMS } from "@ionic-native/sms";
import { StorageService } from "../../app/services/util/storage.service";
import { Toast } from "@ionic-native/toast";
import { NativeStorage } from "@ionic-native/native-storage";
import { NavController, NavParams, Platform } from "ionic-angular";
import { SqliteService } from "../../app/services/util/sqlite.service";
import { DocuPic } from "../../model/docuPic";
import {
  BackgroundGeolocation,
  BackgroundGeolocationConfig,
  BackgroundGeolocationResponse,
} from "@ionic-native/background-geolocation";
import { RetrievalItemPage } from "../retrieval-item/retrieval-item.page";
import { HttpService } from "../../app/services/util/http.service";
import { NgZone } from "@angular/core";
import { SqlitePurchaseService } from "../../app/services/util/sqlite-purchase.service";
import { PurchaseItem } from "../../model/purchaseItem";
import { SqlitePurchaseEntryService } from "../../app/services/util/sqlite-purchase-entry.service";
import { PurchaseEntry } from "../../model/purchaseEntry";
import { PurchaseItemPage } from "../purchase-item/purchase-item.page";
import { SqlitePanelMainService } from "../../app/services/util/sqlite-panel-main.service";
import { PanelMain } from "../../model/panelMain";
import { SqliteDocuPicService } from "../../app/services/util/sqlite-docupic.service";
import { FTP } from "@ionic-native/ftp";
import { SqliteEOPService } from "../../app/services/util/sqlite-eop.service";
import { SqliteHHPService } from "../../app/services/util/sqlite-hhp.service";
import { EopPurchase } from "../../model/eopPurchase";
import { Irf } from "../../model/irf";
import { HhpPurchase } from "../../model/hhpPurchase";
import { File } from "@ionic-native/file";
import { Network } from "@ionic-native/network";
import { SummaryRetrievalPage } from "./summary-retrieval/summary-retrieval.page";
import { SummaryPeriodCodePage } from "./summary-period-code/summary-period-code.page";

declare var AdvancedGeolocation: any;

@Component({
  selector: "app-summary",
  templateUrl: "./summary.page.html",
})
export class SummaryPage implements OnInit {
  url = "http://api.uniserve.ph";
  // url = "http://10.0.2.2:3000";
  formPanel: FormGroup;
  isBarcodeScanned = false;
  location;
  irfObj;
  showBranchName = false;
  lastData;
  irdId;
  requests = []

  synching = false;
  exporting = false;
  selected;

  date_start;
  date_end;
  finame;
  connectedToNet = false;
  numberToSync;
  selectedSummaryTable;


  constructor(
    public navCtrl: NavController,
    private storage: StorageService,
    private nativeStorage: NativeStorage,
  ) {
  }

  ngOnInit() {
  }

  moveToRetrievalDate() {
    console.log("hello", this.selectedSummaryTable)
    this.nativeStorage.setItem('selectedSummaryTable', this.selectedSummaryTable).then(res => {
      this.navCtrl.push(SummaryRetrievalPage);
    })

  }

  moveToPeriodCode() {
    this.nativeStorage.setItem('selectedSummaryTable', this.selectedSummaryTable).then(res => {
      this.navCtrl.push(SummaryPeriodCodePage);
    })
  }

}

