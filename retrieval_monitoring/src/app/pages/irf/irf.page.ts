import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { SMS } from '@ionic-native/sms/ngx';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Toast } from '@ionic-native/toast/ngx';
import { StorageService } from '../../services/util/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

declare var AdvancedGeolocation:any;

@Component({
  selector: 'app-irf',
  templateUrl: './irf.page.html',
  styleUrls: ['./irf.page.scss'],
})
export class irfPage implements OnInit {

  formPanel: FormGroup;
  isBarcodeScanned = false;
  location;
  irfObj;
  showBranchName=false;
  irdId;
  requests;
  
  constructor(
    private barcodeScanner: BarcodeScanner,
    private sms: SMS,
    private storage: StorageService,
    private fb: FormBuilder,
    private toast: Toast,
    private route: ActivatedRoute,
    private router: Router,
    private nativeStorage: NativeStorage,
    ) {
      this.formPanel = fb.group({
        panel_code: ['', [Validators.required]],
        panel_name: ['', [Validators.required]],
        request_id: ['', [Validators.required]],
        delivery_mode: ['', [Validators.required]],
        branch_name: ['', [Validators.required]],
      });
      // add field here
      this.formPanel.get('panel_code').valueChanges.subscribe(value=>{
        this.formPanel.get('request_id').setValue(value+this.formatDate(new Date()))
      })
      this.formPanel.get('delivery_mode').valueChanges.subscribe(value=>{
        if(value=="LBC branch pickup"){
          this.showBranchName = true;
        }else{
          this.showBranchName = false;
        }
      })
     }

    ngOnInit() {
      this.route.queryParams
      .subscribe(params => {
        console.log("params",params)
        if(!!params.irfId){
          this.irdId = params.irfId
          this.storage.getItem(params.irfId).then(
            data=>{ 
              console.log("retrieved",data)
            this.irfObj = data 
            this.formPanel.patchValue(data)
            this.getAllItems()
          },
            error => console.error(error))
        }
        console.log(params); // {order: "popular"
      });
      
    }

    ionViewDidEnter () {
      if(!!this.formPanel.value["panel_code"]){
        this.getAllItems()
      }
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


  formatDate(date){
    // mm/dd/yy format
      let d = date.getDate();
      let m = date.getMonth() + 1; //Month from 0 to 11
      let y = date.getFullYear();
      return '' + (m<=9 ? '0' + m : m) + '/' + (d <= 9 ? '0' + d : d) + '/'+y;
  }


  save(value){
    if(!!this.irfObj && !!this.irfObj.Id){
      value = Object.assign(this.irfObj,value)
      console.log("storing a",value)
      this.storage.setItem("irf",value,`/request`,{queryParams: {irfId: this.irfObj.Id}})
    }else{
      console.log("storing b",value)
      
      this.storage.setItem("irf",value)
      this.router.navigate([`/request`], {queryParams: {irfId: this.storage.itemId}})
    }
  }

  editRequest(requestId){
    this.router.navigate([`/request`], {queryParams: {irfId: this.storage.itemId, requestId:requestId}})
  }

  getAllItems(){
    this.storage.getAllItem().then(
      data => { 
        let objects = <any[]>data;
        console.log("objects",objects)
        console.log("formpanelvalue",this.formPanel.value)
        this.requests = objects.filter(res=>!!res["Id"] && res["Id"].includes('request') && res["panel_code"]==this.formPanel.value["panel_code"])
        console.log("requests",this.requests)
      },
      error => console.error(error)
    )
  }

  showToast(message){
    message = message || "null"
    this.toast.show(message, '5000', 'top').subscribe(
      toast => {
        console.log(toast);
      }
    );
    
  }

  removeRequest(key){
    this.storage.removeItem(key).then(
      data => { 
        this.getAllItems()
      },
      error => console.error(error)
    )
  }
}
