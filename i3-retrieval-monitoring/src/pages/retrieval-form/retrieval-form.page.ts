import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SMS } from '@ionic-native/sms';
import { StorageService } from '../../app/services/util/storage.service';
import { Toast } from '@ionic-native/toast';
import { NativeStorage } from '@ionic-native/native-storage';
import { NavController, NavParams } from 'ionic-angular';
import { tagpanelPage } from '../tagpanel/tagpanel.page';
import { SqliteService } from '../../app/services/util/sqlite.service';
import { Irf } from '../../model/irf';

declare var AdvancedGeolocation:any;

@Component({
  selector: 'app-retrieval-form',
  templateUrl: './retrieval-form.page.html'
})
export class RetrieveilFormPage implements OnInit{

  formPanel: FormGroup;
  isBarcodeScanned = false;
  location;
  irfObj;
  showBranchName=false;
  lastData;
  irdId;
  requests;

  csvData: any[] = [];
  headerRow: any[] = [];

  constructor(
    private barcodeScanner: BarcodeScanner,
    private sms: SMS,
    private storage: StorageService,
    private fb: FormBuilder,
    private toast: Toast,
    private nativeStorage: NativeStorage,
    public navCtrl: NavController,
    private sqliteService : SqliteService
    ) {
      this.initForm()
     }

    ngOnInit() {
      // this.sqliteService.dropTable()

      this.sqliteService.createTable().then(
        (data:any) => {
          this.sqliteService.getAllData().then(
            (data:any) => {
              let result = []
              for (let i = 0; i < data.rows.length; i++) {
                let item = data.rows.item(i);
                // do something with it
                result.push(item);
                console.log("item", item)
              }
             console.log("all data", result)
            },
            error => console.error('Error storing item', error)
          );

          this.get_last_saved();
        },
        error => console.error('Error storing item', error)
      );
    }

    handleError(err) {
        console.log('something went wrong: ', err);
    }

    save_last_saved(){
      if(!!this.lastData){
        let last_data = new Irf(Object.assign(this.lastData,this.formPanel.value))
        console.log("with last data", last_data)
        this.sqliteService.editData(last_data).then(
          (data:any) => {
            console.log("retrieved new data",data)
            this.get_last_saved();
          },
          error => console.error('Error storing item', error)
        );
      }else{
        console.log("hello",this.lastData)
        let last_data = new Irf(this.formPanel.value)
        console.log("null last data")
        last_data.last = 1;
       
        this.sqliteService.addData(last_data).then(
          (data:any) => {
            console.log("retrieved last data",data)
            this.get_last_saved();
          },
          error => console.error('Error storing item', error)
        );
      }
  
    }

    initForm(){
      this.formPanel = this.fb.group({
        period: ['', [Validators.required]],
        week: ['', [Validators.required]],
        week_code: ['', [Validators.required]],
        date_retrieved: [new Date().toLocaleString().split(',')[0], [Validators.required]],
        panel_code: ['', [Validators.required]],
      });

      // add field here
      this.formPanel.get('period').valueChanges.subscribe(value=>{
        this.formPanel.get('week_code').setValue(
          value + "." + this.formPanel.value["week"]
          )
      })
      this.formPanel.get('week').valueChanges.subscribe(value=>{
        if(!!value){
          this.formPanel.get('week_code').setValue(
            this.formPanel.value["period"] + "." + value
            )
        }
      })
      this.formPanel.valueChanges.subscribe(value=>{
        console.log("values",this.formPanel.value)
        this.save_last_saved()
      })
    }

    get_last_saved(){
      this.sqliteService.getLastData().then(
        (data:any) => {
          if(data.rows.length == 0){
            console.log("retrieved no last item")
            this.lastData = null
          }else{
            this.lastData = data.rows.item(0)
            this.formPanel.patchValue(this.lastData, {emitEvent:false})
            
            this.formPanel.get('week_code').setValue(
              this.formPanel.value["period"] + "." + this.formPanel.value["week"],{emitEvent:false}
            )
            console.log("retrieved last item",this.lastData)
          }
          
        },
        error => console.error('Error storing item', error)
      );
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



  formatDate(date){
    // mm/dd/yy format
      let d = date.getDate();
      let m = date.getMonth() + 1; //Month from 0 to 11
      let y = date.getFullYear();
      return '' + (m<=9 ? '0' + m : m) + '/' + (d <= 9 ? '0' + d : d) + '/'+y;
  }


  save(value){

    this.storage.setItem("irf",value)
    this.navCtrl.push(tagpanelPage, {
      irfId: this.storage.itemId
    });
  }

  search(value){
    if(value.week == ""){
      this.showToast("Week should not be blank")
    }else{
      this.sqliteService.search(this.formPanel.value).then(
        (data:any) => {
          console.log("data is",data)
          if(!!data.rows.item(0)){
            console.log("found data", data.rows.item(0))
            this.navCtrl.push(tagpanelPage, {
              irfId: data.rows.item(0).rowId
            });
          }else{
            this.formPanel.value.last = 0
           this.sqliteService.addData(this.formPanel.value).then(
            (data:any) => {
              this.search(this.formPanel.value)
              // console.log("new data", data.rows.item(0))
            });
          }
        },
        error => console.error('Error storing item', error)
      );
    }
  }

  clear(){
    this.initForm()
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