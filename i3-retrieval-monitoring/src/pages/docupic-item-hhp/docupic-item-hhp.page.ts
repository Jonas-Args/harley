import { Component, OnInit, NgZone } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { SMS } from "@ionic-native/sms";
import { StorageService } from "../../app/services/util/storage.service";
import { Toast } from "@ionic-native/toast";
import { NativeStorage } from "@ionic-native/native-storage";
import { NavController, NavParams, Platform } from "ionic-angular";
import { PictureSourceType, CameraOptions, Camera } from "@ionic-native/camera";
import { FilePath } from "@ionic-native/file-path";
import { File } from "@ionic-native/file";
import { Network } from "@ionic-native/network";
import { HttpService } from "../../app/services/util/http.service";
import { Base64 } from "@ionic-native/base64";
import { RetrieveilFormPage } from "../retrieval-form/retrieval-form.page";
import { PurchaseFormPage } from "../purchase-form/purchase-form.page";
import { RetrievalPerDatePage } from "../retrieval-summary/per-date/retrieval-per-date.page";
import { RetrievalPerPeriodPage } from "../retrieval-summary/per-period/retrieval-per-period.page";
import { PurchasePerDatePage } from "../purchase-summary/per-date/purchase-per-date.page";
import { PurchasePerPeriodPage } from "../purchase-summary/per-period/purchase-per-period.page";
import { MaintenancePage } from "../maintenance/maintenance.page";
import { SqliteDocuPicService } from "../../app/services/util/sqlite-docupic.service";
import { SqliteService } from "../../app/services/util/sqlite.service";
import { SqliteEOPService } from "../../app/services/util/sqlite-eop.service";
import { HhpPurchase } from "../../model/hhpPurchase";
import { SqliteHHPService } from "../../app/services/util/sqlite-hhp.service";
declare var AdvancedGeolocation: any;

@Component({
  selector: "app-docupic-item-hhp",
  templateUrl: "./docupic-item-hhp.page.html",
})
export class DocupicItemHhp implements OnInit {
  url = "http://api.uniserve.ph";
  // url = "http://10.0.2.2:3000";

  formPanel: FormGroup;

  location;
  tagPanelObj;
  showZeroRemarks = false;
  irfId;
  irfObj: any = {};
  picObj: any = {};
  selectedHhp: HhpPurchase;
  date_visit;

  isCaptureLoc = false;
  connectedToNet = false;

  uploading = false;
  saving = false;
  type = "irf";
  hhps = [];
  private win: any = window;
  picId
  canEdit = false

  constructor(
    private network: Network,
    private toast: Toast,
    public navCtrl: NavController,
    private navParams: NavParams,
    private platform: Platform,
    private sqliteDocupicService: SqliteDocuPicService,
    private zone: NgZone,
    private sqliteService: SqliteService,
    private hhpSqliteService: SqliteHHPService,
    private fb: FormBuilder,
    private httpService: HttpService
  ) {
    this.formPanel = this.fb.group({
      period_code: ["", [Validators.required]],
      panel_code: ["", [Validators.required]],
      page_num: ["", [Validators.required]],
      fi_name: ["", [Validators.required]],
      date_retrieved: [new Date().toISOString(), [Validators.required]],
      date_ordered: ["", [Validators.required]],
      time_ordered: ["", [Validators.required]],
      outlet_type: ["", [Validators.required]],
      outlet_name: ["", [Validators.required]],

      prod_cat: ["", [Validators.required]],
      brand: ["", [Validators.required]],
      variant: ["", [Validators.required]],
      size: ["", [Validators.required]],
      quantity: ["", [Validators.required]],
      price: ["", [Validators.required]],
      promo: ["", [Validators.required]],
      promo_user: ["", [Validators.required]]
    });
  }

  ngOnInit() {
    this.platform.ready().then(readySource => {
      // this.hhpSqliteService.dropTable();
      // this.hhpSqliteService.createTable();
      this.irfId = this.navParams.get("irfId") || "";
      if (!!this.irfId) {
        this.sqliteService.find(this.irfId).then(
          (data: any) => {
            this.zone.run(() => {
              this.irfObj = data.rows.item(0);
              this.setRetrievalValues();
              this.findImage()
              console.log("found retrieval", this.irfObj);
            });
          },
          error => console.error("Error storing item", error)
        );
      }
    });
  }

  setRetrievalValues() {
    this.formPanel.get('period_code').setValue(this.irfObj.period_code, { emitEvent: false })
    this.formPanel.get('panel_code').setValue(this.irfObj.panel_code, { emitEvent: false })
    this.formPanel.get('fi_name').setValue(this.irfObj.fi_name, { emitEvent: false })
  }

  findImage() {
    this.picId = this.navParams.get("picId") || "";
    if (!!this.picId) {
      this.sqliteDocupicService.find(this.picId).then(
        (data: any) => {
          this.zone.run(() => {
            this.picObj = data.rows.item(0);
            this.setImageValues()
            console.log("found Pic item", this.picObj);
            this.getAllHHP()
          });
        },
        error => console.error("Error storing item", error)
      );
    }
  }

  setImageValues() {
    this.formPanel.get('page_num').setValue(this.picObj.page_num, { emitEvent: false })
  }

  getAllHHP() {
    this.hhpSqliteService.createTable().then(
      (data: any) => {
        // this.hhpSqliteService.getAllData().then(
        this.hhpSqliteService.search(this.picObj.rowId + '').then(
          (data: any) => {
            this.hhps = []
            for (let i = 0; i < data.rows.length; i++) {
              let item = data.rows.item(i);
              // do something with it
              console.log("eop item", item)
              this.hhps.push(item);
            }
            if (this.hhps.length > 0) {
              this.selectedHhp = this.hhps[0]
              this.patchselectedHhp()
            } else {
              this.new()
            }
          },
          error => console.error("Error storing item", error)
        );
      },
      error => console.error("Error storing item", error)
    );
  }

