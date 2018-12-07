import { Component, OnInit } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { StorageService } from '../../services/util/storage.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage  {

  tagPanels:any;

  constructor(
    public navCtrl: NavController,
    public storage: StorageService
  ) { }


  ionViewDidEnter () {
   this.getAllItems()
  }

  addTagPanel(){
    this.navCtrl.navigateForward('/tagpanel');
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
        console.log("list",data)
        this.tagPanels = data
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
