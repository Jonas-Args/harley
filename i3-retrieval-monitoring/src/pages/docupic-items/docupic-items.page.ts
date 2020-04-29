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
import { DocupicItemEop } from "../docupic-item-eop/docupic-item-eop.page";
import { DocupicItemHhp } from "../docupic-item-hhp/docupic-item-hhp.page";
declare var AdvancedGeolocation: any;

@Component({
  selector: "app-docupic-items",
  templateUrl: "./docupic-items.page.html",
})
export class DocupicItems implements OnInit {
  url = "http://api.uniserve.ph";
  // url = "http://10.0.2.2:3000";

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
  images = [];
  private win: any = window;

  statuses = [
    { value: "RETRIEVED" },
    { value: "ZERO" },
    { value: "NA" },
    { value: "HATCHING" },
    { value: "DROPPED" },
    { value: "MY LOCATION" },
  ];

  constructor(
    private network: Network,
    private toast: Toast,
    public navCtrl: NavController,
    private navParams: NavParams,
    private platform: Platform,
    private sqliteDocupicService: SqliteDocuPicService,
    private zone: NgZone,
    private sqliteService: SqliteService,
  ) {

  }

  ngOnInit() {
    this.platform.ready().then(readySource => {
      this.irfId = this.navParams.get("irfId") || "";
      if (!!this.irfId) {
        this.findData();
      }
      // this.sqliteService.dropTable()
      this.sqliteDocupicService.createTable()
    });
  }

  findData() {
    this.sqliteService.find(this.irfId).then(
      (data: any) => {
        this.zone.run(() => {
          this.irfObj = data.rows.item(0);
          console.log("found item", this.irfObj);
          this.getAllImages()
        });
      },
      error => console.error("Error storing item", error)
    );
  }

  getAllImages() {
    this.sqliteDocupicService.createTable().then(
      (data: any) => {
        this.sqliteDocupicService.search(this.irfObj.rowId).then(
          (data: any) => {
            for (let i = 0; i < data.rows.length; i++) {
              let item = data.rows.item(i);
              // do something with it
              let value = {
                page_num: item.page_num,
                image_path: item.image_path,
                irf_id: item.irf_id,
                imageDisplay: this.getTrustImg(item.image_path),
                rowId: item.rowId
              };
              console.log("value", value)
              this.images.push(value);
            }
            console.log("images", this.images)
          },
          error => console.error("Error storing item", error)
        );
      },
      error => console.error("Error storing item", error)
    );
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
    if (this.irfObj.project == 'HHP' || this.irfObj.project == 'XP') {
      this.navCtrl.push(DocupicItemHhp, {
        irfId: this.irfObj.rowId,
        picId: row.rowId
      });
    } else if (this.irfObj.project == 'EOP') {
      this.navCtrl.push(DocupicItemEop, {
        irfId: this.irfObj.rowId,
        picId: row.rowId
      });
    }

  }
}

