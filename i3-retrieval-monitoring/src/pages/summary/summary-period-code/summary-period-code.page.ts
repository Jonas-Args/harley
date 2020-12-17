import { Component, OnInit, OnDestroy } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { SMS } from "@ionic-native/sms";
import { StorageService } from "../../../app/services/util/storage.service";
import { Toast } from "@ionic-native/toast";
import { NativeStorage } from "@ionic-native/native-storage";
import { NavController, NavParams, Platform } from "ionic-angular";
import { SqliteService } from "../../../app/services/util/sqlite.service";
import { DocuPic } from "../../../model/docuPic";
import {
  BackgroundGeolocation,
  BackgroundGeolocationConfig,
  BackgroundGeolocationResponse,
} from "@ionic-native/background-geolocation";
import { RetrievalItemPage } from "../../retrieval-item/retrieval-item.page";
import { HttpService } from "../../../app/services/util/http.service";
import { NgZone } from "@angular/core";
import { SqlitePurchaseService } from "../../../app/services/util/sqlite-purchase.service";
import { PurchaseItem } from "../../../model/purchaseItem";
import { SqlitePurchaseEntryService } from "../../../app/services/util/sqlite-purchase-entry.service";
import { PurchaseEntry } from "../../../model/purchaseEntry";
import { PurchaseItemPage } from "../../purchase-item/purchase-item.page";
import { SqlitePanelMainService } from "../../../app/services/util/sqlite-panel-main.service";
import { PanelMain } from "../../../model/panelMain";
import { SqliteDocuPicService } from "../../../app/services/util/sqlite-docupic.service";
import { FTP } from "@ionic-native/ftp";
import { SqliteEOPService } from "../../../app/services/util/sqlite-eop.service";
import { SqliteHHPService } from "../../../app/services/util/sqlite-hhp.service";
import { EopPurchase } from "../../../model/eopPurchase";
import { Irf } from "../../../model/irf";
import { HhpPurchase } from "../../../model/hhpPurchase";
import { File } from "@ionic-native/file";
import { Network } from "@ionic-native/network";

declare var AdvancedGeolocation: any;

@Component({
  selector: "app-summary-period-code",
  templateUrl: "./summary-period-code.page.html",
})
export class SummaryPeriodCodePage implements OnInit {
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
  statuses = []
  result = {}

  synching = false;
  exporting = false;
  selected;

  date_start;
  date_end;
  finame;
  connectedToNet = false;
  numberToSync;
  myObject = Object
  tableType;
  statuses_keys = [
    { value: "RETRIEVED" },
    { value: "ZERO" },
    { value: "NA" },
    { value: "HATCHING" },
    { value: "DROPPED" },
    { value: "MY LOCATION" },
  ];

  per_period: any = {}
  constructor(
    private toast: Toast,
    public navCtrl: NavController,
    private sqliteService: SqliteService,
    private platform: Platform,
    private httpService: HttpService,
    private zone: NgZone,
    private sqliteDocupicService: SqliteDocuPicService,
    private sqliteEopService: SqliteEOPService,
    private sqliteHHPService: SqliteHHPService,
    private fTP: FTP,
    private file: File,
    private nativeStorage: NativeStorage,
    private network: Network,
    private sqlitePurchaseService: SqlitePurchaseEntryService,
  ) {
  }

  ngOnInit() {
    this.nativeStorage.getItem('selectedSummaryTable')
      .then(
        (value) => {
          this.tableType = value
          console.log("table value", this.tableType)
          console.log(value)
          if (value == 'eop_purchase') {
            this.tableType = value
            console.log("purchase")
          } else if (value == 'retrieval') {
            this.tableType = value
            console.log("retrieval")
          } else if (value == 'hhp_purchase') {
            this.tableType = value
            console.log("retrieval")
          }
        },
        error => console.error('Error storing item', error)
      );
  }

