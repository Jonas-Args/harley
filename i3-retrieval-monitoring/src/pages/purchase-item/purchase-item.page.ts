import { Component, OnInit } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { SMS } from "@ionic-native/sms";
import { StorageService } from "../../app/services/util/storage.service";
import { Toast } from "@ionic-native/toast";
import { NativeStorage } from "@ionic-native/native-storage";
import { NavController, NavParams } from "ionic-angular";
import { RetrieveilFormPage } from "../retrieval-form/retrieval-form.page";
import { SqliteService } from "../../app/services/util/sqlite.service";
import { Platform } from "ionic-angular";
declare var AdvancedGeolocation: any;
import { NgZone } from "@angular/core";
import { Network } from "@ionic-native/network";
import {
  BackgroundGeolocation,
  BackgroundGeolocationConfig,
  BackgroundGeolocationResponse,
  BackgroundGeolocationEvents,
} from "@ionic-native/background-geolocation";
import { HttpService } from "../../app/services/util/http.service";
import { SqlitePurchaseEntryService } from "../../app/services/util/sqlite-purchase-entry.service";
import { SqlitePurchaseService } from "../../app/services/util/sqlite-purchase.service";
import { PurchaseItem } from "../../model/purchaseItem";

@Component({
  selector: "app-purchase",
  templateUrl: "./purchase-item.page.html",
})
export class PurchaseItemPage implements OnInit {
  url = "http://api.uniserve.ph";
  // url = "http://10.0.2.2:3000";

  formPanel: FormGroup;
  isBarcodeScanned = false;
  location;
  tagPanelObj;
  showZeroRemarks = false;
  irfId;
  irfObj: any = { stored: false };
  date_send;
  isCaptureLoc = false;
  connectedToNet = false;
  saving = false;
  uploading = false;
  prod_cat_options = [];
  manufacturer_options = [];
  brand_options = [];
  sub_brand_options = [];
  formula_options = [];
  flavor_options = [];
  variant_options = [];
  weight_size_options = [];
  packaging_options = [];

  constructor(
    private barcodeScanner: BarcodeScanner,
    private sms: SMS,
    private storage: StorageService,
    private fb: FormBuilder,
    private toast: Toast,
    public navCtrl: NavController,
    private nativeStorage: NativeStorage,
    private navParams: NavParams,
    private sqliteService: SqlitePurchaseEntryService,
    private sqlitePurchaseService: SqlitePurchaseService,
    private plt: Platform,
    private zone: NgZone,
    private backgroundGeolocation: BackgroundGeolocation,
    private network: Network,
    private httpService: HttpService
  ) {
    this.formPanel = this.fb.group({
      prod_cat: ["", [Validators.required]],
      prod_cat_attributes: ["", [Validators.required]],
      period_code: ["", [Validators.required]],
      manufacturer: ["", [Validators.required]],
      manufacturer_attributes: ["", [Validators.required]],
      brand: ["", [Validators.required]],
      brand_attributes: ["", [Validators.required]],
      sub_brand: ["", [Validators.required]],
      sub_brand_attributes: ["", [Validators.required]],
      flavor: ["", [Validators.required]],
      flavor_attributes: ["", [Validators.required]],
      formula: ["", [Validators.required]],
      formula_attributes: ["", [Validators.required]],
      variant: ["", [Validators.required]],
      variant_attributes: ["", [Validators.required]],
      weight_size: ["", [Validators.required]],
      weight_size_attributes: ["", [Validators.required]],
      packaging: ["", [Validators.required]],
      packaging_attributes: ["", [Validators.required]],
      packaging_color: ["", [Validators.required]],
      use_type: ["", [Validators.required]],
      form: ["", [Validators.required]],
      skin_type: ["", [Validators.required]],
      hair_type: ["", [Validators.required]],
      product_type: ["", [Validators.required]],
      gender: ["", [Validators.required]],
      age: ["", [Validators.required]],
      quantity: ["", [Validators.required]],
      price: ["", [Validators.required]],
      promo: ["", [Validators.required]],
      outlet_type: ["", [Validators.required]],
      outlet_name: ["", [Validators.required]],
      week: ["", [Validators.required]],
      purchase_time: ["", [Validators.required]],
      day: ["", [Validators.required]],
      panel_code: ["", [Validators.required]],
      date_retrieved: ["", [Validators.required]]
    });
    this.formPanel.get("prod_cat").valueChanges.subscribe((value) => {
      if (value != null) {
        this.searchOptions("prod_cat", value);
      }
    });
    this.formPanel.get("manufacturer").valueChanges.subscribe((value) => {
      if (value != null) {
        this.searchOptions("manufacturer", value);
      }
    });
    this.formPanel.get("brand").valueChanges.subscribe((value) => {
      if (value != null) {
        this.searchOptions("brand", value);
      }
    });
    this.formPanel.get("sub_brand").valueChanges.subscribe((value) => {
      if (value != null) {
        this.searchOptions("sub_brand", value);
      }
    });
    this.formPanel.get("formula").valueChanges.subscribe((value) => {
      if (value != null) {
        this.searchOptions("formula", value);
      }
    });
    this.formPanel.get("flavor").valueChanges.subscribe((value) => {
      if (value != null) {
        this.searchOptions("flavor", value);
      }
    });
    this.formPanel.get("variant").valueChanges.subscribe((value) => {
      if (value != null) {
        this.searchOptions("variant", value);
      }
    });
    this.formPanel.get("weight_size").valueChanges.subscribe((value) => {
      if (value != null) {
        this.searchOptions("weight_size", value);
      }
    });
    this.formPanel.get("packaging").valueChanges.subscribe((value) => {
      if (value != null) {
        this.searchOptions("packaging", value);
      }
    });
  }

