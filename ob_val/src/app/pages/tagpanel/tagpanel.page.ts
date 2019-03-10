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
  date_visit;
  
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
        loc_accuracy: ['', [Validators.required]],
        panel_code: ['', [Validators.required]],
        panel_name: ['', [Validators.required]],
        fw_result: ['', [Validators.required]],
        fw_type: ['', [Validators.required]],
        panelist_comment: ['', [Validators.required]],
        gl_remarks_panel: ['', [Validators.required]],
        gl_remarks_fi: ['', [Validators.required]],
        gps_location: ['', [Validators.required]]
      });
      // add field here
     }

    statuses = [
      {value:"RETRIEVED"},
      {value:"ZERO"},	      
      {value:"NA"},	      
      {value:"HATCHING"},	   
      {value:"DROPPED"},   
      {value:"MY LOCATION"}]

    ngOnInit() {

      this.start()
      console.log("tag panel init")
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
    if(this.isDataValid(this.formPanel.value)){
      this.showToast("sending"+this.formatMessage())
      console.log("sending",this.formatMessage())
      this.date_visit = new Date().toLocaleString()
      this.sms.send('09177131456', this.formatMessage()).then(
      () => {
        this.save(this.formPanel.value)
        console.log("message sent")
      } ,
      error => console.error('Error removing item', error)
      );
    }
  }

  formatMessage(){
    let formValue = this.formPanel.value
    let message = "OBV;"+`${this.irfObj.proj_type||""};`+
                   `${this.irfObj.region||""};`+
                   `${this.irfObj.date_visit||""};`+
                   `${this.irfObj.year||""};`+
                   `${this.irfObj.period||""};`+
                   `${this.irfObj.week||""};`+
                   `${this.irfObj.gl_name||""};`+
                   `${this.irfObj.fi_name||""};`+
                   `${formValue.panel_code||""};` +
                   `${formValue.panel_name||""};` +
                   `${formValue.fw_result||""};` +
                   `${formValue.fw_type||""};` + 
                   `${formValue.panelist_comment||""};` +
                   `${formValue.gl_remarks_panel||""};` +
                   `${formValue.gl_remarks_fi||""};` +
                   `${formValue.gps_location||""};`
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
            this.formPanel.get('panel_gps_location_accuracy').setValue(`${parseFloat(this.location.accuracy.toFixed(2))} meters`)
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
    this.resetOthePanelCodesLast()
  }

  actualSave(){
    let value = this.formPanel.value
    if(this.isDataValid(value)){
      value["date_visit"] = this.date_visit
      value["last"] = true
      if(!!this.irfObj && !!this.irfObj.Id){
        value = Object.assign(this.irfObj,value)
      }
      console.log("storing a",value)
      this.storage.setItem("irf",value)
      this.router.navigate([`/irf`], {})
    }
  }


  resetOthePanelCodesLast(){
    this.storage.getAllItem().then(
      data => { 
        let objects = <any[]>data;
        let items = objects.filter(res=>!!res["panel_code"] && res["panel_code"]== this.formPanel.value.panel_code && res["last"] == true)
        items.forEach(value=>{
          console.log("setting to false",value)
          value["last"] = false
          this.storage.setItem("irf",value)
        })
        setTimeout(() => {},500);
        this.actualSave()

      },
      error => console.error(error)
    )
  }


  isDataValid(value){
    if(value.fw_result==""){
      this.showToast("FW Result shout not be blank")
      return false
    }
    else if(value.fw_type==""){
      this.showToast("FW Type should not be blank")
      return false
    }else{
      return true
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
