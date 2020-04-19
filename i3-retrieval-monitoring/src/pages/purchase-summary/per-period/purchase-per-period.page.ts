import { Component, OnInit, OnDestroy } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { Toast } from "@ionic-native/toast";
import { NativeStorage } from "@ionic-native/native-storage";
import { NavController, NavParams, Platform } from "ionic-angular";
import { SqliteService } from "../../../app/services/util/sqlite.service";
import { RetrievalItemPage } from "../../retrieval-item/retrieval-item.page";
import { Irf } from "../../../model/irf";

@Component({
  selector: "app-purchase-per-period",
  templateUrl: "./purchase-per-period.page.html"
})
export class PurchasePerPeriodPage implements OnInit {
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

  constructor(
    private fb: FormBuilder,
    private toast: Toast,
    private nativeStorage: NativeStorage,
    public navCtrl: NavController,
    private platform: Platform,
    public sqliteService: SqliteService
  ) {
    this.initForm();
  }

  ngOnInit() {
    // this.sqliteService.dropTable()
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


  initForm() {
    this.formPanel = this.fb.group({
      date_start: ["", [Validators.required]],
      date_end: ["", [Validators.required]],
      status: ["", [Validators.required]],
      by_sec: ["", [Validators.required]]
    });

  }

  search(value) {
    if (value.week == "") {
      this.showToast("Week should not be blank");
    } else {
      this.sqliteService.search(this.formPanel.value).then(
        (data: any) => {
          console.log("found data on search", data);
          if (!!data.rows.item(0)) {
            console.log("found data", data.rows.item(0));
            let new_data = new Irf(
              Object.assign(data.rows.item(0), this.formPanel.value)
            );
            this.sqliteService.editData(new_data).then((data: any) => {
              this.navCtrl.push(RetrievalItemPage, {
                irfId: new_data.rowId
              });
            });
          } else {
            console.log("adding data on search", data);
            this.formPanel.value.last = 0;
            this.sqliteService
              .addData(this.formPanel.value)
              .then((data: any) => {
                this.search(this.formPanel.value);
                // console.log("new data", data.rows.item(0))
              });
          }
        },
        error => console.error("Error storing item", error)
      );
    }
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

}
