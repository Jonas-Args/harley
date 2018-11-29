import { Component, OnInit } from '@angular/core';
import { SqliteService } from '../../services/util/sqlite.service';
import { Platform, NavController } from '@ionic/angular';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { tagpanelPage } from '../tagpanel/tagpanel.page';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage  {

  // tagPanels=[];

  // constructor(
  //   private sql: SqliteService,
  //   private plt: Platform,
  //   public navCtrl: NavController,
  // ) { }


  // ionViewDidEnter () {
  //   this.sql.createDatabase()
  // }

  // addTagPanel(){
  //   this.navCtrl.navigateForward('/tagpanel');
  // }

  // private setTagPanels(){
  //   this.sql.tagPanelsSubject.subscribe(res=>{
  //     this.tagPanels = res
  //     console.log("tagPanels", this.tagPanels)
  //   })
  // }
}
