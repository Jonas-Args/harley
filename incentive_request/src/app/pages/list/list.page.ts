import { Component, OnInit } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { StorageService } from '../../services/util/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage  {

  list:any;

  constructor(
    private router: Router,
    public storage: StorageService
  ) { }


  ionViewDidEnter () {
   this.getAllItems()
  }

  addIncentiveRequest(){
    this.router.navigateByUrl('/irf')
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
        console.log("objects",objects)
        this.list = objects.filter(res=>!!res["Id"] && res["Id"].includes('irf'))
        
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
