import { Injectable } from "@angular/core";
import { NativeStorage } from "@ionic-native/native-storage";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";
import { Irf } from "../../../model/irf";
import { PurchaseItem } from "../../../model/purchaseItem";

@Injectable()
export class SqlitePurchaseService {
  constructor(private nativeStorage: NativeStorage, private sqlite: SQLite) { }

  createTable() {
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql(
            "CREATE TABLE IF NOT EXISTS purchaseItems(rowId INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "Field1 TEXT, " +
            "Field2 TEXT, " +
            "Field3 TEXT, " +
            "Field4 TEXT, " +
            "Field5 TEXT, " +
            "Field6 TEXT, " +
            "Field7 TEXT, " +
            "Field8 TEXT, " +
            "V1 TEXT, " +
            "V2 TEXT, " +
            "V3 TEXT, " +
            "V4 TEXT, " +
            "V5 TEXT, " +
            "V6 TEXT, " +
            "V7 TEXT, " +
            "V15 TEXT, " +
            "Field16 TEXT, " +
            "Field17 TEXT, " +
            "Field18 TEXT, " +
            "Field19 TEXT, " +
            "Field20 TEXT, " +
            "Field21 TEXT, " +
            "Field23 TEXT, " +
            "last INTEGER, " +
            "Field24 TEXT)"
          )
            .then(
              (data) => {
                resolve(data);
              },
              (error) => {
                resolve(error);
              }
            )
            .catch((e) => console.log(e));
        })
        .catch((e) => console.log(e))
    );
  }

  getAllData() {
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql("SELECT * FROM purchaseItems ORDER BY rowId DESC")
            .then(
              (data) => resolve(data),
              (error) => resolve(error)
            )
            .catch((e) => console.log(e));
        })
        .catch((e) => console.log(e))
    );
  }

  find(id) {
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql("SELECT * FROM purchaseItems WHERE rowId = ?", [id])
            .then(
              (data) => resolve(data),
              (error) => resolve(error)
            )
            .catch((e) => {
              console.log(e);
            });
        })
        .catch((e) => {
          console.log(e);
        })
        .catch((e) => console.log(e))
    );
  }

  addData(data: PurchaseItem) {
    console.log("adding ", data);
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql(
            "INSERT INTO purchaseItems (Field1, Field2, Field3, Field4, Field5, Field6, Field7, Field8, " +
            "V1, V2, V3, V4, V5, V6, V7, V15, " +
            "Field16, Field17, Field18, Field19, Field20, Field21, Field23, Field24, last) " +
            "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [
              data.Field1.trim(),
              data.Field2.trim(),
              data.Field3.trim(),
              data.Field4.trim(),
              data.Field5.trim(),
              data.Field6.trim(),
              data.Field7.trim(),
              data.Field8.trim(),
              data.V1.trim(),
              data.V2.trim(),
              data.V3.trim(),
              data.V4.trim(),
              data.V5.trim(),
              data.V6.trim(),
              data.V7.trim(),
              data.V15.trim(),
              data.Field16.trim(),
              data.Field17.trim(),
              data.Field18.trim(),
              data.Field19.trim(),
              data.Field20.trim(),
              data.Field21.trim(),
              data.Field23.trim(),
              data.Field24.trim(),
              data.last || 0,
            ]
          )
            .then(
              (data) => resolve(data),
              (error) => resolve(error)
            )
            .catch((e) => {
              console.log(e);
            });
        })
        .catch((e) => {
          console.log(e);
        })
        .catch((e) => console.log(e))
    );
  }

  searchString(stringval) {
    console.log("string is", stringval);
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql(
            "SELECT * FROM purchaseItems WHERE Field4 LIKE '%" +
            stringval +
            "%' limit 5",
            []
          )
            .then(
              (data) => resolve(data),
              (error) => resolve(error)
            )
            .catch((e) => {
              console.log(e);
            });
        })
        .catch((e) => {
          console.log(e);
        })
        .catch((e) => console.log(e))
    );
  }

  editData(data: PurchaseItem) {
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql(
            "UPDATE purchaseItems SET Field1=?,Field2=?,Field3=?,Field4=?,Field5=?,Field6=?,Field7=?,Field8=?," +
            "V1=?,V2=?,V3=?,V4=?,V5=?,V6=?,V7=?,V8=?," +
            "Field16=?,Field17=?,Field18=?,Field19=?,Field20=?,Field21=?,Field23=?,Field24=?" +
            "WHERE rowId=?",
            [
              data.Field1,
              data.Field2,
              data.Field3,
              data.Field4,
              data.Field5,
              data.Field6,
              data.Field7,
              data.Field8,
              data.V1,
              data.V2,
              data.V3,
              data.V4,
              data.V5,
              data.V6,
              data.V7,
              data.V15,
              data.Field16,
              data.Field17,
              data.Field18,
              data.Field19,
              data.Field20,
              data.Field21,
              data.Field23,
              data.Field24,
              data.rowId,
            ]
          )
            .then(
              (data) => {
                return resolve(data);
              },
              (error) => {
                return resolve(error);
              }
            )
            .catch((e) => {
              console.log(e);
            });
        })
        .catch((e) => {
          console.log(e);
        })
        .catch((e) => console.log(e))
    );
  }

  getLastData() {
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql("SELECT * FROM purchaseItems WHERE last=?", [1])
            .then(
              (data) => resolve(data),
              (error) => resolve(error)
            )
            .catch((e) => {
              console.log(e);
            });
        })
        .catch((e) => {
          console.log(e);
        })
        .catch((e) => console.log(e))
    );
  }

  dropTable() {
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql("DROP TABLE IF EXISTS purchaseItems")
            .then((res) => {
              resolve(res);
              console.log("table dropped", res);
              // this.getData();
            })
            .catch((e) => {
              console.log(e);
              resolve(e);
            });
        })
        .catch((e) => console.log(e))
    );
  }

  deleteData(rowid) {
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql("DELETE FROM purchaseItems WHERE rowId=?", [rowid])
            .then(
              (data) => resolve(data),
              (error) => resolve(error)
            )
            .catch((e) => {
              console.log(e);
            });
        })
        .catch((e) => {
          console.log(e);
        })
        .catch((e) => console.log(e))
    );
  }

  // search(data: PurchaseItem) {
  //   return new Promise((resolve, reject) =>
  //     this.sqlite
  //       .create({
  //         name: "ionicdb.db",
  //         location: "default",
  //       })
  //       .then((db: SQLiteObject) => {
  //         db.executeSql("SELECT * FROM purchaseItems WHERE period_code=? AND last = 0", [
  //           data.period_code,
  //         ])
  //           .then(
  //             (data) => resolve(data),
  //             (error) => resolve(error)
  //           )
  //           .catch((e) => {
  //             console.log(e);
  //           });
  //       })
  //       .catch((e) => {
  //         console.log(e);
  //       })
  //       .catch((e) => console.log(e))
  //   );
  // }

  setItem(object: PurchaseItem) {
    let Id;
    if (!!object.rowId) {
      this.editData(object);
    } else {
      this.addData(object);
    }
  }
}