  getRetrievalData() {
    if (this.tableType == 'eop_purchase') {
      this.getRetrievalDataPurchaseEOP()
    } else if (this.tableType == 'hhp_purchase') {
      this.getRetrievalDataPurchaseHHP()
    } else if (this.tableType == 'retrieval') {
      this.retrieval()
    }
  }

  retrieval() {
    this.sqliteService.searchByDate(this.date_start, this.date_end).then(
      (data: any) => {
        let result = [];
        for (let i = 0; i < data.rows.length; i++) {
          let item = data.rows.item(i);
          // do something with it
          console.log(item)
          result.push(item);
        }
        console.log("serach data", result.length);
        this.requests = result
        this.statuses = this.grouBy(this.requests, "panel_status")

        this.statuses_keys.forEach(element => {
          let el: string = element.value
          if (!!this.statuses[el]) {
            this.per_period[el] = this.grouBy(this.statuses[el], "period_code")
            console.log("per_period", this.per_period[el]);
          }
        });

        console.log("statuses", this.statuses);
        this.requests
      },
      (error) => console.error("Error storing item", error)
    );
  }

  getRetrievalDataPurchaseEOP() {
    this.sqliteEopService.searchByDate(this.date_start, this.date_end).then(
      (data: any) => {
        let result = [];
        for (let i = 0; i < data.rows.length; i++) {
          let item = data.rows.item(i);
          // do something with it
          console.log(item)
          result.push(item);
        }
        console.log("serach data", result.length);
        this.requests = result
        this.statuses = this.grouBy(this.requests, "period_code")

        console.log("statuses", this.statuses);
        this.requests
      },
      (error) => console.error("Error storing item", error)
    );
  }

  getRetrievalDataPurchaseHHP() {
    this.sqliteHHPService.searchByDate(this.date_start, this.date_end).then(
      (data: any) => {
        let result = [];
        for (let i = 0; i < data.rows.length; i++) {
          let item = data.rows.item(i);
          // do something with it
          console.log(item)
          result.push(item);
        }
        console.log("serach data", result.length);
        this.requests = result
        this.statuses = this.grouBy(this.requests, "period_code")

        console.log("statuses", this.statuses);
        this.requests
      },
      (error) => console.error("Error storing item", error)
    );
  }

