import { Component, OnInit } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { StorageService } from "../../app/services/util/storage.service";
import { Toast } from "@ionic-native/toast";
import { NativeStorage } from "@ionic-native/native-storage";
import { Platform, NavController } from "ionic-angular";
import { tagpanelPage } from "../tagpanel/tagpanel.page";
import { HttpClient } from "@angular/common/http";
import { SqliteService } from "../../app/services/api/sqlite.service";

@Component({
  selector: "app-irf",
  templateUrl: "./irf.page.html"
})
export class irfPage implements OnInit {
  formPanel: FormGroup;
  isBarcodeScanned = false;
  list: any;
  type = "irf";
  constructor(
    private barcodeScanner: BarcodeScanner,
    private storage: StorageService,
    private fb: FormBuilder,
    private toast: Toast,
    private nativeStorage: NativeStorage,
    public navCtrl: NavController,
    public http: HttpClient,
    public platform: Platform,
    public sqliteService: SqliteService
  ) {
    this.initForm();
    platform.ready().then(() => {
      sqliteService.createDb();
      sqliteService.save();
      sqliteService.retrieve();
    });
  }

  ngOnInit() {
    this.get_last_saved();
  }

  initForm() {
    this.formPanel = this.fb.group({
      prod_cat: ["", [Validators.required]],
      period_code: ["", [Validators.required]],
      manufacturer: ["", [Validators.required]],
      brand: ["", [Validators.required]],
      sub_brand: ["", [Validators.required]],
      flavor: ["", [Validators.required]],
      formula: ["", [Validators.required]],
      variant: ["", [Validators.required]],
      weight_size: ["", [Validators.required]],
      packaging: ["", [Validators.required]],
      packaging_color: ["", [Validators.required]],
      use_type: ["", [Validators.required]],
      form: ["", [Validators.required]],
      skin_type: ["", [Validators.required]],
      hair_type: ["", [Validators.required]],
      product_type: ["", [Validators.required]],
      gender: ["", [Validators.required]],
      age: ["", [Validators.required]],
      quantity: ["", [Validators.required]],
      price: ["", [Validators.required]],
      promo: ["", [Validators.required]],
      outlet_type: ["", [Validators.required]],
      outlet_name: ["", [Validators.required]],
      week: ["", [Validators.required]],
      purchase_time: ["", [Validators.required]],
      day: ["", [Validators.required]],
      panel_code: ["", [Validators.required]]
    });
    // this.formPanel.get("period").valueChanges.subscribe(value => {
    //   this.formPanel
    //     .get("week_code")
    //     .setValue(value + "." + this.formPanel.value["week"]);
    // });
    // this.formPanel.get("week").valueChanges.subscribe(value => {
    //   if (!!value) {
    //     this.formPanel
    //       .get("week_code")
    //       .setValue(this.formPanel.value["period"] + "." + value);
    //   }
    // });
    // this.formPanel.valueChanges.subscribe(value => {
    //   this.save_last_saved();
    // });
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
    debugger;
    if (value.week == "" || value.week == null) {
      this.showToast("Week should not be blank");
    } else {
      let panelcode = this.formPanel.value["panel_code"];
      let weekcode = this.formPanel.value["week_code"];
      let id = this.type + panelcode + weekcode;
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
  }

  save(value) {
    this.storage.setItem(this.type, value);
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
          res => !!res["Id"] && res["Id"].includes(this.type)
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
