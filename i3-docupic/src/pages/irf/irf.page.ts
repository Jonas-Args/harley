import { Component, OnInit } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { SMS } from "@ionic-native/sms";
import { StorageService } from "../../app/services/util/storage.service";
import { Toast } from "@ionic-native/toast";
import { NativeStorage } from "@ionic-native/native-storage";
import { Platform, NavController } from "ionic-angular";
import { tagpanelPage } from "../tagpanel/tagpanel.page";
import { HttpClient } from "@angular/common/http";
import { CsvService } from "../../app/services/util/csv.service";
declare var AdvancedGeolocation: any;

@Component({
  selector: "app-irf",
  templateUrl: "./irf.page.html"
})
export class irfPage implements OnInit {
  formPanel: FormGroup;
  isBarcodeScanned = false;
  location;
  irfObj;
  showBranchName = false;
  irdId;
  requests;
  list: any;
  brgy_lookup: any;

  constructor(
    private barcodeScanner: BarcodeScanner,
    private sms: SMS,
    private storage: StorageService,
    private fb: FormBuilder,
    private toast: Toast,
    private nativeStorage: NativeStorage,
    private platform: Platform,
    public navCtrl: NavController,
    public http: HttpClient,
    public csvService: CsvService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.csvService.loadCSV();
      this.csvService.brgy_lookup_subject.subscribe(
        res => {
          this.brgy_lookup = res;
          this.get_last_saved();
          console.log("lookup is ", this.brgy_lookup);
        },
        err => {
          console.log("something went wrong");
        }
      );
    });
  }

  initForm() {
    this.formPanel = this.fb.group({
      panel_code: ["", [Validators.required]],
      panel_name: ["", [Validators.required]],
      yy_code: ["", [Validators.required]],
      pp_code: ["", [Validators.required]],
      ww_code: ["", [Validators.required]],
      period_code: ["", [Validators.required]],
      remarks: ["", [Validators.required]]
    });
    this.formPanel.valueChanges.subscribe(value => {
      this.save_last_saved();
    });
    this.formPanel.get("yy_code").valueChanges.subscribe(value => {
      this.setPanelCode();
    });
    this.formPanel.get("pp_code").valueChanges.subscribe(value => {
      this.setPanelCode();
    });
    this.formPanel.get("ww_code").valueChanges.subscribe(value => {
      this.setPanelCode();
    });
  }

  setPanelCode() {
    let panel_code =
      this.formPanel.get("yy_code").value +
      "." +
      this.formPanel.get("pp_code").value +
      "." +
      this.formPanel.get("ww_code").value;
    this.formPanel.get("period_code").setValue(panel_code);
  }

  save_last_saved() {
    console.log("saving", this.formPanel.value);
    this.nativeStorage.setItem("last_saved", this.formPanel.value).then(
      () => {
        console.log("Stored last item!");
      },
      error => console.error("Error storing item", error)
    );
  }

  ionViewDidEnter() {
    this.getAllItems();
  }

  get_last_saved() {
    this.nativeStorage.getItem("last_saved").then(
      data => {
        console.log("retrieved last item", data);
        if (!!data) {
          this.formPanel.patchValue(data);
        }
      },
      error => console.error("Error storing item", error)
    );
  }

  search(value) {
    let panelcode = this.formPanel.value["panel_code"];
    let id = "docupic" + panelcode;
    //find by panel_code week_code name

    this.storage.getItem(id).then(
      data => {
        console.log("retrieved", data);
        let foundData: any = data;
        if (!!foundData.Id) {
          this.navCtrl.push(tagpanelPage, {
            irfId: foundData.Id
          });
        } else {
          this.save(this.formPanel.value);
        }
      },
      error => {}
    );
  }

  save(value) {
    this.storage.setItem("docupic", value);
    this.navCtrl.push(tagpanelPage, {
      irfId: this.storage.itemId
    });
  }

  scan() {
    this.isBarcodeScanned = false;
    this.barcodeScanner
      .scan()
      .then(barcodeData => {
        console.log("Barcode data", barcodeData);
        this.isBarcodeScanned = true;
        this.formPanel.get("panel_code").setValue(barcodeData.text);
        this.showToast("Successfully Scanned");
      })
      .catch(err => {
        this.showToast(err);
        console.log("Error", err);
      });
  }

  clear() {
    this.formPanel.reset();
  }

  showToast(message) {
    message = message || "null";
    this.toast.show(message, "5000", "top").subscribe(toast => {
      console.log(toast);
    });
  }

  getAllItems() {
    this.storage.getAllItem().then(
      data => {
        let objects = <any[]>data;
        this.list = objects.filter(
          res => !!res["Id"] && res["Id"].includes("docupic")
        );
        console.log("list", this.list);
      },
      error => console.error(error)
    );
  }

  removeRequest(key) {
    this.storage.removeItem(key).then(
      data => {
        this.getAllItems();
      },
      error => console.error(error)
    );
  }

  moveToIrf(row: any) {
    if (!!row) {
      this.navCtrl.push(tagpanelPage, {
        irfId: row.Id
      });
    } else {
      this.navCtrl.push(tagpanelPage, {});
    }
  }
}
