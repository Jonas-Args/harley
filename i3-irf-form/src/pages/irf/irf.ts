import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SMS } from '@ionic-native/sms';
import { StorageService } from '../../app/services/util/storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, Platform, NavParams } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';
import { File } from '@ionic-native/file';
import { Toast } from '@ionic-native/toast';
import { HttpClient } from '@angular/common/http';
import { FilePath } from '@ionic-native/file-path';
import { HttpService } from '../../app/services/util/http.service';
import { Base64 } from '@ionic-native/base64';
import { Network } from '@ionic-native/network';

declare var AdvancedGeolocation:any;
declare let window: any; 
export class State {
  constructor(public name: string, public population: string, public flag: string) { }
}

@Component({
  templateUrl: 'irf.html'
})
export class irfPage implements OnInit  {

  // url = "http://10.0.2.2:3000"
  url = "http://api.uniserve.ph"
  formPanel: FormGroup;
  isBarcodeScanned = false;
  location;
  tagPanelObj;
  showBranchName=false;
  csvItems : any;
  barangayItems : any;
  selectedZip;

  barangays;
  barangayOptions;
  provinces;
  provincesOptions;

  zipcodes;
  zipcodesOptions;

  cities;
  cityOptions;

  regions;

  selectedBarangay;
  selectedProvince;
  itemDesc="";
  provinceDesc="";
  cityDesc="";
  zipDesc="";

  irfId;

  uploading = false

  private win: any = window;
  
  currentImage: any;
  currentImagePath: any;
  currentImagePathNative: any;
  proofOfBillingImagePath: any;
  proofOfBillingImagePathNative: any;
  validIdImagePath: any;
  validIdImagePathNative: any;

  requestObj:any = {}

  STORAGE_KEY = 'my_images';

  disableTakePicture = false;

  connectedToNet = false;

  constructor(
    private barcodeScanner: BarcodeScanner,
    private sms: SMS,
    private storage: StorageService,
    private fb: FormBuilder,
    private toast: Toast,
    private nativeStorage: NativeStorage ,
    public camera: Camera, 
    private file: File,
    public navCtrl: NavController,
    private platform: Platform,
    public http   :HttpClient,
    private navParams: NavParams,
    private filePath: FilePath,
    private httpService: HttpService,
    private base64: Base64,
    private network: Network
    ) {
      this.formPanel = fb.group({
        loc_accuracy: ['', [Validators.required]],
        gps_location: ['', [Validators.required]],
        panel_code: ['', [Validators.required]],
        panel_name: ['', [Validators.required]],
        gate_num: ['', [Validators.required]],
        house_num: ['', [Validators.required]],
        condo_name: ['', [Validators.required]],
        subdivision_name: ['', [Validators.required]],
        street_name: ['', [Validators.required]],
        barangay_name: ['', [Validators.required]],
        zip_code: ['', [Validators.required]],
        municipality: ['', [Validators.required]],
        province: ['', [Validators.required]],
        region: ['', [Validators.required]],
        landmark: ['', [Validators.required]],
        best_sched_day: ['', [Validators.required]],
        best_sched_time: ['', [Validators.required]],
        pref_delivery: ['', [Validators.required]],
        other_address: ['', [Validators.required]],
        home_tel_num1: ['', [Validators.required]],
        home_tel_num2: ['', [Validators.required]],
        mobile_num_1: ['', [Validators.required,Validators.pattern('^(09|\\+639)\\d{9}$')]],
        mobile_num_2: ['', [Validators.required,Validators.pattern('^(09|\\+639)\\d{9}$')]],
        email_add: ['', [Validators.required,Validators.pattern('\\S+@\\S+\\.\\S+')]],
        proof_of_billing: ['', [Validators.required]],
        valid_id: ['', [Validators.required]],
        image_path: ['', [Validators.required]],
        item_code: ['', [Validators.required]],
        item_desc: ['', [Validators.required]],
        points_req: ['', [Validators.required]],
        remarks: ['', [Validators.required]]
      });

      this.formPanel.controls['other_address'].disable();
      // add field here
      this.formPanel.get('zip_code').valueChanges
      .debounceTime(800)
       // only emit if value is different from previous value
      .subscribe(value=>{
        this.zipcodes = JSON.parse(JSON.stringify(this.csvItems.filter(res=>res["zip_code"].includes(value))))
        this.zipcodesOptions = this.zipcodes.slice(0,5)
      })

      this.formPanel.get('province').valueChanges
      .debounceTime(800)
      .subscribe(value=>{
        console.log("brgy"+this.barangayItems[0]["province"])
        console.log("value"+value)
        this.provinces = Array.from(new Set(this.barangayItems.filter(res=>res["province"].toLowerCase().includes(value.toLowerCase())).map(s=>s.province)))
        this.provincesOptions = this.provinces.slice(0,5)
        console.log(this.provincesOptions)
      })

      this.formPanel.get('municipality').valueChanges
      .debounceTime(800)
      .subscribe(value=>{

        let provinceValue = this.formPanel.get('province').value
        if(!!provinceValue && provinceValue != ''){
          this.cities = Array.from(new Set(this.barangayItems.filter(res=>res["city"].toLowerCase().includes(value.toLowerCase()) && provinceValue.toLowerCase()==res["province"].toLowerCase()).map(s=>s.city)))
        }else{
          this.cities = Array.from(new Set(this.barangayItems.filter(res=>res["city"].toLowerCase().includes(value.toLowerCase())).map(s=>s.city)))
        }
        this.cityOptions = this.cities.slice(0,5)
        console.log("cities",this.cities)
      })

      this.formPanel.get('barangay_name').valueChanges
      .debounceTime(800)
      .subscribe(value=>{
        let cityValue = this.formPanel.get('municipality').value
        if(!!cityValue && cityValue != ''){
          this.barangays = this.barangayItems.filter(res=>res["name"].toLowerCase().includes(value.toLowerCase()) && cityValue.toLowerCase()==res["city"].toLowerCase())
        }else{
          this.barangays = this.barangayItems.filter(res=>res["name"].toLowerCase().includes(value.toLowerCase()))
        }
        this.barangayOptions = this.barangays.slice(0,5)
        console.log(this.cities)
      })

      this.formPanel.get('pref_delivery').valueChanges.subscribe(value=>{
          if(value=="Others"){
            console.log("enabled")
            this.formPanel.controls['other_address'].enable();
          }else{
            console.log("disabled")
            this.formPanel.controls['other_address'].disable();
          }
        })
     }


