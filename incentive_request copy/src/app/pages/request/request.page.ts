import { Component, OnInit, Input } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { SMS } from '@ionic-native/sms/ngx';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Toast } from '@ionic-native/toast/ngx';
import { StorageService } from '../../services/util/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { IncentiveService } from '../../services/api/Incentive.service';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
declare var AdvancedGeolocation:any;

@Component({
  selector: 'app-request',
  templateUrl: './request.page.html',
  styleUrls: ['./request.page.scss'],
})
export class requestPage implements OnInit  {

  formPanel: FormGroup;
  requestList = [];
  options  = [{value:'One'}, {value:'Two'}, {value:'Three'}];
  filteredOptions;
  proxyValue: any; onSelectionChanged(event$) { this.proxyValue = event$.option.value.ItemDesc; }
  itemDesc="";
  list;
  irfId;
  irfObj:any;
  requestId;
  requestObj;

  constructor(
    private barcodeScanner: BarcodeScanner,
    private sms: SMS,
    private storage: StorageService,
    private fb: FormBuilder,
    private toast: Toast,
    private route: ActivatedRoute,
    private nativeStorage: NativeStorage,
    private incentiveService: IncentiveService,
    private router: Router) {

      this.formPanel = fb.group({
        panel_code: ['', [Validators.required]],
        panel_name: ['', [Validators.required]],
        request_id: ['', [Validators.required]],
        delivery_mode: ['', [Validators.required]],
        branch_name: ['', [Validators.required]],
        item_desc: ['', [Validators.required]],
        item_code: ['', [Validators.required]],
        pointsrequired: ['', [Validators.required]],
        quantity: ['', [Validators.required]]
      });

    }

    ngOnInit() {
      this.route.queryParams
      .subscribe(params => {
        console.log("params",params)
        if(!!params.irfId){
          this.irfId = params.irfId
          this.nativeStorage.getItem(this.irfId)
          .then(
            (data) => {
              this.irfObj = data
              this.formPanel.patchValue(data)
            },
            error => console.error('Error storing item', error)
          );
          }
          if(!!params.requestId){
            this.requestId = params.requestId
            this.nativeStorage.getItem(this.requestId)
            .then(
              (data) => {
                this.requestObj = data
                this.formPanel.patchValue(data)
              },
              error => console.error('Error storing item', error)
            );
            }
      });
    }

    selectDescription(value, element){
      element.value = value.option.value.ItemDesc
      this.itemDesc = element.value
    }
  

  save(value){
    console.log(value)
    if(!!this.requestId){
      value = Object.assign({Id:this.requestId},value)
      this.storage.setItem("request",value)
    }else{
      this.storage.setItem("request",value)
    }
    this.router.navigate([`/irf`], {queryParams: {irfId: this.irfId}})
  }

  sendSMS(){
    this.showToast("sending"+this.formatMessage())
    console.log("sending",this.formatMessage())
   this.sms.send('09177131456', this.formatMessage()).then(
    () => {
      this.save(this.formPanel.value)
      console.log("message sent")
    } ,
    error => console.error('Error removing item', error)
    );
   
  }

  formatMessage(){
    let formValue = this.formPanel.value
    let message = "IRF;"+`${formValue.panel_code||""};`+
                   `${formValue.panel_name||""};` +
                   `${formValue.request_id||""};` +
                   `${formValue.item_desc||""};` +
                   `${formValue.item_code||""};` +
                   `${formValue.pointsrequired||""};` +
                   `${formValue.quantity||""};` +
                   `${formValue.delivery_mode||""};` +
                   `${formValue.branch_name||""};`
    // add field here 
    return message 
  }

  showToast(message){
    message = message || "null"
    this.toast.show(message, '5000', 'top').subscribe(
      toast => {
        console.log(toast);
      }
    );
    
  }

}
