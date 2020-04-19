import { Injectable } from "@angular/core";
import { NativeStorage } from "@ionic-native/native-storage";

@Injectable()
export class StorageService {
  itemId;

  constructor(private nativeStorage: NativeStorage) {}

  setItem(type, object: any, url = null, params = null) {
    let Id;
    if (!!object.Id) {
      Id = object.Id;
    } else {
      Id = type + object["panel_code"] + object["period_code"];
      object = Object.assign({ Id: Id }, object);
    }
    this.itemId = Id;
    this.nativeStorage.setItem(Id, object).then(
      () => {
        console.log("Stored item!");
        // if(url!=null){
        //   this.router.navigate([url], params)
        // }
      },
      error => console.error("Error storing item", error)
    );
  }

  saveItem(id, object) {
    this.nativeStorage.setItem(id, object).then(
      () => {
        console.log("Stored item!");
        // if(url!=null){
        //   this.router.navigate([url], params)
        // }
      },
      error => console.error("Error storing item", error)
    );
  }

  getItem(key) {
    return new Promise((resolve, reject) =>
      this.nativeStorage.getItem(key).then(
        data => resolve(data),
        error => resolve(error)
      )
    );
  }

  removeItem(key) {
    return new Promise((resolve, reject) =>
      this.nativeStorage.remove(key).then(
        () => {
          console.log("item removed!");
          resolve({});
        },
        error => console.error("Error removing item", error)
      )
    );
  }

  getAllItem() {
    return new Promise((resolve, reject) =>
      this.nativeStorage
        .keys()
        .then(keys =>
          Promise.all(keys.map(k => this.nativeStorage.getItem(k))).then(data =>
            resolve(data)
          )
        )
    );
  }

  private getKey() {
    let date = new Date();
    let str =
      date.getFullYear() +
      "-" +
      (date.getMonth() + 1) +
      "-" +
      date.getDate() +
      " " +
      date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getSeconds();
    return str;
  }
}