import { Component, OnInit } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { StorageService } from '../../services/util/storage.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage  {

  list:any;

  constructor(
    public navCtrl: NavController,
    public storage: StorageService
  ) { }


  ionViewDidEnter () {
   this.getAllItems()
  }

  addIncentiveRequest(){
    this.navCtrl.navigateForward('/irf');
  }

  removeTagPanel(key){
    this.storage.removeItem(key).then(
      data => { 
        this.getAllItems()
      },
      error => console.error(error)
    )
  }

  getAllItems(){
    this.storage.getAllItem().then(
      data => { 
        let objects = <any[]>data;
        this.list = objects.filter(res=>!!res["Id"] && res["Id"].includes('request'))
        console.log("list",this.list)
      },
      error => console.error(error)
    )
  }

  // private setTagPanels(){
  //   this.sql.tagPanelsSubject.subscribe(res=>{
  //     this.tagPanels = res
  //     console.log("tagPanels", this.tagPanels)
  //   })
  // }
}
