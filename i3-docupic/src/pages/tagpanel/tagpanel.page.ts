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
  selector: "app-tagpanel",
  templateUrl: "./tagpanel.page.html"
})
export class tagpanelPage implements OnInit {
  url = "http://10.0.2.2:3000";
  // url = "http://api.uniserve.ph";

  formPanel: FormGroup;
  isBarcodeScanned = false;
  location;
  tagPanelObj;
  showZeroRemarks = false;
  irfId;
  irfObj: any = {};
  date_visit;

  isCaptureLoc = false;
  connectedToNet = false;
  houseImagePathNative;
  houseImageImagePath;

  uploading = false;
  saving = false;
  takingPicture = false;

  page_number = "";

  images = [];

  private win: any = window;

  constructor(
    private barcodeScanner: BarcodeScanner,
    private sms: SMS,
    public camera: Camera,
    private filePath: FilePath,
    private storage: StorageService,
    private file: File,
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
      period_code: ["", [Validators.required]],
      panel_code: ["", [Validators.required]],
      panel_name: ["", [Validators.required]],
      yy_code: ["", [Validators.required]],
      pp_code: ["", [Validators.required]],
      ww_code: ["", [Validators.required]],
      remarks: ["", [Validators.required]]
    });
    // add field here
  }

  ngOnInit() {
    console.log("tag panel init");

    this.irfId = this.navParams.get("irfId") || "";
    this.formPanel.valueChanges;
    console.log("irfid", this.irfId);
    if (!!this.irfId) {
      this.nativeStorage.getItem(this.irfId).then(
        data => {
          this.irfObj = data;
          console.log("retrieved data", this.irfObj);
          this.formPanel.patchValue(data);
          if (!!data.image_keys) {
            data.image_keys.split(",").forEach(element => {
              this.getImage(element);
            });
          }
        },
        error => console.error("Error storing item", error)
      );
    }
  }

  getImage(key) {
    this.nativeStorage.getItem(key).then(
      data => {
        this.images.push(data);
      },
      error => console.error("Error storing item", error)
    );
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

  scan() {
    this.isBarcodeScanned = false;
    this.barcodeScanner
      .scan()
      .then(barcodeData => {
        console.log("Barcode data", barcodeData);
        this.isBarcodeScanned = true;
        this.formPanel.get("panel_code").setValue(barcodeData.text);
      })
      .catch(err => {
        console.log("Error", err);
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
    this.date_visit = new Date().toLocaleString();
    let v = this.formPanel.value;

    let message =
      "HHP;" +
      `${v.fi_name || ""};` +
      `${v.panel_code || ""};` +
      `${v.panel_name || ""};` +
      `${v.sec || ""};` +
      `${v.gender || ""};` +
      `${v.panelist_age || ""};` +
      `${v.redemption_mode || ""};` +
      `${v.contact_number || ""};` +
      `${v.brgy_code || ""};` +
      `${v.brgy_name || ""};` +
      `${v.region || ""};` +
      `${v.province || ""};` +
      `${v.municipality || ""};` +
      `${v.urbanity || ""};` +
      `${v.start_hatching || ""};` +
      `${this.date_visit || ""};` +
      `${v.start_hatching || ""};` +
      `${v.panel_type || ""};` +
      `${v.gps_location || ""};` +
      `${this.irfObj.gl_name || ""};`;
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

  saveImage(value) {
    this.saving = true;
    this.date_visit = new Date().toLocaleString();
    value["house_image_path"] = this.houseImageImagePath;
    value["house_image_path_native"] = this.houseImagePathNative;
    value["date_visit"] = this.date_visit;

    this.saveOnly(value);
    this.saving = false;
  }

  saveOnly(value) {
    if (!!this.irfObj && !!this.irfObj.Id) {
      value = Object.assign(this.irfObj, value);
    }
    console.log("storing a", value);
    this.storage.setItem("docupic", value);
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
          this.storage.setItem("docupic", value);
        });
        setTimeout(() => {}, 500);
        this.actualSave();
      },
      error => console.error(error)
    );
  }

  isDataValid(value) {
    return true;
    // if (value.fw_result == "") {
    //   this.showToast("FW Result shout not be blank");
    //   return false;
    // } else if (value.fw_type == "") {
    //   this.showToast("FW Type should not be blank");
    //   return false;
    // } else {
    //   return true;
    // }
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

  takePicture(
    type,
    sourceType: PictureSourceType = this.camera.PictureSourceType.CAMERA
  ) {
    this.takingPicture = true;
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };
    this.camera
      .getPicture(options)
      .then(imageData => {
        this.filePath
          .resolveNativePath(imageData)
          .then(path => {
            console.log(imageData, path);
            let imagePath = path.substr(0, path.lastIndexOf("/") + 1);
            let imageName = path.substring(
              path.lastIndexOf("/") + 1,
              path.length
            );

            if (this.platform.is("android")) {
              this.file
                .checkDir(this.file.externalRootDirectory, "docupic")
                .then(response => {
                  console.log("Directory exists" + response);
                  this.moveToFile(imagePath, imageName, type);
                })
                .catch(err => {
                  console.log("Directory doesn't exist" + JSON.stringify(err));
                  this.file
                    .createDir(
                      this.file.externalRootDirectory,
                      "docupic",
                      false
                    )
                    .then(response => {
                      console.log("Directory create" + response);
                      this.moveToFile(imagePath, imageName, type);
                    })
                    .catch(err => {
                      console.log("Directory no create" + JSON.stringify(err));
                    });
                });
            }
          })
          .catch(err => {
            debugger;
            console.error(err);
          });
      })
      .catch(err => {
        debugger;
        console.error(err);
      });
  }

  moveToFile(imagePath, imageName, type) {
    let panel_code = this.formPanel.get("panel_code").value;
    let week_code = this.formPanel.get("ww_code").value;
    this.file
      .moveFile(
        imagePath,
        imageName,
        this.file.externalRootDirectory + "docupic/",
        this.page_number + "_" + panel_code + "_" + week_code + ".jpeg"
      )
      .then(newFile => {
        switch (type) {
          case "House_Image":
            this.houseImageImagePath = this.getTrustImg(newFile.nativeURL);
            this.houseImagePathNative = newFile.nativeURL;
            this.saveImageByKey();
            break;
          default:
        }
        if (!!this.irfObj.Id) {
          this.saveImage(this.formPanel.value);
          this.takingPicture = false;
        }

        console.log(newFile);
      })
      .catch(err => {
        debugger;
        console.error(err);
      });
  }

  getTrustImg(imageSrc) {
    let path = this.win.Ionic.WebView.convertFileSrc(imageSrc);
    console.log(path);
    return path;
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
    this.date_visit = new Date().toLocaleString();
    this.formPanel.value["date_visit"] = this.date_visit;
    this.uploading = true;

    if (
      this.formPanel.value.panel_type == "docupic" ||
      this.formPanel.value.panel_type == "EXP"
    ) {
      this.formPanel.value.gender = null;
    }

    if (this.formPanel.value.panel_type == "EOP") {
      this.formPanel.value.kids = null;
      this.formPanel.value.work_status = null;
      this.formPanel.value.hh_size = null;
    }

    this.httpService
      .post(this.url + "/docu_pics", this.formPanel.value, false)
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
            this.storage.setItem("docupic", value);
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

  uploadImage(index, row) {
    let filePath = row.image_url;
    let type = "Docu_Image";

    this.base64.encodeFile(filePath).then(
      (base64File: string) => {
        let value = {};
        switch (type) {
          case "Docu_Image":
            value["docu_image"] = base64File;
            value["page_num"] = row.page_num;
            break;
        }
        this.uploadPhoto(value, type, index);
        console.log("here is encoded image ", base64File);
      },
      err => {
        console.log(err);
      }
    );
  }

  uploadPhoto(value, type, index) {
    let pictureData = this.images[index];
    value["page_num"] = pictureData["page_num"];
    this.uploading = true;
    this.httpService
      .patch(
        this.url + "/docu_pics/" + this.irfObj["id"] + "/upload",
        value,
        false
      )
      .timeout(10000)
      .subscribe(
        data => {
          this.images[index]["stored"] = true;
          pictureData["stored"] = true;
          this.storage.saveItem(pictureData["key"], pictureData);

          this.uploading = false;
          this.showToast("Image Uploaded");
        },
        err => {
          debugger;
          this.uploading = false;
          this.showToast("Something went wrong" + err.message);
          console.log(err);
        }
      );
  }

  saveImageByKey() {
    let value = this.formPanel.value;
    if (!!this.irfObj && !!this.irfObj.Id) {
      value = Object.assign(this.irfObj, value);
    }
    let image_key =
      value["panel_code"] +
      Math.random()
        .toString(36)
        .substring(7);
    if (value["image_keys"] != "") {
      value["image_keys"] = value["image_keys"] + "," + image_key;
    } else {
      value["image_keys"] = image_key;
    }

    value = {
      page_num: this.page_number,
      image_url: this.houseImagePathNative,
      imageDisplay: this.houseImageImagePath,
      stored: false,
      key: image_key
    };
    this.images.push(value);
    console.log("storing a", value);
    this.storage.saveItem(image_key, value);
    this.page_number = "";
    this.houseImagePathNative = null;
    this.houseImageImagePath = null;
  }

  removePicture(index, row) {
    this.images.splice(index, 1);
    let value = this.formPanel.value;
    if (!!this.irfObj && !!this.irfObj.Id) {
      value = Object.assign(this.irfObj, value);
    }
    let image_keys = value["image_keys"].split(",");
    image_keys.splice(index, 1);
    value["image_keys"] = image_keys.join();
    this.storage.setItem("docupic", value);
  }
}
