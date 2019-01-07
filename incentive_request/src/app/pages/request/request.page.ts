import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { SMS } from '@ionic-native/sms/ngx';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Toast } from '@ionic-native/toast/ngx';
import { StorageService } from '../../services/util/storage.service';
import { ActivatedRoute } from '@angular/router';
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
  requestObj:any;
  options  = [{value:'One'}, {value:'Two'}, {value:'Three'}];
  filteredOptions;
  proxyValue: any; onSelectionChanged(event$) { this.proxyValue = event$.option.value.ItemDesc; }
  itemDesc="";

  constructor(
    private barcodeScanner: BarcodeScanner,
    private sms: SMS,
    private storage: StorageService,
    private fb: FormBuilder,
    private toast: Toast,
    private route: ActivatedRoute,
    private nativeStorage: NativeStorage,
    private incentiveService: IncentiveService) {
      this.formPanel = fb.group({
        panel_code: ['', [Validators.required]],
        panel_name: ['', [Validators.required]],
        request_id: ['', [Validators.required]],
        delivery_mode: ['', [Validators.required]],
        branch_name: ['', [Validators.required]],
        item_desc: ['', [Validators.required]],
        quantity: ['', [Validators.required]]
      });
      let a = [{a:'a'}]
      // add field here
      this.nativeStorage.getItem("irf")
      .then(
        (data) => {
          this.formPanel.patchValue(data)
        },
        error => console.error('Error storing item', error)
      );
    }

    ngOnInit() {
      this.incentiveService.getIncentives().subscribe(res=>{
        console.log("result is", res)
        this.requestList = res.records
      })
      this.filteredOptions = this.formPanel.get('item_desc').valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
    }

    private _filter(value): string[] {
      if(typeof value === 'string'){
        const filterValue = value.toLowerCase();
        console.log('filtervalue',filterValue)
  
        return this.requestList.filter(option => {
          console.log("value",option.ItemDesc.toLowerCase().includes(filterValue))
         return option.ItemDesc.toLowerCase().includes(filterValue)
        });
      }else{
        return []
      }
      
    }

    selectDescription(value, element){
      element.value = value.option.value.ItemDesc
      this.itemDesc = element.value
    }
  

  save(value){
    value["item_desc"] = this.itemDesc
    if(!!this.requestObj && !!this.requestObj.Id){
      value = Object.assign(this.requestObj,value)
    }
    this.storage.setItem("request",value)
  }

  sendSMS(){
    this.showToast("sending"+this.formatMessage())
   this.sms.send('09177131456', this.formatMessage()).then(
    () => {
      console.log("message sent")
      if(!!this.requestObj && !!this.requestObj.Id){
        // let newObj = Object.assign({sent:true},this.formPanel.value)
        // this.tagPanelObj = Object.assign(this.tagPanelObj,newObj)
        // this.save(newObj)
      }else{
        this.save(this.formPanel.value)
      }
    } ,
    error => console.error('Error removing item', error)
    );
   
  }

  formatMessage(){
    let formValue = this.formPanel.value
    let message = `${formValue.panel_code||""};`+
                   `${formValue.panel_name||""};` +
                   `${formValue.request_id||""};` +
                   `${formValue.delivery_mode||""};`
    if(formValue.delivery_mode ==' LBC branch pickup' ){
      message = message + `${formValue.branch_name||""};` 
    }
    message = message + `${this.itemDesc||""};` +
              `${formValue.quantity||""};`
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
