import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { Toast } from '@ionic-native/toast/ngx';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  constructor(private toast: Toast) {}

  showToast(a,b='5000',c='center'){
    this.toast.show(a,b,c).subscribe(
      toast => {
        // this.navCtrl.popToRoot();
      }
    );
  }
}