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
        },
        err => {
          console.log("something went wrong");
        }
      );
    });
  }

  initForm() {
    this.formPanel = this.fb.group({
      fi_name: ["", [Validators.required]],
      panel_type: ["", [Validators.required]],
      start_hatching: ["", [Validators.required]],
      panel_code: ["", [Validators.required]],
      brgy_code: ["", ],
      brgy_name: ["", [Validators.required]],
      region: ["", [Validators.required]],
      province: ["", [Validators.required]],
      municipality: ["", [Validators.required]],
      urbanity: ["", [Validators.required]]
    });
    this.formPanel.valueChanges.subscribe(value => {
      this.save_last_saved();
    });
    this.formPanel.get("brgy_code").valueChanges.subscribe(value => {
      this.findByBrgyCode(value);
    });
  }

  findByBrgyCode(value) {
    let matchValue = "";
    console.log("looking for",'0'+value+'0' )
    console.log("brgy lookup", this.brgy_lookup.length)
    matchValue = this.brgy_lookup.filter((val) => {
      // console.log(val.brgy_code);
      return value == val.brgy_code.trim()
    });

    if (matchValue.length > 0) {
      value = matchValue[0];
      this.formPanel.get("brgy_name").setValue(value.brgy);
      this.formPanel.get("municipality").setValue(value.municipality);
      this.formPanel.get("province").setValue(value.province);
      this.formPanel.get("region").setValue(value.region);
      this.formPanel.get("urbanity").setValue(value.urbanity);
    }
  }

  logout() {

    this.nativeStorage.remove('signin').then(
      () => {
        this.platform.exitApp();
      },
      error => console.error("Error removing item", error)
    )
  }

  // findByPanelCode(panelcode) {
  //   this.storage.getAllItem().then(
  //     data => {
  //       let objects = <any[]>data;
  //       console.log("objects", objects);
  //       let item = objects.filter(
  //         res =>
  //           !!res["panel_code"] &&
  //           res["panel_code"] == panelcode &&
  //           res["last"] == true
  //       );

  //       console.log("last item", item);
  //       if (item.length > 0) {
  //         //with name
  //         if (!!item[0]["panel_code"]) {
  //           let object = {
  //             region: item[0]["region"],
  //             panel_name: item[0]["panel_name"]
  //           };
  //           this.formPanel.patchValue(object, {
  //             emitEvent: false,
  //             onlySelf: true
  //           });
  //         }
  //       }
  //     },
  //     error => console.error(error)
  //   );
  // }

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

  // formatDate(date) {
  //   // mm/dd/yy format
  //   let d = date.getDate();
  //   let m = date.getMonth() + 1; //Month from 0 to 11
  //   let y = date.getFullYear();
  //   return "" + (m <= 9 ? "0" + m : m) + "/" + (d <= 9 ? "0" + d : d) + "/" + y;
  // }

  // save(value) {
  //   this.storage.setItem("irf", value);
  //   this.navCtrl.push(tagpanelPage, {
  //     irfId: this.storage.itemId
  //   });
  // }

  search(value) {
    let panelcode = this.formPanel.value["panel_code"];
    let id = "hhp" + panelcode;
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
          if(this.isValid(this.formPanel.value)){
            this.save(this.formPanel.value);
          }
        }
      },
      error => {}
    );
  }

  isValid(value){
    let valid = !!value.fi_name && 
      !!value.panel_type && 
      !!value.start_hatching &&
      !!value.start_hatching &&
      !!value.panel_code &&
      !!value.brgy_name &&
      !!value.region &&
      !!value.province &&
      !!value.municipality &&
      !!value.urbanity
    if(!valid){
      this.showToast("Pleass fill all fields with (*)");
    }
    return valid
  }

  save(value) {
    this.storage.setItem("hhp", value);
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

  // findName(panelcode) {
  //   this.storage.getAllItem().then(
  //     data => {
  //       let objects = <any[]>data;
  //       console.log("objects", objects);
  //       let item = objects.filter(
  //         res =>
  //           !!res["panel_code"] &&
  //           res["panel_code"] == panelcode &&
  //           res["last"] == true
  //       );

  //       console.log("last item", item);
  //       if (item.length > 0) {
  //         //with name
  //         if (!!item[0]["panel_code"]) {
  //           let object = Object.assign(
  //             {
  //               region: item[0]["region"],
  //               panel_name: item[0]["panel_name"]
  //             },
  //             this.formPanel.value
  //           );
  //           this.save(object);
  //         } else {
  //           this.save(this.formPanel.value);
  //         }
  //       } else {
  //         //wala
  //         this.save(this.formPanel.value);
  //       }
  //     },
  //     error => console.error(error)
  //   );
  // }

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
          res => !!res["Id"] && res["Id"].includes("hhp")
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
