import { Component, OnInit } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { StorageService } from '../../services/util/storage.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {

  formPanel: FormGroup;
  list:any;
  results:any;
  isBarcodeScanned = false;

  constructor(
    public navCtrl: NavController,
    public storage: StorageService,
    private fb: FormBuilder,
    private barcodeScanner: BarcodeScanner,
    private router: Router
  ) {
    this.formPanel = fb.group({
      panel_code: ['', [Validators.required]]
    });
   }

  ngOnInit() {
    this.formPanel.get('panel_code').valueChanges.subscribe(value=>{
      this.results = this.list.filter(res=>res["panel_code"].includes(value))
    })
  }

  ionViewDidEnter () {
   this.getAllItems()
  }

  addIncentiveRequest(){
    if(this.formPanel.value['panel_code'] != ''){
      this.router.navigate(['/irf'], { queryParams: { panel_code: this.formPanel.value['panel_code']} });
    }else{
      this.navCtrl.navigateForward('/irf');
    }
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
        this.results = this.list = objects.filter(res=>!!res["Id"] && res["Id"].includes('request'))
        console.log("list",this.list)
      },
      error => console.error(error)
    )
  }

  search(){
  }

  scan(){
    this.isBarcodeScanned = false
    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
      this.isBarcodeScanned = true
      this.formPanel.get('panel_code').setValue(barcodeData.text)
      
     }).catch(err => {
         console.log('Error', err);
     });

  }
  // private setTagPanels(){
  //   this.sql.tagPanelsSubject.subscribe(res=>{
  //     this.tagPanels = res
  //     console.log("tagPanels", this.tagPanels)
  //   })
  // }
}
