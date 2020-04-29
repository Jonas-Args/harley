import { Injectable } from "@angular/core";
import { NativeStorage } from "@ionic-native/native-storage";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";
import { Irf } from "../../../model/irf";
import { EopPurchase } from "../../../model/eopPurchase";

@Injectable()
export class SqliteEOPService {
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
            "CREATE TABLE IF NOT EXISTS eop_purchases(rowId INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "date_retrieved TEXT, " +
            "date_ordered TEXT, " +
            "time_ordered TEXT, " +
            "outlet_name TEXT, " +
            "outlet_type TEXT, " +
            "inside_mall TEXT, " +
            "access_type TEXT, " +
            "for_whom INTEGER, " +
            "food_ordered TEXT, " +
            "meat_type TEXT, " +
            "cook_type TEXT, " +
            "amount_paid TEXT, " +
            "with_receipt TEXT, " +
            "group_size TEXT, " +
            "kids_below_12 TEXT, " +
            "docupic_Id TEXT, " +
            "serverId INTEGER, " +
            "panel_code TEXT, " +
            "period_code TEXT, " +
            "page_num TEXT, " +
            "fi_name TEXT, " +
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
          db.executeSql("SELECT * FROM eop_purchases ORDER BY rowId DESC")
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
          db.executeSql("SELECT * FROM eop_purchases WHERE rowId = ?", [id])
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

  addData(data: EopPurchase) {
    console.log("adding ", data);
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql(
            "INSERT INTO eop_purchases (date_retrieved, date_ordered, time_ordered, outlet_name, outlet_type, inside_mall, access_type, for_whom, food_ordered, meat_type, cook_type, amount_paid, with_receipt, group_size, kids_below_12, docupic_Id, serverId, panel_code, period_code, page_num, stored, fi_name) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [
              data.date_retrieved,
              data.date_ordered,
              data.time_ordered,
              data.outlet_name,
              data.outlet_type,
              data.inside_mall,
              data.access_type,
              data.for_whom,
              data.food_ordered,
              data.meat_type,
              data.cook_type,
              data.amount_paid,
              data.with_receipt,
              data.group_size,
              data.kids_below_12,
              data.docupic_Id,
              data.serverId,
              data.panel_code,
              data.period_code,
              data.page_num,
              data.stored,
              data.fi_name
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

  editData(data: EopPurchase) {
    console.log("editing ", data);
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql(
            "UPDATE eop_purchases SET date_retrieved=?, date_ordered=?, time_ordered=?, outlet_name=?, outlet_type=?, inside_mall=?, access_type=?, for_whom=?, food_ordered=?, meat_type=?, cook_type=?, amount_paid=?, with_receipt=?, group_size=?, kids_below_12=?,docupic_Id=?, serverId=?, panel_code=?, period_code=?, page_num=?, stored=?, fi_name=? WHERE rowId=?",
            [
              data.date_retrieved,
              data.date_ordered,
              data.time_ordered,
              data.outlet_name,
              data.outlet_type,
              data.inside_mall,
              data.access_type,
              data.for_whom,
              data.food_ordered,
              data.meat_type,
              data.cook_type,
              data.amount_paid,
              data.with_receipt,
              data.group_size,
              data.kids_below_12,
              data.docupic_Id,
              data.serverId,
              data.panel_code,
              data.period_code,
              data.page_num,
              data.stored,
              data.fi_name,
              data.rowId
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
          db.executeSql("SELECT * FROM eop_purchases WHERE last=?", [1])
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
        db.executeSql("DROP TABLE IF EXISTS eop_purchases")
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
          db.executeSql("DELETE FROM eop_purchases WHERE rowId=?", [rowid])
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

  searchByDate(from, to) {
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql("SELECT * FROM eop_purchases WHERE date_retrieved>=? AND date_retrieved<=?", [from, to])
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

  search(id) {
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql("SELECT * FROM eop_purchases WHERE docupic_Id=?", [
            id,
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

  setItem(object: EopPurchase) {
    let Id;
    if (!!object.rowId) {
      this.editData(object);
    } else {
      this.addData(object);
    }
  }

  deleteAll(rowids) {
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql('DELETE FROM eop_purchases WHERE rowId IN (' + rowids + ') ')
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
}
