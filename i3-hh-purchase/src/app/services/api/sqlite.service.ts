import { Injectable } from "@angular/core";
import { BaseService } from "./base.service";
import { HttpService } from "../util/http.service";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";

@Injectable()
export class SqliteService {
  public apiEndpoint: any;

  constructor(private sqlite: SQLite) {}

  createDb() {
    this.sqlite
      .create({
        name: "data.db",
        location: "default"
      })
      .then((db: SQLiteObject) => {
        db.executeSql("create table danceMoves(name VARCHAR(32))", [])
          .then(() => console.log("Executed SQL"))
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));
  }

  save() {
    this.sqlite
      .create({
        name: "data.db",
        location: "default"
      })
      .then((db: SQLiteObject) => {
        db.executeSql("insert into danceMoves (name) values ('jonas')", [])
          .then(res => {
            console.log(res);
            debugger;
          })
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));
  }

  retrieve() {
    this.sqlite
      .create({
        name: "data.db",
        location: "default"
      })
      .then((db: SQLiteObject) => {
        db.executeSql("select * from danceMoves", [])
          .then(res => {
            console.log(res);
            debugger;
          })
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));
  }
}
