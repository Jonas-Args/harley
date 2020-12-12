import { Component, OnInit } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { SMS } from "@ionic-native/sms";
import { StorageService } from "../../app/services/util/storage.service";
import { Toast } from "@ionic-native/toast";
import { NativeStorage } from "@ionic-native/native-storage";
import { irfPage } from "../irf/irf.page";
import { NavController, NavParams, Platform } from "ionic-angular";
import { PictureSourceType, CameraOptions, Camera } from "@ionic-native/camera";
import { FilePath } from "@ionic-native/file-path";
import { File } from "@ionic-native/file";
import { Network } from "@ionic-native/network";
import { HttpService } from "../../app/services/util/http.service";
import { Base64 } from "@ionic-native/base64";
declare var AdvancedGeolocation: any;

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html"
})
export class Home implements OnInit {
  // url = "http://10.0.2.2:3000";
  url = "http://api.uniserve.ph";

  formPanel: FormGroup;
  location;
  tagPanelObj;
  showZeroRemarks = false;
  irfId;
  irfObj: any = {};
  date_visit;

  isCaptureLoc = false;
  connectedToNet = false;

  uploading = false;
  saving = false;
  type = "irf";

  private win: any = window;

  statuses = [
    { value: "RETRIEVED" },
    { value: "ZERO" },
    { value: "NA" },
    { value: "HATCHING" },
    { value: "DROPPED" },
    { value: "MY LOCATION" }
  ];

  constructor(
    private sms: SMS,
    public camera: Camera,
    private storage: StorageService,
    private network: Network,
    private base64: Base64,
    private fb: FormBuilder,
    private toast: Toast,
    private nativeStorage: NativeStorage,
    public navCtrl: NavController,
    private navParams: NavParams,
    private platform: Platform,
    private httpService: HttpService
  ) {
    this.formPanel = fb.group({
      Id: ["", [Validators.required]],
      panel_code: ["", [Validators.required]],
      panel_name: ["", [Validators.required]],
      panel_status: ["", [Validators.required]],
      gps_location: ["", [Validators.required]],
      loc_accuracy: ["", [Validators.required]],
      panel_remarks: [""],
      panel_receipted: [""],
      finame: [""],
      region: [""],
      week_code: [""],
      period: [""],
      week: [""],
      date_retrieved: [""]
    });
    this.formPanel.get("panel_status").valueChanges.subscribe(value => {
      if (value == "ZERO") {
        this.showZeroRemarks = true;
      } else {
        this.showZeroRemarks = false;
      }
    });
  }

