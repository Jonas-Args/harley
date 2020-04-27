import { Injectable } from "@angular/core";
import { NativeStorage } from "@ionic-native/native-storage";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";
import { Irf } from "../../../model/irf";
import { PanelMain } from "../../../model/panelMain";

@Injectable()
export class SqlitePanelMainService {
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
            "CREATE TABLE IF NOT EXISTS panel_mains(rowId INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "panel_code TEXT, " +
            "panel_fname TEXT, " +
            "panel_sec TEXT, " +
            "region TEXT, " +
            "fi_name TEXT, " +
            "sched_day TEXT, " +
            "proj_type INTEGER, " +
            "panel_stat TEXT)"
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
          db.executeSql("SELECT * FROM panel_mains where last!=1 ORDER BY rowId DESC")
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
          db.executeSql("SELECT * FROM panel_mains WHERE rowId = ?", [id])
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

  addData(data: PanelMain) {
    console.log("adding ", data);
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql(
            "INSERT INTO panel_mains (panel_code, panel_fname, panel_sec, region, fi_name, sched_day, proj_type, panel_stat) VALUES(?,?,?,?,?,?,?,?)",
            [
              data.panel_code,
              data.panel_fname,
              data.panel_sec,
              data.region,
              data.fi_name,
              data.sched_day,
              data.proj_type,
              data.panel_stat
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

  editData(data: PanelMain) {
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql(
            "UPDATE panel_mains SET panel_code=?,panel_fname=?,panel_sec=?,region=?,fi_name=?,sched_day=?,proj_type=?,panel_stat=? WHERE rowId=?",
            [
              data.panel_code,
              data.panel_fname,
              data.panel_sec,
              data.region,
              data.fi_name,
              data.sched_day,
              data.proj_type,
              data.panel_stat,
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
          db.executeSql("SELECT * FROM panel_mains WHERE last=?", [1])
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
          db.executeSql("DROP TABLE IF EXISTS panel_mains")
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
          db.executeSql("DELETE FROM panel_mains WHERE rowId=?", [rowid])
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

  search(panelcode) {
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql("SELECT * FROM panel_mains WHERE panel_code=?", [
            panelcode,
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

  setItem(object: PanelMain) {
    let Id;
    if (!!object.rowId) {
      this.editData(object);
    } else {
      this.addData(object);
    }
  }
}
