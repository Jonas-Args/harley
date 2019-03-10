import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { SMS } from '@ionic-native/sms/ngx';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Toast } from '@ionic-native/toast/ngx';
import { StorageService } from '../../services/util/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { bindingUpdated } from '@angular/core/src/render3/instructions';
import { Platform } from '@ionic/angular';

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
    private platform: Platform
    ) {
      this.initForm()
     }

    ngOnInit() {
      this.get_last_saved()
    }

    save_last_saved(){
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
      });
      this.formPanel.valueChanges.subscribe(value => {
        this.save_last_saved()
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
    this.router.navigate([`/tagpanel`], {queryParams: {irfId: this.storage.itemId}})
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
            this.router.navigate([`/tagpanel`], {queryParams: {irfId:  foundData.Id}})
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

}


