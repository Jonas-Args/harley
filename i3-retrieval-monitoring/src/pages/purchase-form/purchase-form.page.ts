import { Component, OnInit, OnDestroy } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { SMS } from "@ionic-native/sms";
import { StorageService } from "../../app/services/util/storage.service";
import { Toast } from "@ionic-native/toast";
import { NativeStorage } from "@ionic-native/native-storage";
import { NavController, NavParams, Platform } from "ionic-angular";
import { SqliteService } from "../../app/services/util/sqlite.service";
import { Irf } from "../../model/irf";
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
import { DocupicItems } from "../docupic-items/docupic-items.page";
declare var AdvancedGeolocation: any;

@Component({
  selector: "app-purchase-form",
  templateUrl: "./purchase-form.page.html",
})
export class PurchaseFormPage implements OnInit {
  url = "http://api.uniserve.ph";
  // url = "http://10.0.2.2:3000";
  formPanel: FormGroup;
  isBarcodeScanned = false;
  location;
  irfObj;
  showBranchName = false;
  lastData;
  irdId;
  requests;

  csvData: any[] = [];
  headerRow: any[] = [];
  loadingLookupTable = false;

  constructor(
    private barcodeScanner: BarcodeScanner,
    private sms: SMS,
    private storage: StorageService,
    private fb: FormBuilder,
    private toast: Toast,
    private nativeStorage: NativeStorage,
    public navCtrl: NavController,
    private sqliteService: SqliteService,
    private backgroundGeolocation: BackgroundGeolocation,
    private platform: Platform,
    private httpService: HttpService,
    private zone: NgZone,
    private sqlitePurchaseEntryService: SqlitePurchaseEntryService,
  ) {
    this.initForm();
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.getAllData();
    });
  }
  handleError(err) {
    console.log("something went wrong: ", err);
  }

  save_last_saved() {
    if (!!this.lastData) {
      let last_data = new PurchaseEntry(
        Object.assign(this.lastData, this.formPanel.value)
      );
      console.log("with last data", last_data);
      this.sqlitePurchaseEntryService.editData(last_data).then(
        (data: any) => {
          console.log("retrieved new data", data);
        },
        (error) => console.error("Error storing item", error)
      );
    } else {
      console.log("adding last data", this.lastData);
      let last_data = new PurchaseEntry(this.formPanel.value);
      last_data.last = 1;

      this.sqlitePurchaseEntryService.addData(last_data).then(
        (data: any) => {
          console.log("retrieved last data", data);
        },
        (error) => console.error("Error storing item", error)
      );
    }
  }

  initForm() {
    this.formPanel = this.fb.group({
      year: ["", [Validators.required]],
      period: ["", [Validators.required]],
      week: ["", [Validators.required]],
      period_code: ["", [Validators.required]],
      panel_code: ["", [Validators.required]],
      date_retrieved: [
        new Date().toLocaleString().split("-")[0],
        [Validators.required],
      ],
    });

    // add field here
    this.formPanel.get("period").valueChanges.subscribe((value) => {
      this.setPanelCode();
    });
    this.formPanel.get("week").valueChanges.subscribe((value) => {
      if (!!value) {
        this.setPanelCode();
      }
    });
    this.formPanel.get("year").valueChanges.subscribe((value) => {
      if (!!value) {
        this.setPanelCode();
      }
    });
    this.formPanel.valueChanges.subscribe((value) => {
      console.log("values", this.formPanel.value);
      this.save_last_saved();
    });
  }

  setPanelCode() {
    let panel_code =
      this.formPanel.get("year").value +
      "." +
      this.formPanel.get("period").value +
      "." +
      this.formPanel.get("week").value;
    this.formPanel.get("period_code").setValue(panel_code);
  }

  get_last_saved() {
    this.sqlitePurchaseEntryService.getLastData().then(
      (data: any) => {
        if (data.rows.length == 0) {
          console.log("retrieved no last item");
          this.lastData = null;
        } else {
          this.lastData = data.rows.item(0);
          this.formPanel.patchValue(this.lastData, { emitEvent: false });
          console.log("retrieved last item", this.lastData);
        }
      },
      (error) => console.error("Error storing item", error)
    );
  }

  scan() {
    this.isBarcodeScanned = false;
    this.barcodeScanner
      .scan()
      .then((barcodeData) => {
        console.log("Barcode data", barcodeData);
        this.isBarcodeScanned = true;
        this.formPanel.get("panel_code").setValue(barcodeData.text);
      })
      .catch((err) => {
        console.log("Error", err);
      });
  }

  formatDate(date) {
    // mm/dd/yy format
    let d = date.getDate();
    let m = date.getMonth() + 1; //Month from 0 to 11
    let y = date.getFullYear();
    return "" + (m <= 9 ? "0" + m : m) + "/" + (d <= 9 ? "0" + d : d) + "/" + y;
  }

  save(value) {
    this.storage.setItem("irf", value);
    this.navCtrl.push(RetrievalItemPage, {
      irfId: this.storage.itemId,
    });
  }

  search(value) {
    if (value.week == "") {
      this.showToast("Week should not be blank");
    } else {
      let irf = new Irf(this.formPanel.value)
      this.sqliteService.search(irf).then(
        (data: any) => {
          console.log("found data on search", data);
          if (!!data.rows.item(0)) {
            console.log("found data", data.rows.item(0));
            this.moveToDocupicItems(data.rows.item(0))
          } else {
            this.showToast("No data matched from retrieval")
          }
        },
        (error) => console.error("Error storing item", error)
      );
    }
  }

  clear() {
    this.initForm();
  }

  showToast(message) {
    message = message || "null";
    this.toast.show(message, "5000", "top").subscribe((toast) => {
      console.log(toast);
    });
  }

  removeRequest(id) {
    this.sqliteService.deleteData(id).then(
      (data: any) => {
        this.getAllData();
      },
      (error) => console.error("Error storing item", error)
    );
  }

  moveToIrf(row: any) {
    if (!!row) {
      this.navCtrl.push(PurchaseItemPage, {
        irfId: row.rowId,
      });
    } else {
      this.navCtrl.push(PurchaseItemPage, {});
    }
  }

  moveToDocupicItems(row: any) {
    this.navCtrl.push(DocupicItems, {
      irfId: row.rowId,
    });
  }

  getAllData() {
    this.sqliteService.createTable().then(
      (data: any) => {
        this.sqliteService.getAllData().then(
          (data: any) => {
            let result = [];
            for (let i = 0; i < data.rows.length; i++) {
              let item = data.rows.item(i);
              // do something with it
              result.push(item);
              console.log("data", item);
            }

            console.log("all data", result.length);
            this.requests = result;
          },
          (error) => console.error("Error storing item", error)
        );

        this.get_last_saved();
      },
      (error) => console.error("Error storing item", error)
    );
  }
}