  searchOptions(column, value) {
    this.sqlitePurchaseService.searchString(value.toUpperCase()).then(
      (data: any) => {
        let result = [];
        for (let i = 0; i < data.rows.length; i++) {
          let item = new PurchaseItem(data.rows.item(i));
          // do something with it
          result.push(item);
        }
        console.log("all data", result.length);
        this.zone.run(() => {
          switch (column) {
            case "prod_cat":
              this.prod_cat_options = result;
              break;
            case "manufacturer":
              this.manufacturer_options = result;
              break;
            case "brand":
              this.brand_options = result;
              break;
            case "sub_brand":
              this.sub_brand_options = result;
              break;
            case "formula":
              this.formula_options = result;
              break;
            case "flavor":
              this.flavor_options = result;
              break;
            case "variant":
              this.variant_options = result;
              break;
            case "weight_size":
              this.weight_size_options = result;
              break;
            case "packaging":
              this.packaging_options = result;
              break;
            default:
              break;
          }
        });
      },
      (error) => {
        debugger;
        console.error("Error storing item", error);
      }
    );
  }

  setColumn(column, option) {

    let attribute_value = option.Field4

    if (option.V1 != '') {
      attribute_value = attribute_value + '~' + option.V1 + '~V1'
    } else if (option.V2 != '') {
      attribute_value = attribute_value + '~' + option.V2 + '~V2'
    } else if (option.V3 != '') {
      attribute_value = attribute_value + '~' + option.V3 + '~V3'
    } else if (option.V4 != '') {
      attribute_value = attribute_value + '~' + option.V4 + '~V4'
    } else if (option.V5 != '') {
      attribute_value = attribute_value + '~' + option.V5 + '~V5'
    } else if (option.V6 != '') {
      attribute_value = attribute_value + '~' + option.V6 + '~V6'
    } else if (option.V7 != '') {
      attribute_value = attribute_value + '~' + option.V7 + '~V7'
    } else if (option.V15 != '') {
      attribute_value = attribute_value + '~' + option.V15 + '~V15'
    }
    debugger
    this.formPanel
      .get(column + '_attributes')
      .setValue(attribute_value, { onlySelf: true, emitEvent: false });
    debugger
    this.formPanel
      .get(column)
      .setValue(option.Field4, { onlySelf: true, emitEvent: false });
    this.prod_cat_options = [];
    this.manufacturer_options = [];
    this.brand_options = [];
    this.sub_brand_options = [];
    this.formula_options = [];
    this.flavor_options = [];
    this.variant_options = [];
    this.weight_size_options = [];
    this.packaging_options = [];
    console.log("form value is", this.formPanel.value)
  }

