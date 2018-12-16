import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { SMS } from '@ionic-native/sms/ngx';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Toast } from '@ionic-native/toast/ngx';
import { StorageService } from '../../services/util/storage.service';
import { ActivatedRoute } from '@angular/router';

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
  
  constructor(
    private barcodeScanner: BarcodeScanner,
    private sms: SMS,
    private storage: StorageService,
    private fb: FormBuilder,
    private toast: Toast,
    private route: ActivatedRoute) {
      this.formPanel = fb.group({
        panel_code: ['', [Validators.required]],
        panel_name: ['', [Validators.required]],
        panel_status: ['', [Validators.required]],
        panel_gps_location: ['', [Validators.required]],
        panel_gps_location_accuracy: ['', [Validators.required]],
        panel_remarks: [''],
        panel_receipted: [''],
        panel_week_code: ['']
      });
      // add field here
     }

  statuses = [
    {value:"retrieved"},
    {value:"zero"},
    {value:"na"},
    {value:"hatching"},
    {value:"invited"},
    {value:"dropped"}]

    ngOnInit() {
      this.start()
      console.log("tag panel init")
      this.route.queryParams
      .subscribe(params => {
        console.log("params",params)
        if(!!params.key){
          this.storage.getItem(params.key).then(
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
   this.sms.send('09177131456', this.formatMessage());
  }

  formatMessage(){
    let formValue = this.formPanel.value
    let message = `${formValue.panel_code||""};`+
                   `${formValue.panel_name||""};` +
                   `${formValue.panel_gps_location||""};` +
                   `${formValue.panel_status||""};` + 
                   `${formValue.panel_remarks||""};` +
                   `${formValue.panel_receipted||""}` +
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
    value = this.formatValue(value)
    if(!!this.tagPanelObj && !!this.tagPanelObj.key){
      value = Object.assign({Id:this.tagPanelObj.key},value)
    }

    this.storage.setItem("tagpanel",value)
  }

  formatValue(value){

    let obj = {
      PanelCode: value.panel_code,
      PanelNAme: value.panel_name,
      GPSLoc: value.panel_gps_location,
      GPSAccuracy: value.panel_gps_location_accuracy,
      Status: value.panel_status,
      REmarks: value.panel_remarks,
      REceipted: value.panel_receipted,
      WeekCode: value.panel_week_code
    }
    // add field here 

    return obj

  }

  showToast(message){
    message = message || "null"
    this.toast.show(message, '5000', 'center').subscribe(
      toast => {
        console.log(toast);
      }
    );
    
  }
}
