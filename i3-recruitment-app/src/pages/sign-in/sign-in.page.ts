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
import { irfPage } from "../irf/irf.page";
declare var AdvancedGeolocation: any;

@Component({
  selector: "app-sign-in",
  templateUrl: "./sign-in.page.html",
})
export class SignIn {
  url = "http://api.uniserve.ph";
  // url = "http://10.0.2.2:3000";

  connectedToNet = false;
  signing = false;
  private win: any = window;
  userid
  password
  data
  constructor(
    private sms: SMS,
    public camera: Camera,
    private storage: StorageService,
    private network: Network,
    private toast: Toast,
    public navCtrl: NavController,
    private navParams: NavParams,
    private platform: Platform,
    private httpService: HttpService,
    private zone: NgZone,
    private nativeStorage: NativeStorage,
  ) {
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
      this.getSignIn();
      this.delay(10000)
    });
  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(), ms)).then(() => console.log("fired"));
  }

  getSignIn() {
    this.nativeStorage.getItem("signin").then(
      (data) => {
        this.data = data
        this.signIn()
        console.log("signin data", data)
      },
      (error) => {
        this.data = null
        debugger
        console.log("signin data", error)
      }
    );
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
      setTimeout(() => {
        this.showToast("Connected to network");
        this.connectedToNet = true;
      }, 1000);
    });
  }

  signIn() {
    if (!!this.data) {
      if (!!this.data.ficode && !!this.data.password) {
        this.navCtrl.push(irfPage);
      } else {
        this.singInOnline()
      }
    } else {
      this.singInOnline()
    }
  }

  singInOnline() {
    this.signing = true;
    let sigin = {
      USERID: this.userid,
      PASSWORD: this.password
    }

    this.httpService
      .post(this.url + "/users/signin", sigin, false)
      .timeout(10000)
      .subscribe(
        (data) => {
          this.signing = false;
          if (data.success == true && !!data.user) {
            if (data.user['STATUS'] == 'ENABLED') {
              this.nativeStorage.setItem('signin', data)
                .then(
                  () => {
                    let obj = {
                      ficode: data.user['USERID'],
                      finame: data.user['FINAME'],
                      password: data.user['PASSWORD'],
                      access_type: data.user['ACCESSTYPE']
                    }
                    this.nativeStorage.setItem('signin', obj)
                      .then(
                        () => {
                          this.navCtrl.push(irfPage);
                        },
                        error => console.error('Error storing item', error)
                      );
                  },
                  error => {
                    this.showToast("Something went wrong" + error.message)
                  }
                );
            } else {
              this.showToast("You have no access to this application. Contact the supervisor.")
            }
          } else {
            this.showToast("Invalid Credentials")
          }
        },
        (err) => {
          this.url;
          this.zone.run(() => {
            this.signing = false;
          });
          this.showToast("Something went wrong" + err.message);
          console.log(err);
        }
      );
  }

}
