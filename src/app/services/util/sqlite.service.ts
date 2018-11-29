import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  // DB_NAME: any = 'dirmorlite.db'
  // TABLE_NAME: any = 'tblTagging'
  // private db: SQLiteObject

  // constructor(private sqlite: SQLite,
  //   private platForm: Platform) { }

  // createDb(): Promise<SQLiteObject> {
  //   return this.platForm.ready()
  //     .then((readySource: string) => {
  //       return this.sqlite.create({ 
  //         name: this.DB_NAME,
  //         location: 'default'
  //       }).then((db: SQLiteObject) => {
  //         this.db = db;
  //         return this.db;
  //       }).catch((error: Error) => {
  //         console.log('Error on open or create database: ', error);
  //         return Promise.reject(error.message || error);
  //       });  
  //     });  
  // }

  // createDb(){
  //   this.sqlite.create({
  //     name: 'data.db',
  //     location: 'default'
  //   })
  //     .then((db: SQLiteObject) => {
    
  //       db.executeSql(`create table ${this.TABLE_NAME} (panel_code TEXT, panel_name TEXT, panel_status TEXT, panel_gps_location TEXT, panel_remarks TEXT, panel_receipted TEXT )`)
  //         .then(() => console.log('Executed SQL'))
  //         .catch(e => console.log(e));
    
    
  //     })
  //     .catch(e => console.log(e));
    
  // }
}