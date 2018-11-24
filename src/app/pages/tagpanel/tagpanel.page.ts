import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { SMS } from '@ionic-native/sms/ngx';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { SqliteService } from '../../services/util/sqlite.service';
import { Toast } from '@ionic-native/toast/ngx';

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
  
  constructor(
    private barcodeScanner: BarcodeScanner,
    private sms: SMS,
    private fb: FormBuilder,
    private sql: SqliteService,
    private toast: Toast) {
      this.formPanel = fb.group({
        panel_code: ['', [Validators.required]],
        panel_name: ['', [Validators.required]],
        panel_status: ['', [Validators.required]],
        panel_gps_location: ['', [Validators.required]],
        panel_remarks: [''],
        panel_receipted: ['']
      });
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
      
    }
  

  scan(){
    this.isBarcodeScanned = false
    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
      this.isBarcodeScanned = true
      this.formPanel.get('panel_code').setValue(barcodeData.text)
      console.log("location",`${this.location.latitude}, ${this.location.longitude}`)
      this.formPanel.get('panel_gps_location').setValue(`${this.location.latitude}, ${this.location.longitude}`)
     }).catch(err => {
         console.log('Error', err);
     });

  }

  sendSMS(){
   this.sms.send('09177131456', this.formatMessage());
  }

  formatMessage(){
    let formValue = this.formPanel.value
    let message = `${formValue.panel_code};`+
                   `${formValue.panel_name};` +
                   `${formValue.panel_gps_location};` +
                   `${formValue.panel_status};` + 
                   `${formValue.panel_remarks};` +
                   `${formValue.panel_receipted}`
    return message 
  }
  
  start(){
  
    AdvancedGeolocation.start(function(success){

        try{
          var jsonObject = JSON.parse(success);
          this.location = jsonObject
          
          console.log("Provider now " +JSON.stringify(jsonObject));
          this.showToast(JSON.stringify(jsonObject))
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
      function(error){
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

  showToast(message){
    message = message || "null"
    this.toast.show(message, '5000', 'center').subscribe(
      toast => {
        console.log(toast);
      }
    );
    
  }
}
