import { Injectable } from "@angular/core";
import { NativeStorage } from "@ionic-native/native-storage";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";
import { Irf } from "../../../model/irf";
import { EopPurchase } from "../../../model/eopPurchase";
import { HhpPurchase } from "../../../model/hhpPurchase";

@Injectable()
export class SqliteHHPService {
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
            "CREATE TABLE IF NOT EXISTS hhp_purchases(rowId INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "date_retrieved TEXT, " +
            "date_ordered TEXT, " +
            "time_ordered TEXT, " +
            "outlet_name TEXT, " +
            "outlet_type TEXT, " +
            "prod_cat TEXT, " +
            "brand TEXT, " +
            "variant INTEGER, " +
            "size TEXT, " +
            "quantity TEXT, " +
            "price TEXT, " +
            "promo TEXT, " +
            "promo_user TEXT, " +
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
          db.executeSql("SELECT * FROM hhp_purchases ORDER BY rowId DESC")
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
          db.executeSql("SELECT * FROM hhp_purchases WHERE rowId = ?", [id])
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

  addData(data: HhpPurchase) {
    console.log("adding ", data);
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql(
            "INSERT INTO hhp_purchases (date_retrieved, time_ordered, date_ordered, outlet_name, outlet_type, prod_cat, brand, variant, size, quantity, price, promo, promo_user, docupic_Id, serverId, panel_code, period_code, page_num, stored, fi_name) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [
              data.date_retrieved,
              data.time_ordered,
              data.date_ordered,
              data.outlet_name,
              data.outlet_type,
              data.prod_cat,
              data.brand,
              data.variant,
              data.size,
              data.quantity,
              data.price,
              data.promo,
              data.promo_user,
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

  editData(data: HhpPurchase) {
    console.log("editing ", data);
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql(
            "UPDATE hhp_purchases SET date_retrieved=?, date_ordered=?, time_ordered=?, outlet_name=?, outlet_type=?, prod_cat=?, brand=?, variant=?, size=?, quantity=?, price=?, promo=?, promo_user=?, docupic_Id=?, serverId=?, panel_code=?, period_code=?, page_num=?, stored=?, fi_name=? WHERE rowId=?",
            [
              data.date_retrieved,
              data.time_ordered,
              data.date_ordered,
              data.outlet_name,
              data.outlet_type,
              data.prod_cat,
              data.brand,
              data.variant,
              data.size,
              data.quantity,
              data.price,
              data.promo,
              data.promo_user,
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
          db.executeSql("SELECT * FROM hhp_purchases WHERE last=?", [1])
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
        db.executeSql("DROP TABLE IF EXISTS hhp_purchases")
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
          db.executeSql("DELETE FROM hhp_purchases WHERE rowId=?", [rowid])
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
          db.executeSql("SELECT * FROM hhp_purchases WHERE date_retrieved>=? AND date_retrieved<=?", [from, to])
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
          db.executeSql("SELECT * FROM hhp_purchases WHERE docupic_Id=?", [
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

  setItem(object: HhpPurchase) {
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
          db.executeSql('DELETE FROM hhp_purchases WHERE rowId IN (' + rowids + ') ')
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
