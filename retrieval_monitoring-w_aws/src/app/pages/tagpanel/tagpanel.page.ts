import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { SMS } from '@ionic-native/sms/ngx';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Toast } from '@ionic-native/toast/ngx';
import { StorageService } from '../../services/util/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TagPanelService } from '../../services/api/tagpanel.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

declare var AdvancedGeolocation:any;

@Component({
  selector: 'app-tagpanel',
  templateUrl: './tagpanel.page.html',
  styleUrls: ['./tagpanel.page.scss'],
})
export class tagpanelPage implements OnInit {

  formPanel: FormGroup;
  isBarcodeScanned = false;
  location;
  tagPanelObj;
  showZeroRemarks = false;
  irfId;
  irfObj;
  
  constructor(
    private barcodeScanner: BarcodeScanner,
    private sms: SMS,
    private storage: StorageService,
    private fb: FormBuilder,
    private toast: Toast,
    private route: ActivatedRoute,
    private tagpanelService: TagPanelService,
    private nativeStorage: NativeStorage,
    private router: Router) {
      this.formPanel = fb.group({
        Id: ['', [Validators.required]],
        panel_code: ['', [Validators.required]],
        panel_name: ['', [Validators.required]],
        panel_status: ['', [Validators.required]],
        panel_gps_location: ['', [Validators.required]],
        panel_gps_location_accuracy: ['', [Validators.required]],
        panel_remarks: [''],
        panel_receipted: [''],
        finame: [''],
        region: [''],
        panel_week_code: ['']
      });

       // add field here
       this.formPanel.get('panel_status').valueChanges.subscribe(value=>{
        if(value=="zero"){
          this.showZeroRemarks = true
        }else{
          this.showZeroRemarks = false
        }
      })
      // add field here
     }

    statuses = [
      {value:"retrieved"},
      {value:"my location"},
      {value:"zero"},	      
      {value:"invited"},
      {value:"na"},	      
      {value:"visited"},
      {value:"hatching"},	      
      {value:"other"}]

    ngOnInit() {

      this.start()
      console.log("tag panel init")
      this.route.queryParams
      .subscribe(params => {
        console.log("params",params)
        if(!!params.panel_code && !!params.week_code){

          this.tagpanelService.findByPanelCodeWeekCode(params.panel_code,params.week_code).subscribe(
            res=>{
              console.log("res",res)
              if(!!res["panel_name"]){
                this.formPanel.patchValue(res)
              }
            }, err => {
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
              this.formPanel.patchValue({panel_code:params.panel_code,panel_week_code:params.week_code})
            },
          )

        }
        console.log(params); // {order: "popular"
      });
      
    }
  
  setPanelValues

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
    let message = "TAG;"+`${formValue.panel_code||""};`+
                   `${formValue.panel_name||""};` +
                   `${formValue.panel_gps_location||""};` +
                   `${formValue.panel_status||""};` + 
                   `${formValue.panel_remarks||""};` +
                   `${formValue.panel_remarks||""};` +
                   `${formValue.panel_receipted||""};` +
                   `${formValue.panel_week_code||""}`
    // add field here 
    return message 
  }
  
  start(){
  
    AdvancedGeolocation.start((success)=>{

        try{
          let jsonObject: any = JSON.parse(success);

          if(!!jsonObject.latitude){
            this.location = jsonObject
            this.formPanel.get('panel_gps_location').setValue(`${this.location.latitude}, ${this.location.longitude}`)
            this.formPanel.get('panel_gps_location_accuracy').setValue(`${this.location.accuracy} meters`)
          }else{
            this.showToast("lat long not available")
          }
          
     
          
          console.log("Provider now " +JSON.stringify(jsonObject));
          // this.showToast(JSON.stringify(jsonObject))
          switch(jsonObject.provider){
            case "gps":
              //TODO
              break;

            case "network":
              //TODO
              break;

            case "satellite":
              //TODO
              break;

            case "cell_info":
              //TODO
              break;

            case "cell_location":
              //TODO
              break;

            case "signal_strength":
              //TODO
              break;
          }
        }
        catch(exc){
          //this.showToast("value"+exc)
          console.log("Invalid JSON: " + exc);
        }
      },
      (error)=>{
        this.showToast(JSON.stringify(error))
        console.log("ERROR! " + JSON.stringify(error));
      },
      ////////////////////////////////////////////
      //
      // REQUIRED:
      // These are required Configuration options!
      // See API Reference for additional details.
      //
      ////////////////////////////////////////////
      {
        "minTime":500,         // Min time interval between updates (ms)
        "minDistance":1,       // Min distance between updates (meters)
        "noWarn":true,         // Native location provider warnings
        "providers":"gps",     // Return GPS, NETWORK and CELL locations
        "useCache":true,       // Return GPS and NETWORK cached locations
        "satelliteData":true, // Return of GPS satellite info
        "buffer":true,        // Buffer location data
        "bufferSize":3,         // Max elements in buffer
        "signalStrength":false // Return cell signal strength data
      });
  }

  save(value){
    if(!!this.irfObj && !!this.irfObj.Id){
      value = Object.assign(this.irfObj,value)
    }
    console.log("storing a",value)
    this.storage.setItem("irf",value)
    this.router.navigate([`/list`], {})
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
