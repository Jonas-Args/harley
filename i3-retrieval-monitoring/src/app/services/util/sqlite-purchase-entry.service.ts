import { Injectable } from "@angular/core";
import { NativeStorage } from "@ionic-native/native-storage";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";
import { Irf } from "../../../model/irf";
import { PurchaseItem } from "../../../model/purchaseItem";
import { PurchaseEntry } from "../../../model/purchaseEntry";
import { PurchaseFormPage } from "../../../pages/purchase-form/purchase-form.page";

@Injectable()
export class SqlitePurchaseEntryService {
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
            "CREATE TABLE IF NOT EXISTS purchaseEntries(rowId INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "prod_cat TEXT, " +
            "prod_cat_attributes TEXT, " +
            "period_code TEXT, " +
            "manufacturer TEXT, " +
            "manufacturer_attributes TEXT, " +
            "brand TEXT, " +
            "brand_attributes TEXT, " +
            "sub_brand TEXT, " +
            "sub_brand_attributes TEXT, " +
            "flavor TEXT, " +
            "flavor_attributes TEXT, " +
            "formula TEXT, " +
            "formula_attributes TEXT, " +
            "variant TEXT, " +
            "variant_attributes TEXT, " +
            "weight_size TEXT, " +
            "weight_size_attributes TEXT, " +
            "packaging TEXT, " +
            "packaging_attributes TEXT, " +
            "packaging_color TEXT, " +
            "use_type TEXT, " +
            "form TEXT, " +
            "skin_type TEXT, " +
            "hair_type TEXT, " +
            "product_type TEXT, " +
            "gender TEXT, " +
            "age TEXT, " +
            "quantity TEXT, " +
            "price TEXT, " +
            "promo TEXT, " +
            "outlet_type TEXT, " +
            "outlet_name TEXT, " +
            "week TEXT, " +
            "year TEXT, " +
            "period TEXT, " +
            "purchase_time TEXT, " +
            "day TEXT, " +
            "panel_code TEXT, " +
            "date_retrieved TEXT, " +
            "stored TEXT, " +
            "last INTEGER)"
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
          db.executeSql("SELECT * FROM purchaseEntries where last!=1 ORDER BY rowId DESC")
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
          db.executeSql("SELECT * FROM purchaseEntries WHERE rowId = ?", [id])
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

  addData(data: PurchaseEntry) {
    console.log("adding ", data);
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql(
            "INSERT INTO purchaseEntries (stored, prod_cat, prod_cat_attributes, period_code, manufacturer, manufacturer_attributes, brand, brand_attributes, sub_brand, sub_brand_attributes, flavor, flavor_attributes, formula, formula_attributes, variant, variant_attributes, weight_size, weight_size_attributes, packaging, packaging_attributes, " +
            "packaging_color, use_type, form, skin_type, hair_type, product_type, gender, age, quantity, price," +
            "promo, outlet_type, outlet_name, week, purchase_time, day, panel_code, last, year, date_retrieved, period) " +
            "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [
              data.stored,
              data.prod_cat,
              data.prod_cat_attributes,
              data.period_code,
              data.manufacturer,
              data.manufacturer_attributes,
              data.brand,
              data.brand_attributes,
              data.sub_brand,
              data.sub_brand_attributes,
              data.flavor,
              data.flavor_attributes,
              data.formula,
              data.formula_attributes,
              data.variant,
              data.variant_attributes,
              data.weight_size,
              data.weight_size_attributes,
              data.packaging,
              data.packaging_attributes,
              data.packaging_color,
              data.use_type,
              data.form,
              data.skin_type,
              data.hair_type,
              data.product_type,
              data.gender,
              data.age,
              data.quantity,
              data.price,
              data.promo,
              data.outlet_type,
              data.outlet_name,
              data.week,
              data.purchase_time,
              data.day,
              data.panel_code,
              data.last || 0,
              data.year,
              data.date_retrieved,
              data.period,
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

  editData(data: PurchaseEntry) {
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql(
            "UPDATE purchaseEntries SET stored=?, prod_cat=?, prod_cat_attributes=?,period_code=?,manufacturer=?,manufacturer_attributes=?,brand=?,brand_attributes=?,sub_brand=?,sub_brand_attributes=?,flavor=?,flavor_attributes=?,formula=?,formula_attributes=?,variant=?,variant_attributes=?," +
            "weight_size=?,weight_size_attributes=?,packaging=?,packaging_attributes=?,packaging_color=?,use_type=?,form=?,skin_type=?,hair_type=?,product_type=?," +
            "gender=?,age=?,quantity=?,price=?,promo=?,outlet_type=?,outlet_name=?,week=?,purchase_time=?,day=?,panel_code=?,year=?,period=?,date_retrieved=?" +
            "WHERE rowId=?",
            [
              data.stored,
              data.prod_cat,
              data.prod_cat_attributes,
              data.period_code,
              data.manufacturer,
              data.manufacturer_attributes,
              data.brand,
              data.brand_attributes,
              data.sub_brand,
              data.sub_brand_attributes,
              data.flavor,
              data.flavor_attributes,
              data.formula,
              data.formula_attributes,
              data.variant,
              data.variant_attributes,
              data.weight_size,
              data.weight_size_attributes,
              data.packaging,
              data.packaging_attributes,
              data.packaging_color,
              data.use_type,
              data.form,
              data.skin_type,
              data.hair_type,
              data.product_type,
              data.gender,
              data.age,
              data.quantity,
              data.price,
              data.promo,
              data.outlet_type,
              data.outlet_name,
              data.week,
              data.purchase_time,
              data.day,
              data.panel_code,
              data.year,
              data.period,
              data.date_retrieved,
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
          db.executeSql("SELECT * FROM purchaseEntries WHERE last=?", [1])
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
          db.executeSql("DROP TABLE IF EXISTS purchaseEntries")
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
          db.executeSql("DELETE FROM purchaseEntries WHERE rowId=?", [rowid])
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

  search(data: PurchaseEntry) {
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql(
            "SELECT * FROM purchaseEntries WHERE period_code=? AND panel_code=? AND last = 0",
            [data.period_code, data.panel_code]
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

  searchByDate(from, to) {
    // "SELECT * FROM purchaseEntries WHERE Date >= '2011/02/25' and Date <= '2011/02/27' AND last = 0",
    return new Promise((resolve, reject) =>
      this.sqlite
        .create({
          name: "ionicdb.db",
          location: "default",
        })
        .then((db: SQLiteObject) => {
          db.executeSql(
            "SELECT * FROM purchaseEntries WHERE Date >= ? and Date <= ? AND last = 0",
            [from, to]
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

  setItem(object: PurchaseEntry) {
    let Id;
    if (!!object.rowId) {
      this.editData(object);
    } else {
      this.addData(object);
    }
  }
}
