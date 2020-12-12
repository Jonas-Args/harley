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
  BackgroundGeolocationResponse
} from "@ionic-native/background-geolocation";
import { RetrievalItemPage } from "../retrieval-item/retrieval-item.page";
import { SqlitePanelMainService } from "../../app/services/util/sqlite-panel-main.service";
import { SqliteDocuPicService } from "../../app/services/util/sqlite-docupic.service";

declare var AdvancedGeolocation: any;

@Component({
  selector: "app-retrieval-form",
  templateUrl: "./retrieval-form.page.html"
})
export class RetrieveilFormPage implements OnInit {
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
  weeks = ['1', '2', '3', '4']

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
    private sqlitePanelService: SqlitePanelMainService,
    private platform: Platform,
    private sqliteDocupicService: SqliteDocuPicService,
  ) {
    this.initForm();
  }

  ngOnInit() {
    // this.sqliteService.dropTable()
    this.getAllData();
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.getAllData();
    });
  }
  handleError(err) {
    console.log("something went wrong: ", err);
  }


  save_last_saved() {
    if (!!this.lastData) {
      let last_data = new Irf(
        Object.assign(this.lastData, this.formPanel.value)
      );
      console.log("with last data", last_data);
      this.sqliteService.editData(last_data).then(
        (data: any) => {
          console.log("retrieved new data", data);
          this.get_last_saved();
        },
        error => console.error("Error storing item", error)
      );
    } else {
      console.log("adding last data", this.lastData);
      let last_data = new Irf(this.formPanel.value);
      last_data.last = 1;

      this.sqliteService.addData(last_data).then(
        (data: any) => {
          console.log("retrieved last data", data);
          this.get_last_saved();
        },
        error => console.error("Error storing item", error)
      );
    }
  }

  initForm() {
    let current_datetime = new Date()

    this.formPanel = this.fb.group({
      year: [new Date().getFullYear(), [Validators.required]],
      period: ["", [Validators.required]],
      week: ["", [Validators.required]],
      period_code: ["", [Validators.required]],
      panel_code: ["", [Validators.required]],
      date_retrieved: [
        new Date().toISOString(),
        [Validators.required]
      ]
    });

    // add field here
    this.formPanel.get("period").valueChanges.subscribe(value => {
      if (value == '07') {
        this.weeks = ['1', '2', '3', '4', '5']
      } else {
        this.weeks = ['1', '2', '3', '4']
      }
      this.setPanelCode();
    });
    this.formPanel.get("week").valueChanges.subscribe(value => {
      if (!!value) {
        this.setPanelCode();
      }
    });
    this.formPanel.get("year").valueChanges.subscribe(value => {
      if (!!value) {
        this.setPanelCode();
      }
    });
    this.formPanel.valueChanges.subscribe(value => {
      console.log("values", this.formPanel.value);
      this.save_last_saved();
    });
  }

  setPanelCode() {
    let panel_code =
      this.formPanel.get("year").value +
      "." +
      this.formPanel.get("period").value +
      "." +
      this.formPanel.get("week").value;
    this.formPanel.get("period_code").setValue(panel_code);
  }

  get_last_saved() {
    this.sqliteService.getLastData().then(
      (data: any) => {
        if (!!data.rows && data.rows.length == 0) {
          console.log("retrieved no last item");
          this.lastData = null;
        } else {
          this.lastData = data.rows.item(0);
          delete this.lastData["date_retrieved"]
          this.formPanel.patchValue(this.lastData, { emitEvent: false });
          console.log("retrieved last item", this.lastData);
        }
      },
      error => console.error("Error storing item", error)
    );
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
      irfId: this.storage.itemId
    });
  }

  search(value) {
    if (value.week == "") {
      this.showToast("Week should not be blank");
    } else if (value.year == "") {
      this.showToast("Year should not be blank");
    } else if (value.period == "") {
      this.showToast("Period should not be blank");
    } else {
      this.searchPanelCode()
    }
  }


  addImageFlag(index) {
    let request = this.requests[index]
    this.requests[index]["with_image"] = false
    this.sqliteDocupicService.createTable().then(
      (data: any) => {
        this.sqliteDocupicService.search(request.rowId).then(
          (data: any) => {
            let result = []
            if (!!data.rows && !!data.rows.length) {
              this.requests[index]["with_image"] = true
            }
          },
          error => console.error("Error storing item", error)
        );
      },
      error => console.error("Error storing item", error)
    );
  }

  searchPanelCode() {
    let value = this.formPanel.value
    value["date_retrieved"] = value["date_retrieved"].split("T")[0]
    this.sqlitePanelService.search(this.formPanel.value["panel_code"]).then((res: any) => {
      if (!!res.rows && res.rows.length == 1) {
        console.log("found panel code data", res.rows.item(0));
        if (res.rows.item(0).panel_stat == "DROPPED") {
          this.showToast("This panelist is dropped already.")
        } else {
          this.sqliteService.search(value).then(
            (data: any) => {
              console.log("found data on search", data);
              if (!!data.rows.item(0)) {
                console.log("found data", data.rows.item(0));
                let new_data = new Irf(
                  Object.assign(data.rows.item(0), value)
                );
                this.sqliteService.editData(new_data).then((data: any) => {
                  this.navCtrl.push(RetrievalItemPage, {
                    irfId: new_data.rowId
                  });
                });

              } else {
                console.log("adding data on search", data);
                value.last = 0;
                this.sqliteService
                  .addData(value)
                  .then((data: any) => {
                    this.search(value);
                    // console.log("new data", data.rows.item(0))
                  });
              }
            },
            error => console.error("Error storing item", error)
          );
        }
      }
      else if (!!res.rows && res.rows.length > 1) {
        this.showToast("Multiple match to panelcode")
      } else {
        this.showToast("Panelcode did not match")
      }
    })
  }

  clear() {
    this.initForm();
  }

  showToast(message) {
    message = message || "null";
    this.toast.show(message, "5000", "top").subscribe(toast => {
      console.log(toast);
    });
  }

  removeRequest(id) {
    this.sqliteService.deleteData(id).then(
      (data: any) => {
        this.getAllData();
      },
      error => console.error("Error storing item", error)
    );
  }

  moveToIrf(row: any) {
    if (!!row) {
      this.navCtrl.push(RetrievalItemPage, {
        irfId: row.rowId
      });
    } else {
      this.navCtrl.push(RetrievalItemPage, {});
    }
  }

  getAllData() {
    this.sqliteService.createTable().then(
      (data: any) => {
        this.sqliteService.getAllData().then(
          (data: any) => {
            let result = [];
            for (let i = 0; i < data.rows.length; i++) {
              let item = data.rows.item(i);
              // do something with it
              result.push(item);
              console.log("item", item);
            }
            console.log("all data", result);
            this.requests = result;
            this.requests.forEach((element, index) => {
              if (element.panel_status == 'RETRIEVED' || element.panel_status == 'HATCHING') {
                this.addImageFlag(index)
              }
            });
          },
          error => console.error("Error storing item", error)
        );

        this.get_last_saved();
      },
      error => console.error("Error storing item", error)
    );
  }
}