  ngOnInit() {
    this.irfId = this.navParams.get("irfId") || "";
    this.formPanel.valueChanges;
    if (!!this.irfId) {
      this.nativeStorage.getItem(this.irfId).then(
        data => {
          this.irfObj = data;
          console.log("retrieved data", this.irfObj);
          this.formPanel.patchValue(data);
        },
        error => console.error("Error storing item", error)
      );
    }
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      if (this.network.type != "none") {
        console.log("network connected!");
        this.connectedToNet = true;
      } else {
        this.connectedToNet = false;
      }
      this.watchNetwork();
    });
  }

  sendSMS() {
    console.log("sending", this.formatMessage());
    if (this.isDataValid(this.formPanel.value)) {
      this.sms.send("09177131456", this.formatMessage()).then(
        () => {
          this.save(this.formPanel.value);
          console.log("message sent");
        },
        error => console.error("Error removing item", error)
      );
    }
  }

  formatMessage() {
    let formValue = this.formPanel.value;
    this.date_visit = new Date().toLocaleString();
    let message =
      "TAG;" +
      `${formValue.panel_code || ""};` +
      `${formValue.panel_name || ""};` +
      `${formValue.week_code || ""};` +
      `${formValue.finame || ""};` +
      `${formValue.region || ""};` +
      `${formValue.gps_location || ""};` +
      `${formValue.loc_accuracy || ""};` +
      `${formValue.panel_status || ""};` +
      `${formValue.panel_remarks || ""};` +
      `${formValue.panel_receipted || ""};` +
      `${this.date_visit}`;
    // add field here
    return message;
  }

  start() {
    AdvancedGeolocation.start(
      success => {
        try {
          let jsonObject: any = JSON.parse(success);

          if (!!jsonObject.latitude) {
            this.location = jsonObject;

            this.formPanel
              .get("gps_location")
              .setValue(
                `${this.location.latitude}, ${this.location.longitude}`
              );
            this.formPanel
              .get("loc_accuracy")
              .setValue(`${parseFloat(this.location.accuracy.toFixed(2))}`);
          } else {
          }

          console.log("Provider now " + JSON.stringify(jsonObject));
          // this.showToast(JSON.stringify(jsonObject))
          switch (jsonObject.provider) {
            case "gps":
              //TODO
              break;

            case "network":
              //TODO
              break;

            case "satellite":
              //TODO
              break;

            case "cell_info":
              //TODO
              break;

            case "cell_location":
              //TODO
              break;

            case "signal_strength":
              //TODO
              break;
          }
        } catch (exc) {
          //this.showToast("value"+exc)
          console.log("Invalid JSON: " + exc);
        }
      },
      error => {
        this.showToast(JSON.stringify(error));
        console.log("ERROR! " + JSON.stringify(error));
      },
      ////////////////////////////////////////////
      //
      // REQUIRED:
      // These are required Configuration options!
      // See API Reference for additional details.
      //
      ////////////////////////////////////////////
      {
        minTime: 500, // Min time interval between updates (ms)
        minDistance: 1, // Min distance between updates (meters)
        noWarn: true, // Native location provider warnings
        providers: "gps", // Return GPS, NETWORK and CELL locations
        useCache: true, // Return GPS and NETWORK cached locations
        satelliteData: true, // Return of GPS satellite info
        buffer: true, // Buffer location data
        bufferSize: 3, // Max elements in buffer
        signalStrength: false // Return cell signal strength data
      }
    );
  }

  save(value) {
    this.resetOthePanelCodesLast();
  }

  actualSave() {
    this.saving = true;
    let value = this.formPanel.value;
    this.date_visit = new Date().toLocaleString();
    if (this.isDataValid(value)) {
      value["date_visit"] = this.date_visit;
      value["last"] = true;
      this.saveOnly(value);
      this.navCtrl.pop();
    }
  }

  saveOnly(value) {
    if (!!this.irfObj && !!this.irfObj.Id) {
      value = Object.assign(this.irfObj, value);
    }
    console.log("storing a", value);
    this.storage.setItem(this.type, value);
  }

  resetOthePanelCodesLast() {
    this.storage.getAllItem().then(
      data => {
        let objects = <any[]>data;
        let items = objects.filter(
          res =>
            !!res["panel_code"] &&
            res["panel_code"] == this.formPanel.value.panel_code &&
            res["last"] == true
        );
        items.forEach(value => {
          console.log("setting to false", value);
          value["last"] = false;
          this.storage.setItem(this.type, value);
        });
        setTimeout(() => {}, 500);
        this.actualSave();
      },
      error => console.error(error)
    );
  }

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
    this.toast.show(message, "5000", "top").subscribe(toast => {
      console.log(toast);
    });
  }

  captureLoc(value) {
    this.isCaptureLoc = value;
    if (!value) {
      AdvancedGeolocation.stop();
    } else {
      this.start();
    }
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

  sync() {
    console.log("sending", this.formPanel.value);
    this.uploading = true;
    this.httpService
      .post(this.url + "/retrieval_monitorings", this.formPanel.value, false)
      .timeout(10000)
      .subscribe(
        data => {
          if (data["success"] == true) {
            let value = this.formPanel.value;
            value["stored"] = true;
            value["id"] = data["id"];
            if (!!this.irfObj && !!this.irfObj.Id) {
              value = Object.assign(this.irfObj, value);
            }
            this.irfObj["stored"] = true;
            this.irfObj["id"] = value["id"];
            this.storage.setItem(this.type, value);
            this.uploading = false;
            this.showToast("Data Uploaded");
            this.sendSMS();
          }
        },
        err => {
          debugger;
          this.uploading = false;
          this.showToast("Something went wrong" + err.message);
          console.log(err);
        }
      );
  }

  moveToPurchase() {
    this.navCtrl.push(irfPage);
  }
}
