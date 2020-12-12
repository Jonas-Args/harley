import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { StorageService } from '../../app/services/util/storage.service';
import { irfPage } from '../irf/irf.page';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html'
})
export class ListPage  {

  list:any;

  constructor(
    public storage: StorageService,
    public navCtrl: NavController,
  ) { }


  ionViewDidEnter () {
   this.getAllItems()
  }

  retrieveTagPanel(){
    this.navCtrl.push(irfPage, {});
  }

  removeIrf(key){
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
        console.log("objects",objects)
        this.list = objects.filter(res=>!!res["Id"] && res["Id"].includes('irf'))
      },
      error => console.error(error)
    )
  }

  moveToIrf(row:any){
    if(!!row){
      this.navCtrl.push(irfPage, {
        Id: row.Id
      });
    }else{
      this.navCtrl.push(irfPage, {});
    }
   
  }

}