     watchNetwork(){
      this.network.onDisconnect().subscribe(() => {
        this.showToast("Disconnected from network")
        console.log('network disconnected!');
        this.connectedToNet = false
      });

      this.network.onConnect().subscribe(() => {
        console.log('network connected!');
        // We just got a connection but we need to wait briefly
         // before we determine the connection type. Might need to wait.
        // prior to doing any api requests as well.
        setTimeout(() => {
          this.showToast("Connected to network")
          this.connectedToNet = true
        }, 1000);
      });
     }

     ngOnInit() {
      let irfId  = this.navParams.get('Id') || "";
      let panel_code = this.navParams.get('panel_code') || "";
      console.log(this.navParams.get('panel_code'))
      if(!!irfId){
        this.storage.getItem(irfId).then(
          data=>{ this.requestObj = data 
            this.currentImagePath = this.getTrustImg(this.requestObj["image_path"])
            this.proofOfBillingImagePath = this.getTrustImg(this.requestObj["proof_of_billing"])
            this.validIdImagePath = this.getTrustImg(this.requestObj["valid_id"])
            this.currentImagePathNative = this.requestObj["image_path_native"]
            this.proofOfBillingImagePathNative = this.requestObj["proof_of_billing_native"]
            this.validIdImagePathNative= this.requestObj["valid_id_native"]
            console.log("data is", data)
          this.formPanel.patchValue(data,{emitEvent: false})

          if(this.formPanel.value["pref_delivery"] == "Others"){
            this.formPanel.controls['other_address'].enable();
          }else{
            this.formPanel.controls['other_address'].disable();
          }
        },
          error => console.error(error))
      }else{
        this.start()
      }

      if(!!panel_code){
        this.formPanel.get("panel_code").setValue(panel_code)
      }
      
    }     

      sendSMS(){
        
        // this.showToast("sending"+this.formatMessage())

        console.log("sending",this.formatMessage())
       this.sms.send('09225676797', this.formatMessage()).then(
        () => {
          this.saveRequest(this.formPanel.value)
          console.log("message sent")
        } ,
        error => console.error('Error removing item', error)
        );
      }
    
