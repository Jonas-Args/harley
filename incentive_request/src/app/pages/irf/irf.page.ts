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
  tagPanelObj;
  showBranchName=false;
  
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
        if(!!params.Id){
          this.storage.getItem(params.Id).then(
            data=>{ this.tagPanelObj = data 
            this.formPanel.patchValue(data)
          },
            error => console.error(error))
        }
        console.log(params); // {order: "popular"
      });
      
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

  sendSMS(){
    console.log("sending"+this.formatMessage())
    this.showToast("sending"+this.formatMessage())
   this.sms.send('09177131456', this.formatMessage()).then(
    () => {
      console.log("message sent")
      let hey = this.tagPanelObj
      if(!!this.tagPanelObj && !!this.tagPanelObj.Id){
        let newObj = Object.assign({sent:true},this.formPanel.value)
        // this.tagPanelObj = Object.assign(this.tagPanelObj,newObj)
        this.save(newObj)
      }else{
        this.save(Object.assign({sent:true},this.formPanel.value))
      }
    } ,
    error => console.error('Error removing item', error)
    );
   
  }

  formatMessage(){
    let formValue = this.formPanel.value
    let message = `${formValue.panel_code||""};`+
                   `${formValue.panel_name||""};` +
                   `${formValue.panel_gps_location||""};` +
                   `${formValue.panel_status||""};` + 
                   `${formValue.panel_remarks||""};` +
                   `${formValue.panel_receipted||""};` +
                   `${formValue.panel_week_code||""}`
    // add field here 
    return message 
  }

  formatDate(date){
    // mm/dd/yy format
      let d = date.getDate();
      let m = date.getMonth() + 1; //Month from 0 to 11
      let y = date.getFullYear();
      return '' + (m<=9 ? '0' + m : m) + '/' + (d <= 9 ? '0' + d : d) + '/'+y;
  }


  save(value){
    // if(!!this.tagPanelObj && !!this.tagPanelObj.Id){
    //   value = Object.assign(this.tagPanelObj,value)
    // }
    this.nativeStorage.setItem("irf",value)
    .then(
      () => {
        console.log('Stored item!')
        this.router.navigate(['/request']);
      },
      error => console.error('Error storing item', error)
    );
  }

  // formatValue(value){

  //   let obj = {
  //     PanelCode: value.panel_code,
  //     PanelNAme: value.panel_name,
  //     GPSLoc: value.panel_gps_location,
  //     GPSAccuracy: value.panel_gps_location_accuracy,
  //     Status: value.panel_status,
  //     REmarks: value.panel_remarks,
  //     REceipted: value.panel_receipted,
  //     WeekCode: value.panel_week_code
  //   }
  //   // add field here 

  //   return obj

  // }

  showToast(message){
    message = message || "null"
    this.toast.show(message, '5000', 'top').subscribe(
      toast => {
        console.log(toast);
      }
    );
    
  }
}
