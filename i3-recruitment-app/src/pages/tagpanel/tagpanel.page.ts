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
import { e } from "@angular/core/src/render3";
declare var AdvancedGeolocation: any;

@Component({
  selector: "app-tagpanel",
  templateUrl: "./tagpanel.page.html"
})
export class tagpanelPage implements OnInit {
  // url = "http://10.0.2.2:3000";
  url = "http://api.uniserve.ph";

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

  idImagePathNative;
  idImageImagePath;

  pobImagePathNative;
  pobImageImagePath;

  iff1ImagePathNative;
  iff1ImageImagePath;

  iff2ImagePathNative;
  iff2ImageImagePath;

  iff3ImagePathNative;
  iff3ImageImagePath;

  iff4ImagePathNative;
  iff4ImageImagePath;

  dpa1ImagePathNative;
  dpa1ImageImagePath;

  dpa2ImagePathNative;
  dpa2ImageImagePath;

  uploading = false;
  saving = false;
  takingPicture = false;

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
      gps_location: ["", [Validators.required]],
      loc_accuracy: ["", [Validators.required]],
      panel_code: ["", [Validators.required]],
      panel_name: ["", [Validators.required]],
      sec: ["", [Validators.required]],
      gender: ["", [Validators.required]],
      panelist_age: ["", [Validators.required]],
      work_status: ["", [Validators.required]],
      hh_size: ["", [Validators.required]],
      kids: ["", [Validators.required]],
      redemption_mode: ["", [Validators.required]],
      contact_number: [
        "",
        [Validators.required, Validators.pattern("^(09|\\+639)\\d{9}$")]
      ],
      fi_name: ["", [Validators.required]],
      panel_type: ["", [Validators.required]],
      start_hatching: ["", [Validators.required]],
      brgy_code: ["", [Validators.required]],
      brgy_name: ["", [Validators.required]],
      region: ["", [Validators.required]],
      province: ["", [Validators.required]],
      municipality: ["", [Validators.required]],
      urbanity: ["", [Validators.required]]
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
          this.houseImageImagePath = this.getTrustImg(this.irfObj["house_image_path"]);
          this.houseImagePathNative = this.irfObj["house_image_path_native"];

          this.idImagePathNative = this.irfObj["idImagePathNative"];
          this.idImageImagePath = this.getTrustImg(this.irfObj["idImageImagePath"]);
        
          this.pobImagePathNative = this.irfObj["pobImagePathNative"];
          this.pobImageImagePath = this.getTrustImg(this.irfObj["pobImageImagePath"]);
        
          this.iff1ImagePathNative = this.irfObj["iff1ImagePathNative"];
          this.iff1ImageImagePath = this.getTrustImg(this.irfObj["iff1ImageImagePath"]);
        
          this.iff2ImagePathNative = this.irfObj["iff2ImagePathNative"];
          this.iff2ImageImagePath = this.getTrustImg(this.irfObj["iff2ImageImagePath"]);
        
          this.iff3ImagePathNative = this.irfObj["iff3ImagePathNative"];
          this.iff3ImageImagePath = this.getTrustImg(this.irfObj["iff3ImageImagePath"]);
        
          this.iff4ImagePathNative = this.irfObj["iff4ImagePathNative"];
          this.iff4ImageImagePath = this.getTrustImg(this.irfObj["iff4ImageImagePath"]);
        
          this.dpa1ImagePathNative = this.irfObj["dpa1ImagePathNative"];
          this.dpa1ImageImagePath = this.getTrustImg(this.irfObj["dpa1ImageImagePath"]);
        
