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
import { SqliteEOPService } from "../../app/services/util/sqlite-eop.service";
import { SqliteHHPService } from "../../app/services/util/sqlite-hhp.service";
import { EopPurchase } from "../../model/eopPurchase";
import { Irf } from "../../model/irf";
import { HhpPurchase } from "../../model/hhpPurchase";
import { File } from "@ionic-native/file";
import { Network } from "@ionic-native/network";
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from "@ionic-native/file-path"; import { FileTransfer, FileTransferObject, FileUploadOptions } from "@ionic-native/file-transfer";
declare var AdvancedGeolocation: any;

@Component({
  selector: "app-server-upload",
  templateUrl: "./server-upload.page.html",
})
export class ServerUploadPage implements OnInit {
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

  selected;

  connectedToNet = false;
  uploading = false;
  data
  csvFile;
  selected_url;
  getting = false;

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
    private fileChooser: FileChooser,
    private filePath: FilePath,
    private fileTransfer: FileTransfer
  ) {
  }

  ngOnInit() {
    // this.sqliteService.dropTable();
    // this.getAllData();
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

  selectFile() {
    this.fileChooser.open()
      .then(uri => {
        this.filePath
          .resolveNativePath(uri)
          .then(path => {
            this.csvFile = path;
          })
          .catch(err => {
            console.error(err);
          });
        this.csvFile = uri;
      })
      .catch(e => console.log(e));
  }


  updatePanelMain() {

    if (!this.csvFile) {
      this.showToast("No File Selected")
      return;
    }
    this.selected = 'panel_main'
    this.uploading = true
    this.selected_url = this.url + "/users/update_panel_main"

    this.upload()
  }

  upload() {
    let fileTransfer: FileTransferObject = this.fileTransfer.create();

    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: 'test.xlsx',
      chunkedMode: false,
      mimeType: "text/xlsx",
      headers: {
        Connection: 'Closed',
        "X-AUTH-TOKEN": "895f54e4335491725cfea0b0372a1c98"
      }
    }

    fileTransfer.upload(this.csvFile, this.selected_url, options)
      .then((data) => {
        this.uploading = false
        this.data = JSON.parse(data.response)
        console.log(JSON.parse(data.response));
      }, (err) => {
        this.uploading = false
        let i = 1;
        for (let key in err) {
          setTimeout(() => {
            console.log(err[key], i * 1000)
            i = i + 1
            alert(err[key])
          }, i * 1000);
        }
      })
  }

  updateProductMaster() {
    if (!this.csvFile) {
      this.showToast("No File Selected")
      return;
    }
    this.selected = 'product_master'
    this.uploading = true
    this.selected_url = this.url + "/users/update_purchases"
    this.upload()
  }

  getProductMasterStatus() {
    this.selected = 'product_master'
    this.getting = true
    this.httpService.get(this.url + "/users/purchases_status", false)
      .subscribe((data: any) => {
        this.getting = false
        this.data = data
        console.log(data);
      }, (error) => {
        this.getting = false
        this.showToast("Something went wrong " + error.message)
      })
  }

  getPanelMainStatus() {
    this.selected = 'panel_main'
    this.getting = true
    this.httpService.get(this.url + "/users/panel_main_status", false)
      .subscribe((data: any) => {
        this.getting = false
        this.data = data
        console.log(data);
      }, (error) => {
        this.getting = false
        this.showToast("Something went wrong " + error.message)
      })
  }

  updateUsers() {

    if (!this.csvFile) {
      this.showToast("No File Selected")
      return;
    }
    this.selected = 'user'
    this.uploading = true
    this.selected_url = this.url + "/users/update_users"
    this.upload()
  }

  getUserStatus() {
    this.selected = 'user'
    this.getting = true
    this.httpService.get(this.url + "/users/users_status", false)
      .subscribe((data: any) => {
        this.getting = false
        this.data = data
        console.log(data);
      }, (error) => {
        this.getting = false
        this.showToast("Something went wrong " + error.message)
      })
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

  showToast(message, duration = '5000') {
    message = message || "null";
    this.toast.show(message, duration, "top").subscribe((toast) => {
      console.log(toast);
    });
  }

}

