import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { irfPage } from '../irf/irf';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { StorageService } from '../../app/services/util/storage.service';
import { IrfFormService } from '../../app/services/api/irf-form.service';
import { HttpService } from '../../app/services/util/http.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage implements OnInit {

  formPanel: FormGroup;
  list:any;
  results:any;
  isBarcodeScanned = false;

  constructor(
    public navCtrl: NavController,
    private fb: FormBuilder,
    public storage: StorageService,
    private barcodeScanner: BarcodeScanner,
    private httpService: HttpService) {
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
      this.navCtrl.push(irfPage, {
        panel_code: this.formPanel.value['panel_code']
      });
     }else{
      this.navCtrl.push(irfPage, {});
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
         console.log("list",this.list[0])
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