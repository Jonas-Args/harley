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
  BackgroundGeolocationEvents
} from "@ionic-native/background-geolocation";
import { HttpService } from "../../app/services/util/http.service";
import { SqlitePanelMainService } from "../../app/services/util/sqlite-panel-main.service";
import { SqliteDocuPicService } from "../../app/services/util/sqlite-docupic.service";
import { PictureSourceType, CameraOptions, Camera } from "@ionic-native/camera";
import { FilePath } from "@ionic-native/file-path";
import { File } from "@ionic-native/file";
import { DocuPic } from "../../model/docuPic";
import { FTP } from "@ionic-native/ftp";

@Component({
  selector: "app-retrieval",
  templateUrl: "./retrieval-item.page.html"
})
export class RetrievalItemPage implements OnInit {
  url = "http://api.uniserve.ph";
  // url = "http://10.0.2.2:3000";

  formPanel: FormGroup;
  isBarcodeScanned = false;
  location;
  tagPanelObj;
  showZeroRemarks = false;
  irfId;
  irfObj: any = { stored: 'false' };
  date_send;
  isCaptureLoc = false;
  connectedToNet = false;
  saving = false;
  uploading = false;
  mainpanelcode
  page_number = "";
  houseImagePathNative;
  houseImageImagePath;
  imageSrc;
  takingPicture = false;
  images = [];
  selectedAction = ''

  private win: any = window;
  constructor(
    private barcodeScanner: BarcodeScanner,
    private sms: SMS,
    private storage: StorageService,
    private fb: FormBuilder,
    private toast: Toast,
    public navCtrl: NavController,
    private nativeStorage: NativeStorage,
    private navParams: NavParams,
    private sqliteService: SqliteService,
    private plt: Platform,
    private zone: NgZone,
    private backgroundGeolocation: BackgroundGeolocation,
    private network: Network,
    private httpService: HttpService,
    private sqlitePanelService: SqlitePanelMainService,
    private sqliteDocupicService: SqliteDocuPicService,
    private camera: Camera,
    private filePath: FilePath,
    private file: File,
    private platform: Platform,
    private fTP: FTP,
  ) {
    this.formPanel = fb.group({
      rowId: ["", [Validators.required]],
      panel_code: ["", [Validators.required]],
      project: ["", [Validators.required]],
      panel_name: ["", [Validators.required]],
      panel_status: ["", [Validators.required]],
      panel_remarks: [""],
      panel_receipted: [""],
      fi_name: [""],
      region: [""],
      year: ["", [Validators.required]],
      period: ["", [Validators.required]],
      week: ["", [Validators.required]],
      period_code: ["", [Validators.required]],
      date_retrieved: ["", [Validators.required]],
      zero_remarks: ["", [Validators.required]],
      call_length: ["", [Validators.required]],
      sms: ["", [Validators.required]],
      calls: ["", [Validators.required]]
    });

    // add field here
    this.formPanel.get("panel_status").valueChanges.subscribe(value => {
      if (value == "ZERO") {
        this.showZeroRemarks = true;
      } else {
        this.showZeroRemarks = false;
      }
    });
    // add field here
  }

  statuses = [
    { value: "RETRIEVED" },
    { value: "ZERO" },
    { value: "NA" },
    { value: "HATCHING" },
    { value: "DROPPED" },
    { value: "CALLBACK" },
    { value: "UNATTENDED" },
    { value: "REFUSED" }
  ];

  ngOnInit() {
    this.plt.ready().then(readySource => {
      this.irfId = this.navParams.get("irfId") || "";
      if (!!this.irfId) {
        console.log("irfId", this.irfId);
        this.findData();
      }
      // this.sqliteService.dropTable()
      // this.sqliteDocupicService.dropTable()
      this.sqliteService.createTable()
      this.sqliteDocupicService.createTable()
    });
  }

  findData() {
    this.sqliteService.find(this.irfId).then(
      (data: any) => {
        this.zone.run(() => {
          this.irfObj = data.rows.item(0);
          console.log("found item", this.irfObj);
          this.formPanel.patchValue(this.irfObj);
          this.searchPanelCode()
          this.getAllImages()
        });
      },
      error => console.error("Error storing item", error)
    );
  }