  patchselectedHhp() {
    this.canEdit = false
    this.formPanel.patchValue(this.selectedHhp, { emitEvent: false })
  }

  new() {
    this.formPanel.reset()
    this.formPanel.get('date_retrieved').setValue(new Date().toISOString())
    this.selectedHhp = null
    this.setImageValues();
    this.setRetrievalValues();
    this.canEdit = true
  }

  edit() {
    this.canEdit = true
  }

  delete(row: any) {
    this.hhpSqliteService.deleteData(this.selectedHhp.rowId).then(
      (data: any) => {
        this.showToast("Item Deleted")
        this.getAllHHP()
      },
      error => console.error("Error storing item", error)
    );
  }

  save() {
    this.canEdit = false
    if (!!this.selectedHhp) {
      this.editHhp()
    } else {
      this.addHhp()
    }
  }

  selectEop(row) {
    this.selectedHhp = row
    this.patchselectedHhp()
  }

  addHhp() {
    let value = this.formPanel.value
    value["date_retrieved"] = value["date_retrieved"].split("T")[0]
    value["docupic_Id"] = this.picObj.rowId
    let hhp = new HhpPurchase(value)
    debugger
    this.hhpSqliteService.addData(hhp).then(
      (data: any) => {
        this.showToast("HHP Purchase Added")
        this.getAllHHP()
      },
      error => console.error("Error storing item", error)
    );
  }

  sync() {
    this.saveBeforeSyncHHP()
  }

  saveBeforeSyncHHP() {
    if (!!this.selectedHhp) {
      let value = new HhpPurchase(Object.assign(this.selectedHhp, this.formPanel.value));
      value["date_retrieved"] = value["date_retrieved"].split("T")[0]
      value["docupic_Id"] = this.picObj.rowId
      let hhp = new HhpPurchase(value)
      debugger
      this.hhpSqliteService.editData(hhp).then(
        (data: any) => {
          this.syncHHP()
        },
        error => console.error("Error storing item", error)
      );
    } else {
      let value = this.formPanel.value
      value["date_retrieved"] = value["date_retrieved"].split("T")[0]
      value["docupic_Id"] = this.picObj.rowId
      let hhp = new HhpPurchase(value)
      debugger
      this.hhpSqliteService.addData(hhp).then(
        (data: any) => {
          this.syncHHP()
        },
        error => console.error("Error storing item", error)
      );
    }

  }
  syncHHP() {
    this.uploading = true;
    let value = this.formPanel.value
    value["serverId"] = this.selectedHhp["serverId"]
    value["rowId"] = this.selectedHhp["rowId"]
    this.httpService
      .post(this.url + "/hhp_purchases", this.formPanel.value, false)
      .timeout(10000)
      .subscribe(
        (data) => {
          if (data["success"] == true) {
            this.uploading = false;

            this.selectedHhp["serverId"] = data["id"]
            this.selectedHhp["stored"] = 'true'
            this.hhpSqliteService.editData(this.selectedHhp).then(
              (data: any) => {
                this.showToast("EOP Purchase Saved")
                this.getAllHHP()
              },
              error => console.error("Error storing item", error)
            );
          } else {
            this.showToast("Something went wrong while uploading");
            this.uploading = false;
          }
        },
        (err) => {
          this.uploading = false;
          this.showToast("Something went wrong" + err.message);
          console.log(err);
        }
      );
  }

  editHhp() {
    let value = new HhpPurchase(Object.assign(this.selectedHhp, this.formPanel.value));
    value["date_retrieved"] = value["date_retrieved"].split("T")[0]
    value["docupic_Id"] = this.picObj.rowId
    let hhp = new HhpPurchase(value)
    debugger
    this.hhpSqliteService.editData(hhp).then(
      (data: any) => {
        this.showToast("EOP Purchase Saved")
        this.getAllHHP()
      },
      error => console.error("Error storing item", error)
    );
  }



  previous() {
    let i = 0
    this.hhps.forEach((x, index) => {
      if (x.rowId === this.selectedHhp.rowId) {
        i = index;
      }
    });
    console.log("i is", i, this.hhps.length)
    if (i - 1 < 0) {
      this.selectedHhp = this.hhps[this.hhps.length - 1]
      this.patchselectedHhp()
    } else {
      this.selectedHhp = this.hhps[i - 1]
      this.patchselectedHhp()
    }
  }

  next() {
    let i = 0
    this.hhps.forEach((x, index) => {
      if (x.rowId === this.selectedHhp.rowId) {
        i = index;
      }
    });
    console.log("i is", i, this.hhps.length)
    if (i + 1 >= this.hhps.length) {
      this.selectedHhp = this.hhps[0]
      this.patchselectedHhp()
    } else {
      this.selectedHhp = this.hhps[i + 1]
      this.patchselectedHhp()
    }
  }

  getTrustImg(imageSrc) {
    let path = this.win.Ionic.WebView.convertFileSrc(imageSrc);
    console.log(path);
    return path;
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

  showToast(message) {
    message = message || "null";
    this.toast.show(message, "5000", "top").subscribe((toast) => {
      console.log(toast);
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

  moveToMaintenace() {
    this.navCtrl.push(MaintenancePage);
  }
  moveToPurchaseEOPHHPForm(row) {

  }
}

