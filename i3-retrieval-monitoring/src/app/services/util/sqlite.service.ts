import { Injectable } from "@angular/core";
import { NativeStorage } from "@ionic-native/native-storage";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";
import { Irf } from "../../../model/irf";

@Injectable()
export class SqliteService {
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
            "CREATE TABLE IF NOT EXISTS irf(rowId INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "region TEXT, " +
            "year TEXT, " +
            "period TEXT, " +
            "week TEXT, " +
            "period_code TEXT, " +
            "fi_name TEXT, " +
            "last INTEGER, " +
            "panel_name TEXT, " +
            "panel_status TEXT, " +
            "gps_location TEXT, " +
            "date_retrieved TEXT, " +
            "accuracy TEXT, " +
            "panel_remarks TEXT, " +
            "panel_receipted TEXT, " +
            "panel_code TEXT, " +
            "stored TEXT)"
          )
            .then(
              (data) => resolve(data),
              (error) => resolve(error)
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
          db.executeSql("SELECT * FROM irf where last!=1 ORDER BY rowId DESC")
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
          db.executeSql("SELECT * FROM irf WHERE rowId = ?", [id])
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

  addData(data: Irf) {
    console.log("adding ", data);
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql(
            "INSERT INTO irf (region, year, period, week, period_code, fi_name, panel_code, panel_name, panel_status, gps_location, date_retrieved, accuracy, panel_remarks, panel_receipted, last) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [
              data.region,
              data.year,
              data.period,
              data.week,
              data.period_code,
              data.fi_name,
              data.panel_code,
              data.panel_name,
              data.panel_status,
              data.gps_location,
              data.date_retrieved,
              data.accuracy,
              data.panel_remarks,
              data.panel_receipted,
              data.last,
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

  editData(data: Irf) {
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql(
            "UPDATE irf SET region=?,year=?,period=?,week=?,period_code=?,fi_name=?,panel_code=?,panel_name=?,panel_status=?,gps_location=?,date_retrieved=?,accuracy=?,panel_remarks=?,panel_receipted=?,last=?,stored=? WHERE rowId=?",
            [
              data.region,
              data.year,
              data.period,
              data.week,
              data.period_code,
              data.fi_name,
              data.panel_code,
              data.panel_name,
              data.panel_status,
              data.gps_location,
              data.date_retrieved,
              data.accuracy,
              data.panel_remarks,
              data.panel_receipted,
              data.last,
              data.stored,
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
          db.executeSql("SELECT * FROM irf WHERE last=?", [1])
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
    this.sqlite
      .create({
        name: "ionicdb.db",
        location: "default",
      })
      .then((db: SQLiteObject) => {
        db.executeSql("DROP TABLE IF EXISTS irf")
          .then((res) => {
            console.log("table dropped", res);
            // this.getData();
          })
          .catch((e) => console.log(e));
      })
      .catch((e) => console.log(e));
  }

  deleteData(rowid) {
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql("DELETE FROM irf WHERE rowId=?", [rowid])
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

  search(data: Irf) {
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql("SELECT * FROM irf WHERE period_code=? AND last = 0", [
            data.period_code,
          ])
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

  setItem(object: Irf) {
    let Id;
    if (!!object.rowId) {
      this.editData(object);
    } else {
      this.addData(object);
    }
  }
}