      formatMessage(){
        let formValue = this.formPanel.value
        let message = "IAF;"+
                       `${formValue.panel_code||""};` +
                       `${formValue.panel_name||""};` + 
                       `${formValue.gate_num||""};` +
                       `${formValue.house_num||""};` +
                       `${formValue.condo_name||""};` +
                       `${formValue.subdivision_name||""};` +
                       `${formValue.street_name||""};` +
                       `${formValue.barangay_name||""};` +
                       `${formValue.zip_code||""};` + 
                       `${formValue.municipality||""};` +
                       `${formValue.province||""};` +
                       `${formValue.region||""};` +
                       `${formValue.landmark||""};` +
                       `${formValue.best_sched_day||""};` +
                       `${formValue.best_sched_time||""};` + 
                       `${formValue.pref_delivery||""};` +
                       `${formValue.other_address||""};` +
                       `${formValue.home_tel_num1||""};` +
                       `${formValue.home_tel_num2||""};` +
                       `${formValue.mobile_num_1||""};` +
                       `${formValue.mobile_num_2||""};` +
                       `${formValue.email_add||""};` +
                       `${formValue.item_code||""};` +
                       `${formValue.item_desc||""};` +
                       `${formValue.points_req||""};` +
                       `${formValue.remarks||""};` +
                       `${formValue.loc_accuracy||""};` +
                       `${formValue.gps_location||""};`
    
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
    
    
      showToast(message){
        message = message || "null"
        this.toast.show(message, '5000', 'top').subscribe(
          toast => {
            console.log(toast);
          }
        );
        
      }
    
      ionViewDidEnter()
      {
        this.platform.ready().then(() => {
          if(this.network.type != "none"){
            this.connectedToNet = true
          }else{
            this.connectedToNet = false
          }
          this.watchNetwork()
          })
        this.loadCSV();
      }
    
    
      loadCSV()
      {
        this.http.get('/assets/data/zip.csv')
        .subscribe((data)=>
        {
        },(error)=>{
            let arrayResult         = this.parseCSVFile(error.error.text);
            this.csvItems  = this.formatParsedObject(arrayResult, true);
            // console.log(this.csvItems )
        });
    
        this.http.get('/assets/data/barangay.csv')
        .subscribe((data)=>
        {
        },(error)=>{
            let arrayResult         = this.parseCSVFile(error.error.text);
            this.barangayItems  = this.formatParsedBarangay(arrayResult, true);
            this.regions = Array.from(new Set(this.barangayItems.map(s=>s.region)))
            this.provinces = Array.from(new Set(this.csvItems.map(s=>s.major_area)))
            // console.log(this.regions )
            // console.log(this.barangayItems )
        });
    
      }
    
      parseCSVFile(str)
    {
       var arr  = [],
           obj  = [],
           row,
           col,
           c,
           quote   = false;  // true means we're inside a quoted field
    
       // iterate over each character, keep track of current row and column (of the returned array)
       for (row = col = c = 0; c < str.length; c++)
       {
          var cc = str[c],
              nc = str[c+1];        // current character, next character
    
          arr[row]           = arr[row] || [];
          arr[row][col]  = arr[row][col] || '';
    
          /* If the current character is a quotation mark, and we're inside a
        quoted field, and the next character is also a quotation mark,
        add a quotation mark to the current column and skip the next character
          */
          if (cc == '"' && quote && nc == '"')
          {
             arr[row][col] += cc;
             ++c;
             continue;
          }
    
    
          // If it's just one quotation mark, begin/end quoted field
          if (cc == '"')
          {
             quote = !quote;
             continue;
          }
    
    
          // If it's a comma and we're not in a quoted field, move on to the next column
          if (cc == ',' && !quote)
          {
             ++col;
             continue;
          }
    
    
          /* If it's a newline and we're not in a quoted field, move on to the next
             row and move to column 0 of that new row */
          if (cc == '\n' && !quote)
          {
             ++row;
             col = 0;
             continue;
          }
    
          // Otherwise, append the current character to the current column
          arr[row][col] += cc;
       }
    
       return arr;
    }
    
    formatParsedObject(arr, hasTitles)
    {
       let major_area,
           zip_code,
           city,
           obj = [];
    
       for(var j = 0; j < arr.length; j++)
       {
          var items         = arr[j];
    
          if(items.indexOf("") === -1)
          {
             if(hasTitles === true && j === 0)
             {
                major_area    = items[0];
                zip_code         = items[1];
                city         = items[2];
             }
             else
             {
                obj.push({
                   major_area   : items[0],
                   zip_code       : items[1],
                   city       : items[2]
                });
             }
          }
       }
       return obj;
    }
    
    formatParsedBarangay(arr, hasTitles)
    {
       let name,
           city,
           region,
           province,
           obj = [];
    
       for(var j = 0; j < arr.length; j++)
       {
          var items         = arr[j];
    
          if(items.indexOf("") === -1)
          {
             if(hasTitles === true && j === 0)
             {
                name    = items[0];
                city         = items[1];
                province         = items[2];
                region         = items[3];
             }
             else
             {
                obj.push({
                   name   : items[0],
                   city       : items[1],
                   province       : items[2],
                   region       : items[3],
                });
             }
          }
       }
       return obj;
    }
    
    save(id, value){
      this.nativeStorage.setItem(id, value)
      .then(
        () => {
          console.log('Stored item!')
        },
        error => console.error('Error storing item', error)
      );
    }
    
    saveRequest(value){
        this.saveImage(value)
        this.navCtrl.pop()
        // this.router.navigate([`/`])
    }

    saveImage(value){
      value["image_path"] = this.currentImagePath
      value["proof_of_billing"] = this.proofOfBillingImagePath
      value["valid_id"] = this.validIdImagePath

      value["image_path_native"] = this.currentImagePathNative
      value["proof_of_billing_native"] = this.proofOfBillingImagePathNative
      value["valid_id_native"] = this.validIdImagePathNative
      
      if(!!this.requestObj && !!this.requestObj.Id){
        value = Object.assign(this.requestObj,value)
      }
      this.storage.setItem("request",value)

    }
    
      selectBarangay(value){
        this.formPanel.get('barangay_name').setValue(value.name, {emitEvent: false})
        this.selectedBarangay = this.barangays.filter(res=>res["name"].toLowerCase()==value.name.toLowerCase())[0]
        if(!!this.selectedBarangay["region"]){
          this.formPanel.get("region").setValue(this.selectedBarangay["region"],{emitEvent: false})
        }
        this.barangayOptions = []
      }
    
      selectCity(value){
        this.formPanel.get('municipality').setValue(value, {emitEvent: false})

        this.cityOptions = []
        let city = this.barangayItems.filter(res=>res["city"].toLowerCase() == value.toLowerCase())[0]
            
        if(!!city["city"]){
          this.barangays = this.barangayItems.filter(res=>res["city"].toLowerCase()==city["city"].toLowerCase())
          if(this.formPanel.get("province").value == ""){
            this.formPanel.get("province").setValue(city["province"],{emitEvent: false})
          }
    
          if(this.formPanel.get("region").value == ""){
            this.formPanel.get("region").setValue(city["region"],{emitEvent: false})
          }
        }

      }
    
      selectZipCode(value){
        this.formPanel.get('zip_code').setValue(value.zip_code, {emitEvent: false})
        this.zipcodesOptions = []
      }
    
      takePicture(type, sourceType: PictureSourceType = this.camera.PictureSourceType.CAMERA) {
        const options: CameraOptions = {
          quality: 100,
          destinationType: this.camera.DestinationType.FILE_URI,
          encodingType: this.camera.EncodingType.JPEG,
          mediaType: this.camera.MediaType.PICTURE
        }
        this.camera.getPicture(options).then((imageData) => {
          this.filePath.resolveNativePath(imageData)
          .then((path) => {
            debugger
              console.log(imageData, path);
              let imagePath = path.substr(0, path.lastIndexOf("/") + 1);
              let imageName = path.substring(path.lastIndexOf("/") + 1, path.length);

              if(this.platform.is('android')) {
                this.file.checkDir(this.file.externalRootDirectory, 'irfentry').then(response => {
                  console.log('Directory exists'+response);
                  this.moveToFile(imagePath,imageName,type)
                }).catch(err => {
                  console.log('Directory doesn\'t exist'+JSON.stringify(err));
                  this.file.createDir(this.file.externalRootDirectory, 'irfentry', false).then(response => {
                    console.log('Directory create'+response);
                    this.moveToFile(imagePath,imageName,type)
                  }).catch(err => {
                    console.log('Directory no create'+JSON.stringify(err));
                  }); 
                });
              }


          })
          .catch((err) => {
            debugger
              console.error(err);
          })
      }).catch((err) => {
        debugger
          console.error(err);
      });
    }

    moveToFile(imagePath,imageName,type){
      let panel_code = this.formPanel.get("panel_code").value
      this.file.moveFile(imagePath, imageName, this.file.externalRootDirectory + "irfentry/", panel_code+"_"+type)
      .then(newFile => {
        switch(type){
          case 'POB':
              this.proofOfBillingImagePath = this.getTrustImg(newFile.nativeURL)
              this.proofOfBillingImagePathNative = newFile.nativeURL
            break;
          case 'ID':
              this.validIdImagePath = this.getTrustImg(newFile.nativeURL)
              this.validIdImagePathNative = newFile.nativeURL
            break;
          default:
              this.currentImagePath = this.getTrustImg(newFile.nativeURL)
              this.currentImagePathNative = newFile.nativeURL
        }
        if(!!this.requestObj.Id){
          this.saveImage(this.formPanel.value)
        }

          console.log(newFile);
      })
      .catch(err => {
        debugger
          console.error(err);
      })
    }
        
    
      getTrustImg(imageSrc){
        let path = this.win.Ionic.WebView.convertFileSrc(imageSrc);
        console.log(path);
        return path;
        }
    
      copyFileToLocalDir(namePath, currentName, newFileName) {
        this.file.copyFile(namePath, currentName, this.file.externalApplicationStorageDirectory, newFileName).then(success => {
          this.currentImage = success.nativeURL
        }, error => {
            debugger
        });
    }
    
      createFileName() {
        var d = new Date(),
            n = d.getTime(),
            newFileName = n + ".jpg";
        return newFileName;
      }

      selectZip(value){
        this.formPanel.get('zip_code').setValue(value.zip_code, {emitEvent: false})
        this.zipcodesOptions = []
      }

      selectProvince(value){
        this.formPanel.get('province').setValue(value, {emitEvent: false})
        let provinceValue = this.formPanel.get('province').value
        console.log("cities now", this.cities)
        this.provincesOptions = []

        this.selectedProvince = this.barangayItems.filter(res=>res["province"].toLowerCase()==provinceValue.toLowerCase())[0]
    
        this.cities = Array.from(new Set(this.barangayItems.filter(res=>res["province"].toLowerCase()==provinceValue.toLowerCase()).map(s=>s.city)))

        console.log("cities",this.cities)
        if(this.formPanel.get("region").value == "" && !!this.selectedProvince["region"]){
          this.formPanel.get("region").setValue(this.selectedProvince["region"],{emitEvent: false})
        }

      }
    
      start(){
      
        AdvancedGeolocation.start((success)=>{
    
            try{
              let jsonObject: any = JSON.parse(success);
    
              if(!!jsonObject.latitude){
                this.location = jsonObject
                
                this.formPanel.get('gps_location').setValue(`${this.location.latitude}, ${this.location.longitude}`)
                this.formPanel.get('loc_accuracy').setValue(`${parseFloat(this.location.accuracy.toFixed(2))} meters`)
              }else{
                // this.showToast("lat long not available")
              }
              
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
            // this.showToast(JSON.stringify(error))
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
            "providers":"all",     // Return GPS, NETWORK and CELL locations
            "useCache":true,       // Return GPS and NETWORK cached locations
            "satelliteData":true, // Return of GPS satellite info
            "buffer":true,        // Buffer location data
            "bufferSize":3,         // Max elements in buffer
            "signalStrength":false // Return cell signal strength data
          });
      }
 
      sync(){
        this.uploading = true
        this.httpService.post(this.url+"/irf_forms",this.formPanel.value,false).timeout(5000).subscribe(data => {
          debugger
            if(data["success"]==true){
              let value = this.formPanel.value
              value["stored"] = true
              value["id"] = data["id"]
              if(!!this.requestObj && !!this.requestObj.Id){
                value = Object.assign(this.requestObj,value)
              }
              this.requestObj["stored"] = true
              this.requestObj["id"] = value["id"]
              this.storage.setItem("request",value)
              this.uploading = false
              this.showToast("Data Uploaded")
            }
          }, err => {
            debugger
            this.uploading = false
            this.showToast("Something went wrong")
            console.log(err);
          });
      }

      upload(type,filePath){
        let fileName = filePath.split('/').pop();
        let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);

        this.file.readAsDataURL(path, fileName)
        .then(base64File => {
          let value = {}
          switch(type){
            case 'POB':
                value["pob_image"] = base64File
              break;
            case 'ID':
                value["validId_image"] = base64File
              break;
            default:
                value["qnr_image"] = base64File
          }
          this.uploadPhoto(value, type)
            console.log("here is encoded image ", base64File)
        })
        .catch(() => {
            console.log('Error reading file');
        })
      }
      
      uploadPhoto(value,type){
        this.uploading = true
        this.httpService.patch(this.url+"/irf_forms/"+this.requestObj['id']+"/upload",value,false).timeout(5000).subscribe(data => {
          value[type+"stored"] = true
          this.requestObj[type+"stored"] = true
          if(!!this.requestObj && !!this.requestObj.Id){
            value = Object.assign(this.requestObj,value)
          }
          this.storage.setItem("request",value)
          this.uploading = false
          this.showToast("Image Uploaded")
        }, err => {
          debugger
          this.uploading = false
          this.showToast("Something went wrong")
          console.log(err);
        });
      }
}