          this.dpa2ImagePathNative = this.irfObj["dpa2ImagePathNative"];
          this.dpa2ImageImagePath = this.getTrustImg(this.irfObj["dpa2ImageImagePath"]);
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
      this.sms.send("09321607171", this.formatMessage()).then(
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
    let value = this.formPanel.value;
    this.date_visit = new Date().toLocaleString();
    if (this.isDataValid(value)) {
      this.saving = true;
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

    value["house_image_path"] = this.houseImageImagePath;
    value["house_image_path_native"] = this.houseImagePathNative;

    value["idImagePathNative"] = this.idImagePathNative;
    value["idImageImagePath"] = this.idImageImagePath;

    value["pobImagePathNative"] = this.pobImagePathNative;
    value["pobImageImagePath"] = this.pobImageImagePath;

    value["iff1ImagePathNative"] = this.iff1ImagePathNative;
    value["iff1ImageImagePath"] = this.iff1ImageImagePath;

    value["iff2ImagePathNative"] = this.iff2ImagePathNative;
    value["iff2ImageImagePath"] = this.iff2ImageImagePath;

    value["iff3ImagePathNative"] = this.iff3ImagePathNative;
    value["iff3ImageImagePath"] = this.iff3ImageImagePath;

    value["iff4ImagePathNative"] = this.iff4ImagePathNative;
    value["iff4ImageImagePath"] = this.iff4ImageImagePath;

    value["dpa1ImagePathNative"] = this.dpa1ImagePathNative;
    value["dpa1ImageImagePath"] = this.dpa1ImageImagePath;

    value["dpa2ImagePathNative"] = this.dpa2ImagePathNative;
    value["dpa2ImageImagePath"] = this.dpa2ImageImagePath;

    value["date_visit"] = this.date_visit;

    this.saveOnly(value);
    this.saving = false;
  }

  saveOnly(value) {
    if (!!this.irfObj && !!this.irfObj.Id) {
      value = Object.assign(this.irfObj, value);
    }
    console.log("storing a", value);
    this.storage.setItem("hhp", value);
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
          this.storage.setItem("hhp", value);
        });
        setTimeout(() => {}, 500);
        this.actualSave();
      },
      error => console.error(error)
    );
  }

  isDataValid(value) {
    let result = true
    console.log("value",value)
    if (value.panel_type == 'HHP' || value.panel_type == 'EXP') {
      result = !!value.gps_location && 
      !!value.panel_code &&
      !!value.panel_name &&
      !!value.sec &&
      !!value.kids &&
      !!value.panelist_age &&
      !!value.work_status &&
      !!value.hh_size &&
      !!value.redemption_mode &&
      !!value.contact_number
    } else if (value.panel_type == 'EOP') {
      result = !!value.gps_location && 
      !!value.panel_code &&
      !!value.panel_name &&
      !!value.sec &&
      !!value.panelist_age &&
      !!value.gender &&
      !!value.redemption_mode &&
      !!value.contact_number
    } else {
      result = false;
    }
    if(!result){
      this.showToast("Pleass fill all fields with (*)");
    }
    return result
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
                .checkDir(this.file.externalRootDirectory, "hhp")
                .then(response => {
                  console.log("Directory exists" + response);
                  this.moveToFile(imagePath, imageName, type);
                })
                .catch(err => {
                  console.log("Directory doesn't exist" + JSON.stringify(err));
                  this.file
                    .createDir(this.file.externalRootDirectory, "hhp", false)
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
    this.file
      .moveFile(
        imagePath,
        imageName,
        this.file.externalRootDirectory + "hhp/",
        panel_code + "_" +type + ".jpeg"
      )
      .then(newFile => {
        switch (type) {
          case "House_Image":
            this.houseImageImagePath = this.getTrustImg(newFile.nativeURL);
            this.houseImagePathNative = newFile.nativeURL;
            break;
          case "ID_Image":
            this.idImageImagePath = this.getTrustImg(newFile.nativeURL);
            this.idImagePathNative = newFile.nativeURL;
            break;
          case "POB_Image":
            this.pobImageImagePath = this.getTrustImg(newFile.nativeURL);
            this.pobImagePathNative = newFile.nativeURL;
            break;
          case "IFF1_Image":
            this.iff1ImageImagePath = this.getTrustImg(newFile.nativeURL);
            this.iff1ImagePathNative = newFile.nativeURL;
            break;
          case "IFF2_Image":
            this.iff2ImageImagePath = this.getTrustImg(newFile.nativeURL);
            this.iff2ImagePathNative = newFile.nativeURL;
            break;
          case "IFF3_Image":
            this.iff3ImageImagePath = this.getTrustImg(newFile.nativeURL);
            this.iff3ImagePathNative = newFile.nativeURL;
            break;
          case "IFF4_Image":
            this.iff4ImageImagePath = this.getTrustImg(newFile.nativeURL);
            this.iff4ImagePathNative = newFile.nativeURL;
            break;
          case "DPA1_Image":
            this.dpa1ImageImagePath = this.getTrustImg(newFile.nativeURL);
            this.dpa1ImagePathNative = newFile.nativeURL;
            break;
          case "DPA2_Image":
            this.dpa2ImageImagePath = this.getTrustImg(newFile.nativeURL);
            this.dpa2ImagePathNative = newFile.nativeURL;
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
      this.formPanel.value.panel_type == "HHP" ||
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
      .post(this.url + "/hh_recruitments", this.formPanel.value, false)
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
            this.storage.setItem("hhp", value);
            this.uploading = false;
            this.showToast("Data Uploaded");
            this.sendSMS();
            this.uploadImages()
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

  upload(type, filePath) {
    let fileName = filePath.split("/").pop();
    let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);

    this.base64.encodeFile(filePath).then(
      (base64File: string) => {
        let value = {};
        switch (type) {
          case "House_Image":
            value["house_image"] = base64File;
            break;
          case "ID_Image":
            value["id_image"] = base64File;
            break;
          case "POB_Image":
            value["pob_image"] = base64File;
            break;
          case "IFF1_Image":
            value["iff1_image"] = base64File;
            break;
          case "IFF2_Image":
            value["iff2_image"] = base64File;
            break;
          case "IFF3_Image":
            value["iff3_image"] = base64File;
            break;
          case "IFF4_Image":
            value["iff4_image"] = base64File;
            break;
          case "DPA1_Image":
            value["dpa1_image"] = base64File;
            break;
          case "DPA2_Image":
            value["dpa2_image"] = base64File;
            break;
        }
        this.uploadPhoto(value, type);
        console.log("here is encoded image ", base64File);
      },
      err => {
        console.log(err);
      }
    );
  }
  
  uploadImages(){
    [
      {
        type: "House_Image",
        value: this.houseImagePathNative
      },
      {
        type: "ID_Image",
        value: this.idImagePathNative
      },
      {
        type: "POB_Image",
        value: this.pobImagePathNative
      },
      {
        type: "IFF1_Image",
        value: this.iff1ImagePathNative
      },
      {
        type: "IFF2_Image",
        value: this.iff2ImagePathNative
      },
      {
        type: "IFF3_Image",
        value: this.iff3ImagePathNative
      },
      {
        type: "IFF4_Image",
        value: this.iff4ImagePathNative
      },
      {
        type: "DPA1_Image",
        value: this.dpa1ImagePathNative
      },
      {
        type: "DPA2_Image",
        value: this.dpa2ImagePathNative
      }
    ].forEach(e => {
      if(!!e.value){
        setTimeout(() => { this.upload(e.type, e.value) }, 1000 );
      }
    });
  }


  uploadPhoto(value, type) {
    this.uploading = true;
    this.httpService
      .patch(
        this.url + "/hh_recruitments/" + this.irfObj["id"] + "/upload",
        value,
        false
      )
      .timeout(10000)
      .subscribe(
        data => {
          value[type + "stored"] = true;
          this.irfObj[type + "stored"] = true;
          if (!!this.irfObj && !!this.irfObj.Id) {
            value = Object.assign(this.irfObj, value);
          }
          this.storage.setItem("request", value);
          this.uploading = false;
          this.showToast("Image Uploaded for "+type);
        },
        err => {
          this.uploading = false;
          let error_message
          try {
            error_message = err.error.error
          }
          catch(err) {
            error_message = err.message
          }
  
          this.showToast("Something went wrong " + error_message);
          console.log(err);
        }
      );
  }
}
