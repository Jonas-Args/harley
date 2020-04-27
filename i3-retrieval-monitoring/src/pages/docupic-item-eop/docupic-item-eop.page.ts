import { Component, OnInit, NgZone } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { Toast } from "@ionic-native/toast";
import { NavController, NavParams, Platform } from "ionic-angular";
import { Network } from "@ionic-native/network";
import { HttpService } from "../../app/services/util/http.service";
import { MaintenancePage } from "../maintenance/maintenance.page";
import { SqliteDocuPicService } from "../../app/services/util/sqlite-docupic.service";
import { SqliteService } from "../../app/services/util/sqlite.service";
import { SqliteEOPService } from "../../app/services/util/sqlite-eop.service";
import { EopPurchase } from "../../model/eopPurchase";

@Component({
  selector: "app-docupic-item-eop",
  templateUrl: "./docupic-item-eop.page.html",
})
export class DocupicItemEop implements OnInit {
  // url = "http://10.0.2.2:3000";
  url = "http://api.uniserve.ph";

  formPanel: FormGroup;

  location;
  tagPanelObj;
  showZeroRemarks = false;
  irfId;
  irfObj: any = {};
  picObj: any = {};
  selectedEop: EopPurchase;
  date_visit;

  isCaptureLoc = false;
  connectedToNet = false;

