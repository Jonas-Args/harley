import { Injectable } from '@angular/core';
import { SqliteService } from './sqlite.service';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class TagPanelService {

  // TABLE_NAME = "tblTagging"

  
  // constructor(public sqlite: SqliteService, public plt: Platform) { }

  // public pltReadyCreate(data:any){
  //   this.plt.ready().then((readySource) => {
  //     console.log('Platform ready from', readySource);
  //     this.create(data)
  //     // Platform now ready, execute any required native code
  //   });
  // }

  // private create(data:any){
  //   let sql = `INSERT INTO ${this.TABLE_NAME} 
  //   (created_at,updated_at,
  //   panel_code,panel_name,
  //   panel_status,panel_gps_location,
  //   panel_remarks,panel_receipted)
  //   VALUES(?,?,?,?,?,?,?,?)`
    
  //   let date = Date.now().toString()

  //   data = [ date,date,
  //     data.panel_code, data.panel_name, 
  //     data.panel_status, data.panel_gps_location, 
  //     data.panel_remarks, data.panel_receipted
  //   ]

  //   this.sqlite.getDb()
  //   .then((db: SQLiteObject) => 
  //     { 
  //       db.open().then(()=>{console.log("db is opened a"); db.close().then(()=>{
  //         console.log("now closing")
  //         db.open().then(()=>{
  //           console.log("now reopening")
  //           setTimeout(()=>{
  //             db.sqlBatch([[sql, data]]).then(()=>{console.log("data inserted");}).catch(e=>console.error("here"+e)) 
  //           },2000)
           
  //         })
  //       })}).catch(()=>{
  //         console.log("erro a")
  //         db.open().then(()=>{
  //           setTimeout(()=>{
  //             db.sqlBatch([[sql, data]]).then(()=>{console.log("data inserted");}).catch(e=>console.error("here"+e)) 
  //           },2000)
  //         }).catch(()=>{
  //           db.open().then(()=>{
  //             setTimeout(()=>{
  //               db.sqlBatch([[sql, data]]).then(()=>{console.log("data inserted");}).catch(e=>console.error("here"+e)) 
  //             },2000)
  //           })
  //         })
  //       })

        
       
  //     }
  //   )
  //   .catch(e=>{
  //     console.error("there"+e)
  //     this.sqlite.getDb()
  //   .then((db: SQLiteObject) => 
  //     { 
  //       db.open().then(()=>{console.log("db is opened b"); db.close().then(()=>{
  //         db.open().then(()=>{
  //           setTimeout(()=>{
  //             db.sqlBatch([[sql, data]]).then(()=>{console.log("data inserted");}).catch(e=>console.error("here"+e)) 
  //           },2000)
  //         })
  //       })}).catch(()=>{
  //         db.open().then(()=>{
  //           setTimeout(()=>{
  //             db.sqlBatch([[sql, data]]).then(()=>{console.log("data inserted");}).catch(e=>console.error("here"+e)) 
  //           },2000)
  //         })
  //       })

        
       
  //     }
  //   )
  //   })
  // }

  // public read(id: number){


  // }

  // public update(tagPanel: any){

  // }

  // public delete(id: number){

  // }

  // // public getAll(): Array<any>{

  // // }
}