  statuses = [
    { value: "RETRIEVED" },
    { value: "ZERO" },
    { value: "NA" },
    { value: "HATCHING" },
    { value: "DROPPED" },
    { value: "MY LOCATION" },
  ];

  ngOnInit() {
    this.plt.ready().then((readySource) => {
      this.irfId = this.navParams.get("irfId") || "";
      if (!!this.irfId) {
        console.log("irfId", this.irfId);
        this.findData();
      }
    });
  }

  findData() {
    this.sqliteService.find(this.irfId).then(
      (data: any) => {
        this.zone.run(() => {
          this.irfObj = data.rows.item(0);
          console.log("found item", this.irfObj);
          this.formPanel.patchValue(this.irfObj, { onlySelf: true, emitEvent: false });
        });
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

  captureLoc(enable) {
    if (enable) {
      this.start();
    } else {
      // If you wish to turn OFF background-tracking, call the #stop method.
      this.backgroundGeolocation.stop();
      // AdvancedGeolocation.stop();
    }
  }

  ionViewDidEnter() {
    this.plt.ready().then(() => {
      if (this.network.type != "none") {
        console.log("network connected!");
        this.connectedToNet = true;
      } else {
        this.connectedToNet = false;
      }
      this.watchNetwork();
    });
  }

  watchNetwork() {
    console.log("watching network");
    this.network.onDisconnect().subscribe(() => {
      this.showToast("Disconnected from network");
      console.log("network disconnected!");
      this.connectedToNet = false;
    });

    this.network.onConnect().subscribe(() => {
      console.log("network connected!");
      // We just got a connection but we need to wait briefly
      // before we determine the connection type. Might need to wait.
      // prior to doing any api requests as well.
      setTimeout(() => {
        this.showToast("Connected to network");
        this.connectedToNet = true;
      }, 1000);
    });
  }

  sendSMS() {
    if (this.isDataValid(this.formPanel.value)) {
      console.log("sending", this.formatMessage());
      this.date_send = new Date().toLocaleString();
      this.sms.send("09177131456", this.formatMessage()).then(
        () => {
          this.save(this.formPanel.value);
          console.log("message sent");
        },
        (error) => console.error("Error removing item", error)
      );
    }
  }

  formatMessage() {
    let formValue = this.formPanel.value;
    let message =
      "PUR;" +
      `${formValue.panel_code || ""};` +
      `${formValue.period_code || ""};` +
      `${formValue.week || ""};` +
      `${formValue.day || ""};` +
      `${formValue.purchase_time || ""};` +
      `${formValue.prod_cat || ""};` +
      `${formValue.manufacturer || ""};` +
      `${formValue.brand || ""};` +
      `${formValue.sub_brand || ""};` +
      `${formValue.flavor || ""};` +
      `${formValue.formula || ""};` +
      `${formValue.variant || ""};` +
      `${formValue.weight_size || ""};` +
      `${formValue.packaging || ""};` +
      `${formValue.packaging_color || ""};` +
      `${formValue.use_type || ""};` +
      `${formValue.form || ""};` +
      `${formValue.skin_type || ""};` +
      `${formValue.hair_type || ""};` +
      `${formValue.product_type || ""};` +
      `${formValue.gender || ""};` +
      `${formValue.age || ""};` +
      `${formValue.quantity || ""};` +
      `${formValue.price || ""};` +
      `${formValue.promo || ""};` +
      `${formValue.outlet_type || ""};` +
      `${formValue.outlet_name || ""};`
    // add field here
    return message;
  }

  start() {
    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 10,
      stationaryRadius: 20,
      distanceFilter: 30,
      debug: true, //  enable this hear sounds for background-geolocation life-cycle.
      stopOnTerminate: false, // enable this to clear background location settings when the app terminates
    };

    this.backgroundGeolocation.configure(config).then((mylocation) => {
      this.backgroundGeolocation
        .on(BackgroundGeolocationEvents.location)
        .subscribe(
          (location: BackgroundGeolocationResponse) => {
            debugger;
            // console.log(‘BackgroundGeolocationResponse’, location);
          },
          (err) => {
            debugger;
            console.log(err);
          }
        );
      // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
      // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
      // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
      this.backgroundGeolocation.finish(); // FOR IOS ONLY
      console.log(mylocation);
      debugger;
    });

    // start recording location
    this.backgroundGeolocation.start();
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

  save(value = this.formPanel.value) {
    this.saving = true;
    this.zone.run(() => {
      value.rowId = this.irfId;
      value = Object.assign(this.irfObj, value);
      console.log("editing data", value);
      debugger;
      this.sqliteService.editData(value).then(
        (data: any) => {
          console.log("retrieved new data", data);
          console.log("popping", data);
          this.navCtrl.pop();
          this.saving = false;
        },
        (error) => {
          console.error("Error storing item", error);
          this.saving = false;
        }
      );
    });
  }

  sync() {
    console.log("syncing", this.formPanel.value);
    this.uploading = true;

    this.httpService
      .post(this.url + "/purchase_entries", this.formPanel.value, false)
      .timeout(10000)
      .subscribe(
        (data) => {
          if (data["success"] == true) {
            let value = this.formPanel.value;
            value["stored"] = true;

            if (!!this.irfObj && !!this.irfObj.rowId) {
              this.irfObj = Object.assign(this.irfObj, value);
            }
            this.sqliteService.editData(this.irfObj).then(
              (data: any) => {
                this.findData();
                this.zone.run(() => {
                  this.saving = false;
                });
              },
              (error) => {
                console.error("Error storing item", error);
                this.zone.run(() => {
                  this.saving = false;
                });
              }
            );

            this.zone.run(() => {
              this.uploading = false;
            });
            this.showToast("Data Uploaded");
            this.sendSMS();
          }
        },
        (err) => {
          this.url;
          this.zone.run(() => {
            this.uploading = false;
          });
          this.showToast("Something went wrong" + err.message);
          console.log(err);
        }
      );
  }

  // actualSave(){
  //   let value = this.formPanel.value
  //   if(this.isDataValid(value)){
  //     value["date_send"] = this.date_send
  //     value["last"] = true
  //     if(!!this.irfObj && !!this.irfObj.Id){

  //     }
  //     console.log("storing a",value)
  //     this.storage.setItem("irf",value)
  //     this.navCtrl.push(RetrieveilFormPage, {});
  //   }
  // }

  // resetOthePanelCodesLast(){
  //   this.storage.getAllItem().then(
  //     data => {
  //       let objects = <any[]>data;
  //       let items = objects.filter(res=>!!res["panel_code"] && res["panel_code"]== this.formPanel.value.panel_code && res["last"] == true)
  //       items.forEach(value=>{
  //         console.log("setting to false",value)
  //         value["last"] = false
  //         this.storage.setItem("irf",value)
  //       })
  //       setTimeout(() => {},500);
  //       this.actualSave()

  //     },
  //     error => console.error(error)
  //   )
  // }

  isDataValid(value) {
    if (value.panel_status == "ZERO" && value.panel_remarks == "") {
      this.showToast("Zero Remarks shout not be blank");
      return false;
    } else if (value.panel_status == "") {
      this.showToast("Status should not be blank");
      return false;
    } else {
      return true;
    }
  }

  showToast(message) {
    message = message || "null";
    this.toast.show(message, "5000", "top").subscribe((toast) => {
      console.log(toast);
    });
  }
}
