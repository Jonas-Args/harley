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
import { SqlitePanelMainService } from "../../app/services/util/sqlite-panel-main.service";
import { PanelMain } from "../../model/panelMain";
import { SqliteDocuPicService } from "../../app/services/util/sqlite-docupic.service";
import { SqliteEOPService } from "../../app/services/util/sqlite-eop.service";
import { SqliteHHPService } from "../../app/services/util/sqlite-hhp.service";
import { SignIn } from "../sign-in/sign-in.page";
declare var AdvancedGeolocation: any;

@Component({
  selector: "app-maintenance",
  templateUrl: "./maintenance.page.html",
})
export class MaintenancePage implements OnInit {
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
  loadingPanelMains = false;

  ficode;
  finame;
  date_start;
  date_end;
  selected;

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
    private sqlitePurchaseService: SqlitePurchaseService,
    private sqlitePanelMainService: SqlitePanelMainService,
    private sqliteDocupicService: SqliteDocuPicService,
    private sqliteEopService: SqliteEOPService,
    private sqliteHHPService: SqliteHHPService,
  ) {
  }

  ngOnInit() {
    // this.sqliteService.dropTable();
    // this.getAllData();
    this.getObj()
  }


  getObj() {
    this.nativeStorage.getItem('maintenace')
      .then(
        (obj) => {
          if (!!obj) {
            this.finame = obj.finame;
            this.ficode = obj.ficode;
          }
        },
        error => {
        }
      );
  }

  saveObj() {
    let obj = {
      ficode: this.ficode,
      finame: this.finame
    }
    this.nativeStorage.setItem('maintenace', obj)
      .then(
        () => {
          this.showToast("FIname FIcode saved")
        },
        error => console.error('Error storing item', error)
      );
  }

  get_last_saved() {
    this.sqliteService.getLastData().then(
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

  searchRetrieval() {
    this.sqliteService.searchByDate(this.date_start, this.date_end).then(
      (data: any) => {
        this.sqliteService.getAllData().then(
          (data: any) => {
            let result = [];
            for (let i = 0; i < data.rows.length; i++) {
              let item = data.rows.item(i);
              // do something with it
              console.log(item)
              result.push(item);
            }
            console.log("serach data", result.length);
          },
          (error) => console.error("Error storing item", error)
        );

        this.get_last_saved();
      },
      (error) => console.error("Error storing item", error)
    );
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


  showToast(message) {
    message = message || "null";
    this.toast.show(message, "5000", "top").subscribe((toast) => {
      console.log(toast);
    });
  }

  verifyUser(method) {
    let user = {
      FINAME: this.finame,
    }
    this.httpService
      .post(this.url + "/users/verify", user, false)
      .timeout(10000)
      .subscribe(
        (data) => {
          if (data.success == true && !!data.user) {
            if (data.user['STATUS'] == 'ENABLED') {
              let obj = {
                ficode: data.user['USERID'],
                finame: data.user['FINAME'],
                access_type: data.user['ACCESSTYPE']
              }
              debugger
              this.nativeStorage.setItem('maintenace', obj)
                .then(
                  () => {
                    debugger
                    if (method == 'loadProdMaster') {
                      this.loadProdMaster()
                    } else {
                      this.loadPanelMain()
                    }
                  },
                  error => console.error('Error storing item', error)
                );
            } else {
              this.showToast("You have no access to this application. Contact the supervisor.")
              this.nativeStorage.remove("maintenace")
              this.sqlitePanelMainService.dropTable().then(res => {
                this.sqlitePanelMainService.createTable().then(res => {
                  this.navCtrl.setRoot(SignIn)
                })
              })
            }
          } else {
            this.showToast("Invalid Credentials")
          }
        },
        (err) => {
          this.showToast("Something went wrong" + err.message);
        }
      );
  }
  loadProdMaster() {
    this.loadingLookupTable = true;
    this.httpService
      .get(this.url + "/product_masters", false)
      .timeout(1800000)
      .subscribe(
        (data) => {
          if (data["success"] == true) {
            this.sqlitePurchaseService.dropTable().then(() => {
              this.sqlitePurchaseService.createTable().then(
                (result) => {
                  for (let i = 0; i < data["result"].length; i++) {
                    let item = new PurchaseItem(data["result"][i]);
                    // do something with it
                    setTimeout(() => {
                      this.sqlitePurchaseService.addData(item).then(
                        (res) => {
                          console.log(
                            "comparing",
                            i + 1,
                            data["result"].length
                          );
                          if (i + 1 == data["result"].length) {
                            this.zone.run(() => {
                              this.loadingLookupTable = false;
                              this.showToast("DONE")
                            });
                          }
                        },
                        (error) => {
                          console.log("error", error);
                          if (i + 1 == data["result"].length) {
                            this.zone.run(() => {
                              this.loadingLookupTable = false;
                            });
                          }
                        }
                      );
                    }, 200);
                  }
                },
                (err) => {
                  console.log(err);
                  this.zone.run(() => {
                    this.loadingLookupTable = false;
                  });
                }
              );
            });
          }
        },
        (err) => {
          this.url;
          this.zone.run(() => {
            // this.uploading = false;
          });
          this.showToast("Something went wrong" + err.message);
          console.log(err);
        }
      );
  }

  loadPanelMain() {
    let query = '/panel_mains'
    if (!!this.finame) {
      query = query + '?finame=' + this.finame
    }
    this.loadingPanelMains = true;
    this.httpService
      .get(this.url + query, false)
      .timeout(1800000)
      .subscribe(
        (data) => {

          if (data["success"] == true) {
            this.sqlitePanelMainService.dropTable().then(() => {
              this.sqlitePanelMainService.createTable().then(
                (result) => {
                  for (let i = 0; i < data["result"].length; i++) {
                    let item = new PanelMain(data["result"][i]);
                    // do something with it
                    setTimeout(() => {
                      this.sqlitePanelMainService.addData(item).then(
                        (res) => {
                          console.log(
                            "comparing",
                            i + 1,
                            data["result"].length
                          );
                          if (i + 1 == data["result"].length) {
                            this.zone.run(() => {
                              this.loadingPanelMains = false;
                              this.showToast("Loading list of panelist.  DONE.")
                            });
                          }
                        },
                        (error) => {
                          console.log("error", error);
                          if (i + 1 == data["result"].length) {
                            this.zone.run(() => {
                              this.loadingPanelMains = false;
                            });
                          }
                        }
                      );
                    }, 200);
                  }
                },
                (err) => {
                  console.log(err);
                  this.zone.run(() => {
                    this.loadingPanelMains = false;
                  });
                }
              );
            });
          }
        },
        (err) => {
          this.url;
          this.zone.run(() => {
            // this.uploading = false;
          });
          this.showToast("Something went wrong" + err.message);
          console.log(err);
        }
      );
  }

  loadEOPs() {
    this.selected = 'eop'
    this.sqliteEopService.searchByDate(this.date_start, this.date_end).then(
      (data: any) => {
        let result = [];
        for (let i = 0; i < data.rows.length; i++) {
          let item = data.rows.item(i);
          // do something with it
          console.log(item)
          result.push(item);
        }
        this.zone.run(() => {
          let synchable = this.requests
          this.requests = result
        });
        console.log("eop data", result.length);
      },
      (error) => {
        this.showToast("Error getting data")
      }
    );
  }

  loadHhps() {
    this.selected = 'hhp'
    this.sqliteHHPService.searchByDate(this.date_start, this.date_end).then(
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
        console.log("hhp data", result.length);
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
        let synchable = this.requests
        for (let i = 0; i < data.rows.length; i++) {
          let item = data.rows.item(i);
          // do something with it
          console.log(item)
          result.push(item);
        }
        this.zone.run(() => {
          this.requests = result
        });
        console.log("images data", result.length);
      },
      (error) => {
        this.showToast("Error getting data")
      }
    );
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

  delete() {
    switch (this.selected) {
      case 'retrieval':
        this.deleteRetrievals()
        break;
      case 'images':
        this.deleteImages()
        break;
      case 'eop':
        this.deleteEops()
        break;
      case 'hhp':
        this.deleteHhps()
        break;
    }
  }

  deleteRetrievals() {
    let ids = this.requests.map(res => res.rowId)
    this.sqliteService.deleteAll(ids).then(
      (data: any) => {
        this.loadretrievals()
      },
      (error) => {
        this.showToast("Error getting data")
      }
    );
  }

  deleteImages() {
    let ids = this.requests.map(res => res.rowId)
    this.sqliteDocupicService.deleteAll(ids).then(
      (data: any) => {
        this.loadImages()
      },
      (error) => {
        this.showToast("Error getting data")
      }
    );
  }
  deleteEops() {
    let ids = this.requests.map(res => res.rowId)
    this.sqliteEopService.deleteAll(ids).then(
      (data: any) => {
        debugger
        this.loadEOPs()
      },
      (error) => {
        this.showToast("Error getting data")
      }
    );
  }
  deleteHhps() {
    let ids = this.requests.map(res => res.rowId)

    this.sqliteHHPService.deleteAll(ids).then(
      (data: any) => {
        this.loadHhps()
      },
      (error) => {
        this.showToast("Error getting data")
      }
    );
  }
}