  uploading = false;
  saving = false;
  type = "irf";
  eops = [];
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
    private eopSqliteService: SqliteEOPService,
    private fb: FormBuilder,
    private httpService: HttpService
  ) {
    this.formPanel = this.fb.group({
      period_code: ["", [Validators.required]],
      page_num: ["", [Validators.required]],
      panel_code: ["", [Validators.required]],
      date_ordered: ["", [Validators.required]],
      time_ordered: ["", [Validators.required]],
      fi_name: ["", [Validators.required]],
      date_retrieved: [new Date().toISOString(), [Validators.required]],
      outlet_name: ["", [Validators.required]],
      outlet_type: ["", [Validators.required]],
      inside_mall: ["", [Validators.required]],
      access_type: ["", [Validators.required]],
      for_whom: ["", [Validators.required]],
      food_ordered: ["", [Validators.required]],
      meat_type: ["", [Validators.required]],
      cook_type: ["", [Validators.required]],
      amount_paid: ["", [Validators.required]],
      with_receipt: ["", [Validators.required]],
      group_size: ["", [Validators.required]],
      kids_below_12: ["", [Validators.required]]
    });
  }

  ngOnInit() {
    this.platform.ready().then(readySource => {
      this.eopSqliteService.createTable();
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
            if (this.irfObj.project == 'HHP') {
            } else if (this.irfObj.project == 'EOP') {
              this.getAllEOP()
            }
          });
        },
        error => console.error("Error storing item", error)
      );
    }
  }

  setImageValues() {
    this.formPanel.get('page_num').setValue(this.picObj.page_num, { emitEvent: false })
  }

  getAllEOP() {
    this.eopSqliteService.createTable().then(
      (data: any) => {
        // this.eopSqliteService.getAllData().then(
        this.eopSqliteService.search(this.picObj.rowId + '').then(
          (data: any) => {
            this.eops = []
            for (let i = 0; i < data.rows.length; i++) {
              let item = data.rows.item(i);
              // do something with it
              console.log("eop item", item)
              this.eops.push(item);
            }
            if (this.eops.length > 0) {
              this.selectedEop = this.eops[0]
              this.patchSelectedEop()
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

  patchSelectedEop() {
    this.canEdit = false
    this.formPanel.patchValue(this.selectedEop, { emitEvent: false })
  }

  new() {
    this.formPanel.reset()
    this.formPanel.get('date_retrieved').setValue(new Date().toISOString())
    this.selectedEop = null
    this.setImageValues();
    this.setRetrievalValues();
    this.canEdit = true
  }

  edit() {
    this.canEdit = true
  }

  delete(row: any) {
    if (this.irfObj.project == 'HHP') {
      // this.getAllHHP()
    } else if (this.irfObj.project == 'EOP') {
      this.eopSqliteService.deleteData(this.selectedEop.rowId).then(
        (data: any) => {
          this.showToast("Item Deleted")
          this.getAllEOP()
        },
        error => console.error("Error storing item", error)
      );
    }
  }

  save() {
    this.canEdit = false
    if (this.irfObj.project == 'HHP') {
      // this.getAllHHP()
    } else if (this.irfObj.project == 'EOP') {
      if (!!this.selectedEop) {
        this.editEop()
      } else {
        this.addEop()
      }

    }
  }

  selectEop(row) {
    this.selectedEop = row
    this.patchSelectedEop()
  }

  addEop() {
    let value = this.formPanel.value
    value["date_retrieved"] = value["date_retrieved"].split("T")[0]
    value["docupic_Id"] = this.picObj.rowId
    let eop = new EopPurchase(value)
    debugger
    this.eopSqliteService.addData(eop).then(
      (data: any) => {
        this.showToast("EOP Purchase Added")
        this.getAllEOP()
      },
      error => console.error("Error storing item", error)
    );
  }

  sync() {
    if (this.irfObj.project == 'HHP') {
      // this.getAllHHP()
    } else if (this.irfObj.project == 'EOP') {
      this.saveBeforeSyncEOP()
    }


  }

  saveBeforeSyncEOP() {
    if (!!this.selectedEop) {
      let value = new EopPurchase(Object.assign(this.selectedEop, this.formPanel.value));
      value["date_retrieved"] = value["date_retrieved"].split("T")[0]
      value["docupic_Id"] = this.picObj.rowId
      let eop = new EopPurchase(value)
      debugger
      this.eopSqliteService.editData(eop).then(
        (data: any) => {
          this.syncEOP()
        },
        error => console.error("Error storing item", error)
      );
    } else {
      let value = this.formPanel.value
      value["date_retrieved"] = value["date_retrieved"].split("T")[0]
      value["docupic_Id"] = this.picObj.rowId
      let eop = new EopPurchase(value)
      debugger
      this.eopSqliteService.addData(eop).then(
        (data: any) => {
          this.syncEOP()
        },
        error => console.error("Error storing item", error)
      );
    }

  }
  syncEOP() {
    this.uploading = true;
    let value = this.formPanel.value
    value["serverId"] = this.selectedEop["serverId"]
    value["rowId"] = this.selectedEop["rowId"]
    this.httpService
      .post(this.url + "/eop_purchases", this.formPanel.value, false)
      .timeout(10000)
      .subscribe(
        (data) => {
          if (data["success"] == true) {
            this.uploading = false;

            this.selectedEop["serverId"] = data["id"]
            this.selectedEop["stored"] = 'true'
            this.eopSqliteService.editData(this.selectedEop).then(
              (data: any) => {
                this.showToast("EOP Purchase Saved")
                this.getAllEOP()
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

  syncHHP() {

  }

  editEop() {
    let value = new EopPurchase(Object.assign(this.selectedEop, this.formPanel.value));
    value["date_retrieved"] = value["date_retrieved"].split("T")[0]
    value["docupic_Id"] = this.picObj.rowId
    let eop = new EopPurchase(value)
    debugger
    this.eopSqliteService.editData(eop).then(
      (data: any) => {
        this.showToast("EOP Purchase Saved")
        this.getAllEOP()
      },
      error => console.error("Error storing item", error)
    );
  }



  previous() {
    let i = 0
    this.eops.forEach((x, index) => {
      if (x.rowId === this.selectedEop.rowId) {
        i = index;
      }
    });
    console.log("i is", i, this.eops.length)
    if (i - 1 < 0) {
      this.selectedEop = this.eops[this.eops.length - 1]
      this.patchSelectedEop()
    } else {
      this.selectedEop = this.eops[i - 1]
      this.patchSelectedEop()
    }
  }

  next() {
    let i = 0
    this.eops.forEach((x, index) => {
      if (x.rowId === this.selectedEop.rowId) {
        i = index;
      }
    });
    console.log("i is", i, this.eops.length)
    if (i + 1 >= this.eops.length) {
      this.selectedEop = this.eops[0]
      this.patchSelectedEop()
    } else {
      this.selectedEop = this.eops[i + 1]
      this.patchSelectedEop()
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

