import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SMS } from '@ionic-native/sms';
import { StorageService } from '../../app/services/util/storage.service';
import { Toast } from '@ionic-native/toast';
import { NativeStorage } from '@ionic-native/native-storage';
import { irfPage } from '../irf/irf.page';
import { NavController, NavParams } from 'ionic-angular';
import { RetrieveilFormPage } from '../retrieval-form/retrieval-form.page';
import { SqliteService } from '../../app/services/util/sqlite.service';
import { Platform } from 'ionic-angular';
declare var AdvancedGeolocation:any;

@Component({
  selector: 'app-tagpanel',
  templateUrl: './tagpanel.page.html'
})
export class tagpanelPage implements OnInit {

  formPanel: FormGroup;
  isBarcodeScanned = false;
  location;
  tagPanelObj;
  showZeroRemarks = false;
  irfId;
  irfObj;
  date_send;
  
  constructor(
    private barcodeScanner: BarcodeScanner,
    private sms: SMS,
    private storage: StorageService,
    private fb: FormBuilder,
    private toast: Toast,
    public navCtrl: NavController,
    private nativeStorage: NativeStorage,
    private navParams: NavParams,
    private sqliteService : SqliteService,
    private plt: Platform) {
      this.formPanel = fb.group({
        Id: ['', [Validators.required]],
        panel_code: ['', [Validators.required]],
        panel_name: ['', [Validators.required]],
        panel_status: ['', [Validators.required]],
        gps_location: ['', [Validators.required]],
        accuracy: ['', [Validators.required]],
        panel_remarks: [''],
        panel_receipted: [''],
        fi_name: [''],
        region: [''],
        week_code: ['']
      });

       // add field here
       this.formPanel.get('panel_status').valueChanges.subscribe(value=>{
        if(value=="ZERO"){
          this.showZeroRemarks = true
        }else{
          this.showZeroRemarks = false
        }
      })
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

      this.plt.ready().then((readySource) => {
        this.irfId  = this.navParams.get('irfId') || "";
        if(!!this.irfId){
          console.log("irfId", this.irfId)
          this.sqliteService.find(this.irfId)
          .then(
            (data:any) => {
              this.irfObj = data.rows.item(0);
              console.log("found item",this.irfObj)
              // this.start()
              this.formPanel.patchValue(this.irfObj)
            },
            error => console.error('Error storing item', error)
          );
        }
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
    if(this.isDataValid(this.formPanel.value)){
      this.showToast("sending"+this.formatMessage())
      console.log("sending",this.formatMessage())
      this.date_send = new Date().toLocaleString()
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
    let message = "TAG;"+`${formValue.panel_code||""};`+
                   `${formValue.panel_name||""};` +
                   `${formValue.week_code||""};` +
                   `${formValue.finame||""};` +
                   `${formValue.region||""};` + 
                   `${formValue.gps_location||""};` +
                   `${formValue.accuracy||""};` +
                   `${formValue.panel_status||""};` +
                   `${formValue.panel_remarks||""};` +
                   `${formValue.panel_receipted||""};` +
                   `${this.date_send}`
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
    value.rowId = this.irfId
    value = Object.assign(this.irfObj,value)
    console.log("editing data",value)
    this.sqliteService.editData(value).then(
      (data:any) => {
        console.log("retrieved new data",data)
      },
      error => console.error('Error storing item', error)
    );
  }

  actualSave(){
    let value = this.formPanel.value
    if(this.isDataValid(value)){
      value["date_send"] = this.date_send
      value["last"] = true
      if(!!this.irfObj && !!this.irfObj.Id){
        
      }
      console.log("storing a",value)
      this.storage.setItem("irf",value)
      this.navCtrl.push(RetrieveilFormPage, {});
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
    if(value.panel_status=="ZERO" && value.panel_remarks==""){
      this.showToast("Zero Remarks shout not be blank")
      return false
    }
    else if(value.panel_status==""){
      this.showToast("Status should not be blank")
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
