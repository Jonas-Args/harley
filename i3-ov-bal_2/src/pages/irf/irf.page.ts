import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SMS } from '@ionic-native/sms';
import { StorageService } from '../../app/services/util/storage.service';
import { Toast } from '@ionic-native/toast';
import { NativeStorage } from '@ionic-native/native-storage';
import { Platform, NavController } from 'ionic-angular';
import { tagpanelPage } from '../tagpanel/tagpanel.page';

declare var AdvancedGeolocation:any;

@Component({
  selector: 'app-irf',
  templateUrl: './irf.page.html'
})
export class irfPage implements OnInit {

  formPanel: FormGroup;
  isBarcodeScanned = false;
  location;
  irfObj;
  showBranchName=false;
  irdId;
  requests;
  list:any;
  
  constructor(
    private barcodeScanner: BarcodeScanner,
    private sms: SMS,
    private storage: StorageService,
    private fb: FormBuilder,
    private toast: Toast,
    private nativeStorage: NativeStorage,
    private platform: Platform,
    public navCtrl: NavController,
    ) {
      this.initForm()
     }

    ngOnInit() {
      this.get_last_saved()
    }

    ionViewDidEnter () {
      this.getAllItems()
     }

    save_last_saved(){
      console.log("saving",this.formPanel.value)
      this.nativeStorage.setItem("last_saved", this.formPanel.value)
      .then(
        () => {
          console.log('Stored last item!')
        },
        error => console.error('Error storing item', error)
      );
    }

    initForm(){
      this.formPanel = this.fb.group({
        proj_type: ['', [Validators.required]],
        region: ['', [Validators.required]],
        year: [new Date().getFullYear(), [Validators.required]],
        period: ['', [Validators.required]],
        week: ['', [Validators.required]],
        gl_name: ['', [Validators.required]],
        fi_name: ['', [Validators.required]],
        panel_code: ['', [Validators.required]],
        week_code: ['', [Validators.required]]
      });
      this.formPanel.valueChanges.subscribe(value => {
        this.save_last_saved()
        let weekcode = this.formPanel.value['year']+'.'+this.formPanel.value['period']+'.'+this.formPanel.value['week']
        console.log("weekcode",weekcode)
        this.formPanel.get('week_code').setValue(weekcode,{emitEvent: false})
      });
      this.formPanel.get('panel_code').valueChanges.subscribe(value => {
        this.findByPanelCode(value)
      });
    }

    get_last_saved(){
      this.nativeStorage.getItem("last_saved")
      .then(
        (data) => {
          console.log("retrieved last item",data)
          if(!!data){
            this.formPanel.patchValue(data)
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
    }else if(value.proj_type == ""){
      this.showToast("Project type should not be blank")
    }else if(value.period == ""){
      this.showToast("Period should not be blank")
    }else{
      let panelcode = this.formPanel.value["panel_code"]
      let weekcode = this.formPanel.value["week_code"]
      let id = "irf"+panelcode + value["week"] + value["period"]
      //find by panel_code week_code name
  
      this.storage.getItem(id).then(
        data=>{ 
          console.log("retrieved",data)
          let foundData:any = data
          if(!!foundData.Id){
            this.navCtrl.push(tagpanelPage, {
              irfId: foundData.Id
            });
          }else{
            this.findName(panelcode)
          }
      },
        error => {
        }
      )
    }
  }

  clear(){
    this.initForm()
  }

  findByPanelCode(panelcode){
    this.storage.getAllItem().then(
      data => { 
        let objects = <any[]>data;
        console.log("objects",objects)
        let item = objects.filter(res=>!!res["panel_code"] && res["panel_code"]== panelcode && res["last"]== true)

        console.log("last item",item)
        if(item.length > 0){

          //with name
          if(!!item[0]["panel_code"]){
            let object = {proj_type:item[0]["proj_type"],region:item[0]["region"],panel_name:item[0]["panel_name"] }
            this.formPanel.patchValue(object,{emitEvent: false, onlySelf: true})
          }
        }
      },
      error => console.error(error)
    )
  }

  findName(panelcode){
    this.storage.getAllItem().then(
      data => { 
        let objects = <any[]>data;
        console.log("objects",objects)
        let item = objects.filter(res=>!!res["panel_code"] && res["panel_code"]== panelcode && res["last"]== true)

        console.log("last item",item)
        if(item.length > 0){

          //with name
          if(!!item[0]["panel_code"]){
            let object = Object.assign({proj_type:item[0]["proj_type"],region:item[0]["region"],panel_name:item[0]["panel_name"] },this.formPanel.value)
            this.save(object)
          }else{
            this.save(this.formPanel.value)
          }
          
        }else{
          //wala
          this.save(this.formPanel.value)
        }
      },
      error => console.error(error)
    )
  }

  showToast(message){
    message = message || "null"
    this.toast.show(message, '5000', 'top').subscribe(
      toast => {
        console.log(toast);
      }
    );
  }

  getAllItems(){
    this.storage.getAllItem().then(
      data => { 
        let objects = <any[]>data;
        console.log("objects",objects)
        this.list = objects.filter(res=>!!res["Id"] && res["Id"].includes('irf'))
        console.log("list",this.list)
      },
      error => console.error(error)
    )
  }

  removeRequest(key){
    this.storage.removeItem(key).then(
      data => { 
        this.getAllItems()
      },
      error => console.error(error)
    )
  }

  moveToIrf(row:any){
    if(!!row){
      this.navCtrl.push(tagpanelPage, {
        irfId: row.Id
      });
    }else{
      this.navCtrl.push(tagpanelPage, {});
    }
  }

}