  searchPanelCode() {
    let value = this.formPanel.value
    value["date_retrieved"] = value["date_retrieved"].split("T")[0]
    this.sqlitePanelService.search(this.formPanel.value["panel_code"]).then((res: any) => {
      if (res.rows.length == 1) {
        if (!!res.rows.item(0)) {
          this.mainpanelcode = res.rows.item(0)
          this.formPanel.get("fi_name").setValue(this.mainpanelcode.fi_name)
          this.formPanel.get("panel_name").setValue(this.mainpanelcode.panel_fname)
          if (this.irfObj.region == null) {
            this.formPanel.get("region").setValue(this.mainpanelcode.region)
          }
          this.formPanel.get("project").setValue(this.mainpanelcode.proj_type)
        }
      }
      else if (res.rows.length > 1) {
        this.showToast("Multiple match to panelcode")
      } else {
        this.showToast("Panelcode did not match")
      }
    })
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


  ionViewDidEnter() {
    this.plt.ready().then(() => {
      if (this.network.type != "none") {
        console.log("network connected!");
        this.connectedToNet = true;
      } else {
        this.connectedToNet = false;
      }
      this.watchNetwork();
      this.fTP
        .connect(
          "ftp2.uniserve.ph",
          "diaries@ftp2.uniserve.ph",
          "DiarieS010101"
        )
        .then((res: any) => {
          console.log("Login successful", res);
        })
        .catch((error: any) => {
          console.error(error);
        });
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

  sendSMS(action = null) {
    this.selectedAction = action || this.selectedAction
    if (!this.validate()) {
      return
    }
    if (this.isDataValid(this.formPanel.value)) {
      console.log("sending", this.formatMessage());
      this.date_send = new Date().toLocaleString();
      this.sms.send("09177131456", this.formatMessage()).then(
        () => {
          this.save(this.formPanel.value);
          console.log("message sent");
        },
        error => console.error("Error removing item", error)
      );
    }
  }

  validate() {

    if (this.formPanel.value["panel_status"] == "" || this.formPanel.value["panel_status"] == null) {
      this.showToast("Panel Status should not be blank.")
      return false
    }
    return true;
  }

  formatMessage() {
    let formValue = this.formPanel.value;
    let message =
      "RET;" +
      `${formValue.project || ""};` +
      `${formValue.panel_code || ""};` +
      `${formValue.period_code || ""};` +
      `${formValue.panel_name || ""};` +
      `${formValue.panel_status || ""};` +
      `${formValue.panel_remarks || ""};` +
      `${formValue.fi_name || ""};` +
      `${formValue.region || ""};` +
      `${formValue.date_retrieved || ""};` +
      `${formValue.call_length || ""};` +
      `${formValue.sms || ""};` +
      `${formValue.calls || ""};`
    // add field here
    return message;
  }

  save(value = this.formPanel.value, action = null) {
    this.selectedAction = action || this.selectedAction
    if (!this.validate()) {
      return
    }
    this.saving = true;
    this.zone.run(() => {
      value.rowId = this.irfId;
      value = Object.assign(this.irfObj, value);
      console.log("editing data", value);
      this.sqliteService.editData(value).then(
        (data: any) => {
          console.log("retrieved new data", data);
          console.log("popping", data);
          if (this.selectedAction != 'sync') {
            this.navCtrl.pop();
          } else {

            this.zone.run(() => {
              this.showToast("Your data is synced")
            });

          }
          this.saving = false;
        },
        error => {
          console.error("Error storing item", error);
          this.saving = false;
        }
      );
    });
  }

  sync(action = null) {
    this.selectedAction == action
    if (!this.validate()) {
      return
    }
    console.log("syncing", this.formPanel.value);
    this.uploading = true;

    this.httpService
      .post(this.url + "/retrieval_monitorings", this.formPanel.value, false)
      .timeout(10000)
      .subscribe(
        data => {
          if (data["success"] == true) {
            let value = this.formPanel.value;
            value["stored"] = 'true';

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
              error => {
                console.error("Error storing item", error);
                this.zone.run(() => {
                  this.saving = false;
                });
              }
            );

            this.zone.run(() => {
              this.uploading = false;
            });
            this.sendSMS();
          }
        },
        err => {
          this.url;
          this.zone.run(() => {
            this.uploading = false;
          });
          this.showToast("Something went wrong" + err.message);
          console.log(err);
        }
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

  openGallery(type) {
    let cameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI,
      quality: 70,
      targetWidth: 500,
      targetHeight: 500,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true
    }

    this.camera.getPicture(cameraOptions)
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
                .checkDir(this.file.externalRootDirectory, this.directory())
                .then(response => {
                  console.log("Directory exists" + response);
                  this.moveToFile(imagePath, imageName, type);
                })
                .catch(err => {
                  console.log("Directory doesn't exist" + JSON.stringify(err));
                  this.file
                    .createDir(
                      this.file.externalRootDirectory,
                      this.directory(),
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
            ;
            console.error(err);
          });
      },
        err => console.log(err));
  }

  getTrustImg(imageSrc) {
    let path = this.win.Ionic.WebView.convertFileSrc(imageSrc);
    console.log(path);
    return path;
  }

  takePicture(
    type,
    sourceType: PictureSourceType = this.camera.PictureSourceType.CAMERA
  ) {
    this.takingPicture = true;
    const options: CameraOptions = {
      quality: 40,
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
                .checkDir(this.file.externalRootDirectory, this.directory())
                .then(response => {
                  console.log("Directory exists" + response);
                  this.moveToFile(imagePath, imageName, type);
                })
                .catch(err => {
                  console.log("Directory doesn't exist" + JSON.stringify(err));
                  this.file
                    .createDir(
                      this.file.externalRootDirectory,
                      this.directory(),
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
            ;
            console.error(err);
          });
      })
      .catch(err => {
        ;
        console.error(err);
      });
  }

  directory() {
    let panel_code = this.formPanel.get("panel_code").value;
    let period_code = this.formPanel.get("period_code").value;

    return "docupic/" + panel_code + "_" + period_code;
  }

  moveToFile(imagePath, imageName, type) {
    this.file
      .moveFile(
        imagePath,
        imageName,
        this.file.externalRootDirectory + this.directory() + "/",
        this.imageName()
      )
      .then(newFile => {
        switch (type) {
          case "House_Image":
            this.houseImageImagePath = this.getTrustImg(newFile.nativeURL);
            this.houseImagePathNative = newFile.nativeURL;
            this.saveImage();
            break;
          default:
        }
        console.log(newFile);
      })
      .catch(err => {
        ;
        console.error(err);
      });
  }

  imageName() {
    let panel_code = this.formPanel.get("panel_code").value;
    let period_code = this.formPanel.get("period_code").value;
    return panel_code + "_" + period_code + "_" + this.page_number + ".jpeg";
  }

  saveImage() {
    let newvalue = {
      page_num: this.page_number,
      image_path: this.houseImagePathNative,
      imageDisplay: this.houseImageImagePath,
      irf_id: this.irfObj.rowId,
      stored: 'false',
      panel_code: this.irfObj.panel_code,
      period_code: this.irfObj.period_code,
      date_retrieved: new Date().toISOString().split("T")[0]
    };
    let docupic = new DocuPic(newvalue)
    this.sqliteDocupicService.addData(docupic).then((res: any) => {
      this.getAllImages()
      this.page_number = "";
      this.houseImagePathNative = null;
      this.houseImageImagePath = null;
    }, error => {
      this.showToast("Something went wrong")
      console.log("error")
    })

    this.page_number = "";
    this.houseImagePathNative = null;
    this.houseImageImagePath = null;
    //sql save
  }

  uploadImage(index, row) {
    if (!this.irfObj.stored) {
      this.showToast("Make sure to sync data first")
    } else {
      this.uploading = true;
      this.httpService.post(this.url + "/retrieval_monitorings/upload", this.image_upload_params(row), false)
        .timeout(10000).subscribe(
          data => {
            if (data.success) {
              this.uploadFtp(row, index)
            }
          }, error => {
            this.showToast("Something went wrong");
          })


    }
  }

  uploadFtp(row, index) {
    let filePath = row.image_path;
    let remotePath =
      "/" + this.formPanel.value.panel_code + this.formPanel.value.period_code;
    let remotePathFile =
      "/" +
      this.formPanel.value.panel_code +
      this.formPanel.value.period_code +
      "/" +
      this.formPanel.value.panel_code +
      "_" +
      this.formPanel.value.period_code +
      "_" +
      row["page_num"] +
      ".jpeg";
    this.fTP.mkdir(remotePath).then(
      res => {
        this.ftpUpload(index, filePath, remotePathFile);
      },
      err => {
        console.log(err);
        let a = filePath
        let b = remotePathFile
        let c = index
        this.ftpUpload(index, filePath, remotePathFile);
      }
    );
  }

  image_upload_params(obj) {
    return {
      period_code: this.formPanel.value.period_code,
      panel_code: this.formPanel.value.panel_code,
      diary_page_number: obj.page_num,
      folder_name: this.folder_name(),
      image_file_name: this.image_file_name(obj.page_num)
    }
  }

  folder_name() {
    return this.formPanel.value.panel_code + this.formPanel.value.period_code
  }

  image_file_name(page_num) {
    this.formPanel.value.panel_code + '_' + this.formPanel.value.period_code + '_' + page_num + ".jpeg"
  }

  ftpUpload(index, filePath, remotePathFile) {

    this.fTP.upload(filePath, remotePathFile).subscribe(
      res => {
        this.zone.run(() => {
          this.uploading = false;
          this.images[index]["stored"] = 'true';
          this.showToast("Image Uploaded");
          let docupic = new DocuPic(this.images[index])
          this.sqliteDocupicService.editData(docupic).then(res => {
            console.log("edited picture")
          })
        });
      },
      error => {
        this.zone.run(() => {
          this.uploading = false;
        });
        this.showToast("Something went wrong" + error);
      }
    );
  }

  getAllImages() {
    this.sqliteDocupicService.createTable().then(
      (data: any) => {
        this.sqliteDocupicService.search(this.irfObj.rowId).then(
          (data: any) => {
            let result = []
            for (let i = 0; i < data.rows.length; i++) {
              let item = data.rows.item(i);
              // do something with it
              let value = {
                page_num: item.page_num,
                image_path: item.image_path,
                irf_id: item.irf_id,
                imageDisplay: this.getTrustImg(item.image_path),
                rowId: item.rowId,
                panel_code: this.irfObj.panel_code,
                period_code: this.irfObj.period_code,
                stored: item.stored
              };
              console.log("value", item)
              result.push(value);
            }
            this.images = result
          },
          error => console.error("Error storing item", error)
        );
      },
      error => console.error("Error storing item", error)
    );
  }

  removePicture(index, row) {
    this.sqliteDocupicService.deleteData(row.rowId).then(res => {
      this.images.splice(index, 1);
    }, error => {
      this.showToast(error)
    })
  }
}
