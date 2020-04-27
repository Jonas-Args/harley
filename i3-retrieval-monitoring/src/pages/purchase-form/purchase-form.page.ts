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

          // this.formPanel
          //   .get("period_code")
          //   .setValue(
          //     this.formPanel.value["period"] +
          //       "." +
          //       this.formPanel.value["week"],
          //     { emitEvent: false }
          //   );
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

  start() {
    // const config: BackgroundGeolocationConfig = {
    //   desiredAccuracy: 10,
    //   stationaryRadius: 20,
    //   distanceFilter: 30,
    //   debug: true, //  enable this hear sounds for background-geolocation life-cycle.
    //   stopOnTerminate: false // enable this to clear background location settings when the app terminates
    // };
    // this.backgroundGeolocation
    //   .configure(config)
    //   .then((location: BackgroundGeolocationResponse) => {
    //     console.log(location);
    //     // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
    //     // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
    //     // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
    //     this.backgroundGeolocation.finish(); // FOR IOS ONLY
    //   });
    // // start recording location
    // this.backgroundGeolocation.start();
    // // If you wish to turn OFF background-tracking, call the #stop method.
    // this.backgroundGeolocation.stop();
  }

  // start() {
  //   AdvancedGeolocation.start(
  //     success => {
  //       try {
  //         let jsonObject: any = JSON.parse(success);

  //         if (!!jsonObject.latitude) {
  //           this.location = jsonObject;
  //           this.formPanel
  //             .get("panel_gps_location")
  //             .setValue(
  //               `${this.location.latitude}, ${this.location.longitude}`
  //             );
  //           this.formPanel
  //             .get("panel_gps_location_accuracy")
  //             .setValue(
  //               `${parseFloat(this.location.accuracy.toFixed(2))} meters`
  //             );
  //         } else {
  //           this.showToast("lat long not available");
  //         }
  //         console.log("Provider now " + JSON.stringify(jsonObject));
  //         // this.showToast(JSON.stringify(jsonObject))
  //         switch (jsonObject.provider) {
  //           case "gps":
  //             //TODO
  //             break;

  //           case "network":
  //             //TODO
  //             break;

  //           case "satellite":
  //             //TODO
  //             break;

  //           case "cell_info":
  //             //TODO
  //             break;

  //           case "cell_location":
  //             //TODO
  //             break;

  //           case "signal_strength":
  //             //TODO
  //             break;
  //         }
  //       } catch (exc) {
  //         //this.showToast("value"+exc)
  //         console.log("Invalid JSON: " + exc);
  //       }
  //     },
  //     error => {
  //       this.showToast(JSON.stringify(error));
  //       console.log("ERROR! " + JSON.stringify(error));
  //     },
  //     ////////////////////////////////////////////
  //     //
  //     // REQUIRED:
  //     // These are required Configuration options!
  //     // See API Reference for additional details.
  //     //
  //     ////////////////////////////////////////////
  //     {
  //       minTime: 500, // Min time interval between updates (ms)
  //       minDistance: 1, // Min distance between updates (meters)
  //       noWarn: true, // Native location provider warnings
  //       providers: "gps", // Return GPS, NETWORK and CELL locations
  //       useCache: true, // Return GPS and NETWORK cached locations
  //       satelliteData: true, // Return of GPS satellite info
  //       buffer: true, // Buffer location data
  //       bufferSize: 3, // Max elements in buffer
  //       signalStrength: false // Return cell signal strength data
  //     }
  //   );
  // }

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

  // search(value) {
  //   if (value.week == "") {
  //     this.showToast("Week should not be blank");
  //   } else {
  //     this.sqliteService.search(this.formPanel.value).then(
  //       (data: any) => {
  //         console.log("found data on search", data);
  //         if (!!data.rows.item(0)) {
  //           console.log("found data", data.rows.item(0));
  //           let new_data = new PurchaseEntry(
  //             Object.assign(data.rows.item(0), this.formPanel.value)
  //           );
  //           this.sqliteService.editData(new_data).then((data: any) => {
  //             this.navCtrl.push(PurchaseItemPage, {
  //               irfId: new_data.rowId,
  //             });
  //           });
  //         } else {
  //           console.log("adding data on search", data);
  //           this.formPanel.value.last = 0;
  //           this.sqliteService
  //             .addData(this.formPanel.value)
  //             .then((data: any) => {
  //               this.search(this.formPanel.value);
  //               // console.log("new data", data.rows.item(0))
  //             });
  //         }
  //       },
  //       (error) => console.error("Error storing item", error)
  //     );
  //   }
  // }

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
