import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { Toast } from '@ionic-native/toast/ngx';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  DB_NAME: any = 'dirmorlite.db'
  TABLE_NAME: any = 'tblTagging'
  db: SQLiteObject

  options: any = {
    name: this.DB_NAME,
    location: 'default',
    createFromLocation: 1
}

  constructor(private sqlite: SQLite,
    private platForm: Platform, private toast: Toast) {
      this.createDb()
     }

  saveData(data) {
    this.sqlite.create(this.options).then((db: SQLiteObject) => {
      let date = Date.now().toString()
      db.executeSql(
      `INSERT INTO ${this.TABLE_NAME}
       (created_at,updated_at,
        panel_code,panel_name,
        panel_status,panel_gps_location,
        panel_remarks,panel_receipted)
       VALUES(?,?,?,?,?,?,?,?)`,
      [ date,date,
        data.panel_code, data.panel_name, 
        data.panel_status, data.panel_gps_location, 
        data.panel_remarks, data.panel_receipted
      ]
        )
        .then(res => {
          this.showDataForLogging()
          console.log(res);
          this.showToast('Data saved', '5000', 'center')
        })
        .catch(e => {
          console.log(e);
          this.showToast(e, '5000', 'center')
        });
    }).catch(e => {
      console.log(e);
      this.showToast(e, '5000', 'center')
    });
  }

  createDb(){
    this.sqlite.create(this.options).then((db: SQLiteObject) => {
      this.db = db
      db.executeSql(`CREATE TABLE IF NOT EXISTS ${this.TABLE_NAME} 
      ( rowid INTEGER PRIMARY KEY, created_at TEXT, 
        updated_at TEXT, panel_code TEXT, 
        panel_name TEXT, panel_status TEXT, 
        panel_gps_location TEXT, panel_remarks TEXT, 
        panel_receipted TEXT )`)
        .then(() => {
          this.showDataForLogging()
          console.log('Executed SQL')
          this.showToast('Executed SQL', '5000', 'center')
        })
        .catch(e => {console.log(e);});
    })
    .catch(e => {console.log(e);});
  }



  getCurrentData(rowid) {
    this.sqlite.create({
      name: this.DB_NAME,
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql(`SELECT * FROM ${this.TABLE_NAME} WHERE rowid=?`, [rowid])
        .then(res => {
          if(res.rows.length > 0) {
            console.log("result is", res.rows.item(0))
          }
        })
        .catch(e => {
          console.log(e);
        });
    }).catch(e => {
      console.log(e);
    });
  }

  updateData(row_id:number,data:any) {
    this.sqlite.create({
      name: this.DB_NAME,
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql(`UPDATE  ${this.TABLE_NAME} SET panel_code=?,panel_name=?,panel_status=?,panel_gps_location=?,panel_remarks=?,panel_receipted=? WHERE rowid=?`,[data.panel_code,data.panel_name,data.panel_status,data.panel_gps_location,data.panel_remarks,data.panel_receipted,row_id])
        .then(res => {
          console.log(res);
        })
        .catch(e => {
          console.log(e);
        });
    }).catch(e => {
      console.log(e);
    });
  }

  deleteData(rowid) {
    this.sqlite.create({
      name: this.DB_NAME,
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('DELETE FROM expense WHERE rowid=?', [rowid])
      .then(res => {
        console.log(res);
      })
      .catch(e => console.log(e));
    }).catch(e => console.log(e));
  }

  getData() {
    // let values = []
    // this.sqlite.create({
    //   name: 'ionicdb.db',
    //   location: 'default'
    // }).then((db: SQLiteObject) => {
    //   db.executeSql('CREATE TABLE IF NOT EXISTS expense(rowid INTEGER PRIMARY KEY, date TEXT, type TEXT, description TEXT, amount INT)', {})
    //   .then(res => console.log('Executed SQL'))
    //   .catch(e => console.log(e));
    //   // db.executeSql('SELECT * FROM expense ORDER BY rowid DESC', {})
    //   // .then(res => {
    //   //   for(var i=0; i<res.rows.length; i++) {
    //   //     values.push({rowid:res.rows.item(i).rowid,date:res.rows.item(i).date,type:res.rows.item(i).type,description:res.rows.item(i).description,amount:res.rows.item(i).amount})
    //   //   }
    //   // })
    //   // .catch(e => console.log(e));
    //   // db.executeSql('SELECT SUM(amount) AS totalIncome FROM expense WHERE type="Income"', {})
    //   // .then(res => {
    //   //   if(res.rows.length>0) {
    //   //     this.totalIncome = parseInt(res.rows.item(0).totalIncome);
    //   //     this.balance = this.totalIncome-this.totalExpense;
    //   //   }
    //   // })
    //   // .catch(e => console.log(e));
    //   // db.executeSql('SELECT SUM(amount) AS totalExpense FROM expense WHERE type="Expense"', {})
    //   // .then(res => {
    //   //   if(res.rows.length>0) {
    //   //     this.totalExpense = parseInt(res.rows.item(0).totalExpense);
    //   //     this.balance = this.totalIncome-this.totalExpense;
    //   //   }
    //   // })
    // }).catch(e => console.log(e));
  }

  dropTable(){
    this.sqlite.create(this.options).then((db: SQLiteObject) => {
      db.executeSql(`DROP TABLE IF EXISTS ${this.TABLE_NAME}`).then(res=>{
        console.log("table dropped")
      })
    })
  }

  showDataForLogging(){
    this.sqlite.create(this.options).then((db: SQLiteObject) => {
      db.executeSql(`SELECT * FROM ${this.TABLE_NAME} ORDER BY rowid DESC`)
      .then(res => {
        console.log(res);
        let values = []
        for(var i=0; i<res.rows.length; i++) {
          let row = res.rows.item(i)
          values.push({
            rowid:row.rowid,
            created_at: row.created_at,
            updated_at: row.updated_at,
            panel_code: row.panel_code,
            panel_name: row.panel_name,
            panel_gps_location: row.panel_gps_location,
            panel_remarks: row.panel_remarks,
            panel_receipted: row.panel_receipted
          })
        }
        console.log("db content",values)
      })
      .catch(e => {console.log(e);});
    }).catch(e => {console.log(e);});
  }
  private showToast(a,b,c){
    this.toast.show(a,b,c).subscribe(
      toast => {
        // this.navCtrl.popToRoot();
      }
    );
  }
}