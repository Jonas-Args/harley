import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { SMS } from '@ionic-native/sms/ngx';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Toast } from '@ionic-native/toast/ngx';
import { StorageService } from '../../services/util/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { bindingUpdated } from '@angular/core/src/render3/instructions';

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
        period: ['', [Validators.required]],
        week: ['', [Validators.required]],
        week_code: ['', [Validators.required]],
        accuracy: ['', [Validators.required]],
        date_retrieved: [new Date().toLocaleString().split(',')[0], [Validators.required]],
        date_received: [new Date().toLocaleString().split(',')[0], [Validators.required]],
        panel_code: ['', [Validators.required]],
      });
      // add field here
      this.formPanel.get('period').valueChanges.subscribe(value=>{
        this.formPanel.get('week_code').setValue(
          value + "." + this.formPanel.value["week"]
          )
      })
      this.formPanel.get('week').valueChanges.subscribe(value=>{
        this.formPanel.get('week_code').setValue(
          this.formPanel.value["period"] + "." + value
          )
      })
     }

    ngOnInit() {
      this.start()

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
      this.storage.setItem("irf",value,`/tagpanel`,{queryParams: {irfId: this.irfObj.Id,week_code: this.formPanel.value["week_code"],panel_code: this.formPanel.value["panel_code"]}})
    }else{
      console.log("storing b",value)
      
      this.storage.setItem("irf",value)
      this.router.navigate([`/tagpanel`], {queryParams: {irfId: this.storage.itemId,week_code: this.formPanel.value["week_code"],panel_code: this.formPanel.value["panel_code"]}})
    }
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
