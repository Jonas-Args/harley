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

declare var AdvancedGeolocation: any;

@Component({
  selector: "app-data-sync",
  templateUrl: "./data-sync.page.html",
})
export class DataSyncPage implements OnInit {
  // url = "http://api.uniserve.ph";
  url = "http://10.0.2.2:3000";
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

  constructor(
    private toast: Toast,
    public navCtrl: NavController,
    private sqliteService: SqliteService,
    private platform: Platform,
    private httpService: HttpService,
    private zone: NgZone,
    private sqliteDocupicService: SqliteDocuPicService,
    private fTP: FTP
  ) {
  }

  ngOnInit() {
    // this.sqliteService.dropTable();
    // this.getAllData();
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      // this.getAllData();
    });
  }
  handleError(err) {
    console.log("something went wrong: ", err);
  }


  loadretrievals() {
    this.selected = 'retrieval'
    this.sqliteService.searchByDate(this.date_start, this.date_end).then(
      (data: any) => {
        let result = [];
        for (let i = 0; i < data.rows.length; i++) {
          let item = data.rows.item(i);
          // do something with it
          console.log(item)
          result.push(item);
        }
        this.zone.run(() => {
          this.requests = result
        });
        console.log("serach data", result.length);
      },
      (error) => {
        this.showToast("Error getting data")
      }
    );
  }

  loadImages() {
    this.selected = 'images'
    this.sqliteDocupicService.searchByDate(this.date_start, this.date_end).then(
      (data: any) => {
        let result = [];
        debugger
        for (let i = 0; i < data.rows.length; i++) {
          let item = data.rows.item(i);
          // do something with it
          console.log(item)
          result.push(item);
        }
        this.zone.run(() => {
          this.requests = result
        });
        console.log("serach data", result.length);
      },
      (error) => {
        this.showToast("Error getting data")
      }
    );
  }

  showToast(message) {
    message = message || "null";
    this.toast.show(message, "5000", "top").subscribe((toast) => {
      console.log(toast);
    });
  }

  sync() {
    switch (this.selected) {
      case 'retrieval':
        this.syncRetrieval()
        break;
      case 'images':
        this.syncImages()
        break;
    }
  }
  syncImages() {
    this.synching = true;
    let synchable = this.requests.filter(res => res.stored != 'true')
    synchable.forEach(res => {
      setTimeout(() => {
        this.httpService
          .post(this.url + "/retrieval_monitorings/upload", res, false)
          .timeout(10000)
          .subscribe(
            data => {
              this.uploadFtp(res)
            },
            err => {
              this.zone.run(() => {
                this.synching = false;
                this.showToast("Something went wrong" + err.message);
                console.log(err);
              });
            }
          );
      }, 200);
    })

    setTimeout(() => {
      this.zone.run(() => {
        this.synching = false;
        this.loadImages()
      });
    }, 1000 * synchable.length)
  }

  uploadFtp(row) {
    let filePath = row.image_path;
    let remotePath =
      "/" + row.panel_code + row.period_code;
    let remotePathFile =
      "/" +
      row.panel_code +
      row.period_code +
      "/" +
      row.panel_code +
      "_" +
      row.period_code +
      "_" +
      row["page_num"] +
      ".jpeg";
    this.fTP.mkdir(remotePath).then(
      res => {
        this.ftpUpload(filePath, remotePathFile, row);
      },
      err => {
        this.ftpUpload(filePath, remotePathFile, row);
      }
    );
  }


  ftpUpload(filePath, remotePathFile, row) {
    debugger
    this.fTP.upload(filePath, remotePathFile).subscribe(
      res => {
        this.zone.run(() => {
          row["stored"] = true;
          let docupic = new DocuPic(row)
          this.sqliteDocupicService.editData(docupic).then(
            (data: any) => {

            },
            error => {
              this.synching = false
              this.showToast("Something went wrong: Code1")
            }
          );
        });
      },
      error => {
        this.zone.run(() => {
          this.synching = false
        });
        debugger
        this.showToast("Something went wrong" + error);
      }
    );
  }

  syncRetrieval() {
    this.synching = true;
    let synchable = this.requests.filter(res => res.stored != 'true')
    synchable.forEach(res => {
      setTimeout(() => {
        this.httpService
          .post(this.url + "/retrieval_monitorings", res, false)
          .timeout(10000)
          .subscribe(
            data => {
              if (data["success"] == true) {
                res["stored"] = true;
                this.sqliteService.editData(res).then(
                  (data: any) => {
                  },
                  error => {
                    this.synching = false
                    this.showToast("Something went wrong: Code2")
                    console.error("Error storing item", error);
                  }
                );
              }
            },
            err => {
              this.synching = false
              this.showToast("Something went wrong" + err.message);
              console.log(err);
            }
          );
      }, 200);
    })

    setTimeout(() => {
      this.zone.run(() => {
        this.synching = false;
        this.loadretrievals()
      });
    }, 200 * synchable.length)
  }

  // getAllData() {
  //   this.sqliteService.createTable().then(
  //     (data: any) => {
  //       this.sqliteService.getAllData().then(
  //         (data: any) => {
  //           let result = [];
  //           for (let i = 0; i < data.rows.length; i++) {
  //             let item = data.rows.item(i);
  //             // do something with it
  //             result.push(item);
  //           }
  //           console.log("all data", result.length);
  //           this.requests = result;
  //         },
  //         (error) => console.error("Error storing item", error)
  //       );
  //     },
  //     (error) => console.error("Error storing item", error)
  //   );
  // }
}