  grouBy(xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  // ionViewDidEnter() {
  //   this.platform.ready().then(() => {
  //     if (this.network.type != "none") {
  //       console.log("network connected!");
  //       this.connectedToNet = true;
  //     } else {
  //       this.connectedToNet = false;
  //     }
  //     this.watchNetwork();
  //     this.fTP
  //       .connect(
  //         "ftp2.uniserve.ph",
  //         "diaries@ftp2.uniserve.ph",
  //         "DiarieS010101"
  //       )
  //       .then((res: any) => {
  //         console.log("Login successful", res);
  //       })
  //       .catch((error: any) => {
  //         console.error(error);
  //       });
  //     this.setFiName();
  //   });
  // }

  // watchNetwork() {
  //   console.log("watching network");
  //   this.network.onDisconnect().subscribe(() => {
  //     this.showToast("Disconnected from network");
  //     console.log("network disconnected!");
  //     this.connectedToNet = false;
  //   });

  //   this.network.onConnect().subscribe(() => {
  //     console.log("network connected!");
  //     // We just got a connection but we need to wait briefly
  //     // before we determine the connection type. Might need to wait.
  //     // prior to doing any api requests as well.
  //     setTimeout(() => {
  //       this.showToast("Connected to network");
  //       this.connectedToNet = true;
  //     }, 1000);
  //   });
  // }

  // handleError(err) {
  //   console.log("something went wrong: ", err);
  // }

  // loadretrievals() {
  //   this.selected = 'retrieval'
  //   this.sqliteService.searchByDate(this.date_start, this.date_end).then(
  //     (data: any) => {
  //       let result = [];
  //       for (let i = 0; i < data.rows.length; i++) {
  //         let item = data.rows.item(i);
  //         // do something with it
  //         console.log(item)
  //         result.push(item);
  //       }
  //       this.zone.run(() => {
  //         this.requests = result
  //       });
  //       console.log("serach data", result.length);
  //     },
  //     (error) => {
  //       this.showToast("Error getting data")
  //     }
  //   );
  // }

  // loadImages() {
  //   this.selected = 'images'
  //   this.sqliteDocupicService.searchByDate(this.date_start, this.date_end).then(
  //     (data: any) => {
  //       let result = [];
  //       let synchable = this.requests
  //       for (let i = 0; i < data.rows.length; i++) {
  //         let item = data.rows.item(i);
  //         // do something with it
  //         console.log(item)
  //         result.push(item);
  //       }
  //       this.zone.run(() => {
  //         this.requests = result
  //       });
  //       console.log("images data", result.length);
  //     },
  //     (error) => {
  //       this.showToast("Error getting data")
  //     }
  //   );
  // }

  // showToast(message) {
  //   message = message || "null";
  //   this.toast.show(message, "5000", "top").subscribe((toast) => {
  //     console.log(toast);
  //   });
  // }

  // sync() {
  //   switch (this.selected) {
  //     case 'retrieval':
  //       this.syncRetrieval()
  //       break;
  //     case 'images':
  //       this.synching = true;
  //       this.syncImages(0)

  //       break;
  //     case 'eop':
  //       this.syncEop()
  //       break;
  //     case 'hhp':
  //       this.syncHhp()
  //       break;
  //   }
  // }

  // syncEop() {
  //   this.synching = true;
  //   let synchable = this.requests
  //   synchable.forEach(res => {
  //     setTimeout(() => {
  //       this.httpService
  //         .post(this.url + "/eop_purchases", res, false)
  //         .timeout(120000)
  //         .subscribe(
  //           data => {
  //             if (data["success"] == true) {
  //               res["stored"] = 'true';
  //               res["serverId"] = data["id"];
  //               let eop = new EopPurchase(res)
  //               this.sqliteEopService.editData(eop).then(
  //                 (data: any) => {
  //                 },
  //                 error => {
  //                   this.synching = false
  //                   this.showToast("Something went wrong: Code2")
  //                   console.error("Error storing item", error);
  //                 }
  //               );
  //             }
  //           },
  //           err => {
  //             this.synching = false
  //             this.showToast("Something went wrong" + err.message);
  //             console.log(err);
  //           }
  //         );
  //     }, 200);
  //   })
  //   setTimeout(() => {
  //     this.zone.run(() => {
  //       this.synching = false;
  //       this.loadEOPs()
  //     });
  //   }, 500 * synchable.length)
  // }

  // syncHhp() {
  //   this.synching = true;
  //   let synchable = this.requests
  //   synchable.forEach(res => {
  //     setTimeout(() => {
  //       this.httpService
  //         .post(this.url + "/hhp_purchases", res, false)
  //         .timeout(120000)
  //         .subscribe(
  //           data => {
  //             if (data["success"] == true) {
  //               res["stored"] = 'true';
  //               res["serverId"] = data["id"];
  //               let hhp = new HhpPurchase(res)
  //               this.sqliteHHPService.editData(hhp).then(
  //                 (data: any) => {
  //                 },
  //                 error => {
  //                   this.synching = false
  //                   this.showToast("Something went wrong: Code2")
  //                   console.error("Error storing item", error);
  //                 }
  //               );
  //             }
  //           },
  //           err => {
  //             this.synching = false
  //             this.showToast("Something went wrong" + err.message);
  //             console.log(err);
  //           }
  //         );
  //     }, 200);
  //   })
  //   setTimeout(() => {
  //     this.zone.run(() => {
  //       this.synching = false;
  //       this.loadHhps()
  //     });
  //   }, 500 * synchable.length)
  // }

  // formatImages(res) {
  //   return {
  //     period_code: res["period_code"],
  //     panel_code: res["panel_code"],
  //     diary_page_number: res["page_num"],
  //     folder_name: this.folder_name(res),
  //     image_file_name: this.image_file_name(res)
  //   }
  // }

  // folder_name(res) {
  //   return res.panel_code + res.period_code
  // }

  // image_file_name(res) {
  //   return res.panel_code + '_' + res.period_code + '_' + res.page_num + ".jpeg"
  // }

  // syncImages(num) {
  //   if (num < this.requests.length && this.requests.length > 0) {
  //     let res = this.requests[num]

  //     this.httpService
  //       .post(this.url + "/retrieval_monitorings/upload", this.formatImages(res), false)
  //       .timeout(120000)
  //       .subscribe(
  //         data => {
  //           console.log("uploading now", res)
  //           this.uploadFtp(res).then((val: any) => this.ftpUpload(val.a, val.b, val.c).then(res => {
  //             console.log("num is", num)
  //             if (num + 1 == this.requests.length) {
  //               this.zone.run(() => {
  //                 this.synching = false;
  //                 this.loadImages()
  //               });
  //             } else {
  //               this.syncImages(num + 1)
  //             }
  //           }))
  //         },
  //         err => {
  //           this.zone.run(() => {
  //             this.synching = false;
  //             this.showToast("Something went wrong" + err.message);
  //             console.log(err);
  //           });
  //         }
  //       );
  //   }

  // }

  // uploadFtp(row) {
  //   let filePath = row.image_path;
  //   let remotePath =
  //     "/" + row.panel_code + row.period_code;
  //   let remotePathFile =
  //     "/" +
  //     row.panel_code +
  //     row.period_code +
  //     "/" +
  //     row.panel_code +
  //     "_" +
  //     row.period_code +
  //     "_" +
  //     row["page_num"] +
  //     ".jpeg";
  //   return new Promise((resolve) => {
  //     this.fTP.mkdir(remotePath).then(
  //       res => {
  //         console.log("result is", res)
  //         resolve({ a: filePath, b: remotePathFile, c: row, error: false })
  //       },
  //       err => {
  //         console.log("error is", err)
  //         resolve({ a: filePath, b: remotePathFile, c: row, error: true })
  //       }
  //     );
  //   });

  // }

  // ftpUpload(filePath, remotePathFile, row) {
  //   return new Promise((resolve) => {
  //     let synchable = this.requests
  //     this.fTP.upload(filePath, remotePathFile).subscribe(
  //       res => {
  //         this.zone.run(() => {
  //           console.log("Uploaded", filePath, remotePathFile)
  //           row["stored"] = true;
  //           let docupic = new DocuPic(row)
  //           this.sqliteDocupicService.editData(docupic).then(
  //             (data: any) => {
  //               console.log("resolved c")
  //               resolve(true)
  //             },
  //             error => {
  //               this.synching = false
  //               this.showToast("Something went wrong: Code1")
  //               console.log("resolved c")
  //               resolve(false)
  //             }
  //           );
  //         });
  //       },
  //       error => {
  //         this.zone.run(() => {
  //           this.synching = false
  //         });
  //         let synchable = this.requests
  //         this.showToast("Something went wrong" + error);
  //         console.log("resolved c")
  //         resolve(false)
  //       }
  //     );

  //   })
  // }

  // syncRetrieval() {
  //   this.synching = true;
  //   let synchable = this.requests
  //   synchable.forEach(res => {
  //     setTimeout(() => {
  //       this.httpService
  //         .post(this.url + "/retrieval_monitorings", res, false)
  //         .timeout(120000)
  //         .subscribe(
  //           data => {
  //             if (data["success"] == true) {
  //               res["stored"] = 'true';
  //               res["serverId"] = data["id"];
  //               let retrieval = new Irf(res)
  //               this.sqliteService.editData(retrieval).then(
  //                 (data: any) => {
  //                 },
  //                 error => {
  //                   this.synching = false
  //                   this.showToast("Something went wrong: Code2")
  //                   console.error("Error storing item", error);
  //                 }
  //               );
  //             }
  //           },
  //           err => {
  //             this.synching = false
  //             this.showToast("Something went wrong" + err.message);
  //             console.log(err);
  //           }
  //         );
  //     }, 200);
  //   })

  //   setTimeout(() => {
  //     this.zone.run(() => {
  //       this.synching = false;
  //       this.loadretrievals()
  //     });
  //   }, 200 * synchable.length)
  // }

  // loadEOPs() {
  //   this.selected = 'eop'
  //   this.sqliteEopService.searchByDate(this.date_start, this.date_end).then(
  //     (data: any) => {
  //       let result = [];
  //       for (let i = 0; i < data.rows.length; i++) {
  //         let item = data.rows.item(i);
  //         // do something with it
  //         console.log(item)
  //         result.push(item);
  //       }
  //       this.zone.run(() => {
  //         let synchable = this.requests
  //         this.requests = result
  //       });
  //       console.log("eop data", result.length);
  //     },
  //     (error) => {
  //       this.showToast("Error getting data")
  //     }
  //   );
  // }

  // loadHhps() {
  //   this.selected = 'hhp'
  //   this.sqliteHHPService.searchByDate(this.date_start, this.date_end).then(
  //     (data: any) => {
  //       let result = [];
  //       for (let i = 0; i < data.rows.length; i++) {
  //         let item = data.rows.item(i);
  //         // do something with it
  //         console.log(item)
  //         result.push(item);
  //       }
  //       this.zone.run(() => {
  //         this.requests = result
  //       });
  //       console.log("hhp data", result.length);
  //     },
  //     (error) => {
  //       this.showToast("Error getting data")
  //     }
  //   );
  // }

  // saveAsCsv() {
  //   if (!!this.requests && this.requests.length == 0) {
  //     this.showToast('No data to export')
  //     return
  //   }
  //   if (!this.finame) {
  //     this.showToast('FIname is not set in maintenance')
  //     return
  //   }
  //   this.exporting = true

  //   let csv = '';
  //   let header = Object.keys(this.requests[0]).join(',');
  //   let values = this.requests.map(o => Object.keys(o).map(key => o[key]).join(',')).join('\n');

  //   csv += header + '\n' + values;
  //   var fileName: any = "team.csv"
  //   this.file.writeFile(this.file.externalRootDirectory, fileName, csv, { replace: true })
  //     .then(
  //       _ => {
  //         let filename = '/FI_Output/' + this.tableName() + '_' + this.finame + '.csv'
  //         debugger
  //         this.ftpCSVUpload(_.nativeURL, filename)
  //       }
  //     )
  //     .catch(
  //       err => {
  //         this.file.writeExistingFile(this.file.externalRootDirectory, fileName, csv)
  //           .then(
  //             (_: any) => {
  //               let filename = '/FI_Output/' + this.tableName() + '_' + this.finame + '.csv'
  //               debugger
  //               this.ftpCSVUpload(_.nativeURL, filename)
  //             }
  //           )
  //           .catch(
  //             err => {
  //               this.exporting = false
  //             }
  //           )
  //       }
  //     )

  // }

  // tableName() {
  //   switch (this.selected) {
  //     case 'retrieval':
  //       return 'retrieval_monitorings';
  //     case 'images':
  //       return 'docu_pic_images';
  //     case 'eop':
  //       return 'eop_purchases';
  //     case 'hhp':
  //       return 'hhp_purchases';
  //   }
  // }

  // setFiName() {
  //   this.nativeStorage.getItem('maintenace')
  //     .then(
  //       (obj) => {
  //         if (!!obj) {
  //           this.finame = obj.finame;
  //         }
  //       },
  //       error => console.error('Error storing item', error)
  //     );
  // }


  // ftpCSVUpload(filePath, remotePathFile) {
  //   this.fTP.upload(filePath, remotePathFile).subscribe(
  //     res => {
  //       this.zone.run(() => {
  //         let me = res
  //         debugger
  //         this.exporting = false
  //       });
  //     },
  //     error => {
  //       this.zone.run(() => {
  //         debugger
  //         this.exporting = false
  //       });
  //       this.showToast("Something went wrong" + error);
  //     }
  //   );
  // }
}
