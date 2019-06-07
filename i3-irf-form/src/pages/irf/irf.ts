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

declare var AdvancedGeolocation:any;
declare let window: any; 
export class State {
  constructor(public name: string, public population: string, public flag: string) { }
}

@Component({
  templateUrl: 'irf.html'
})
export class irfPage implements OnInit  {

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

  private win: any = window;
  
  currentImage: any;
  currentImagePath: any;
  proofOfBillingImagePath: any;
  validIdImagePath: any;

  requestObj:any;

  STORAGE_KEY = 'my_images';

  disableTakePicture = true;

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
    private filePath: FilePath
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
      this.formPanel.get('panel_code').valueChanges
      .subscribe(value=>{
        if(!!value && value.length > 2){
          debugger
          this.disableTakePicture = false
        }else{
          this.disableTakePicture = true
        }
      })
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

      this.formPanel.controls['other_address'].disable();

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
            console.log("data is", data)
          this.formPanel.patchValue(data,{emitEvent: false})
        },
          error => console.error(error))
      }else{
        this.start()
      }

      if(!!panel_code){
        this.formPanel.get("panel_code").setValue(panel_code)
      }
      
    }

     public getPicture(type) {  
      let base64ImageData;  
      const options: CameraOptions = {  
          //here is the picture quality in range 0-100 default value 50. Optional field  
          quality: 100,  
          /**here is the format of an output file. 
           *destination type default is FILE_URI. 
           * DATA_URL: 0 (number) - base64-encoded string,  
           * FILE_URI: 1 (number)- Return image file URI, 
           * NATIVE_URI: 2 (number)- Return image native URI        
           */  
          destinationType: this.camera.DestinationType.DATA_URL,  
          /**here is the returned image file format 
           *default format is JPEG 
           * JPEG:0 (number), 
           * PNG:1 (number), 
           */  
          encodingType: this.camera.EncodingType.JPEG,  
          /** Only works when Picture Source Type is PHOTOLIBRARY or  SAVEDPHOTOALBUM.  
           *PICTURE: 0 allow selection of still pictures only. (DEFAULT) 
           *VIDEO: 1 allow selection of video only.        
           */  
          mediaType: this.camera.MediaType.PICTURE,  
          /**here set the source of the picture 
           *Default is CAMERA.  
           *PHOTOLIBRARY : 0,  
           *CAMERA : 1,  
           *SAVEDPHOTOALBUM : 2 
           */  
          sourceType: this.camera.PictureSourceType.CAMERA  
      }  
      this.camera.getPicture(options).then((imageData) => {  
              //here converting a normal image data to base64 image data.  
              base64ImageData = 'data:image/jpeg;base64,' + imageData;  
              /**here passing three arguments to method 
              *Base64 Data 

              *Folder Name 

              *File Name 
              */  
              this.writeFile(base64ImageData, "My Picture", type);  
          }, (error) => {  
              console.log(error);       
              });  
      }  
      //here is the method is used to write a file in storage  
      public writeFile(base64Data: any, folderName: string, fileName: any) {  
          let contentType = this.getContentType(base64Data);  
          let DataBlob = this.base64toBlob(base64Data, contentType);  
          // here iam mentioned this line this.file.externalRootDirectory is a native pre-defined file path storage. You can change a file path whatever pre-defined method.  
          let filePath = this.file.externalRootDirectory + folderName;  
          this.file.writeFile(filePath, fileName, DataBlob, contentType).then((success) => {  
              console.log("File Writed Successfully", success);  
          }).catch((err) => {  
              console.log("Error Occured While Writing File", err);  
          })  
      }  
      //here is the method is used to get content type of an bas64 data  
      public getContentType(base64Data: any) {  
          let block = base64Data.split(";");  
          let contentType = block[0].split(":")[1];  
          return contentType;  
      }  
      //here is the method is used to convert base64 data to blob data  
      public base64toBlob(b64Data, contentType) {  
          contentType = contentType || '';  
          let sliceSize = 512;  
          let byteCharacters = atob(b64Data.replace(/^[^,]+,/, ''));  
          let byteArrays = [];  
          for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {  
              let slice = byteCharacters.slice(offset, offset + sliceSize);  
              let byteNumbers = new Array(slice.length);  
              for (let i = 0; i < slice.length; i++) {  
                  byteNumbers[i] = slice.charCodeAt(i);  
              }  
              var byteArray = new Uint8Array(byteNumbers);  
              byteArrays.push(byteArray);  
          }  
          let blob = new Blob(byteArrays, {  
              type: contentType  
          });  
          return blob;  
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
                       `${formValue.loc_accuracy||""};` +
                       `${formValue.gps_location||""};` +
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
                       `${formValue.email_add||""};` +
                       `${formValue.item_desc||""};` +
                       `${formValue.points_req||""};` +
                       `${formValue.remarks||""};` +
                       `${formValue.proof_of_billing||""};` +
                       `${formValue.valid_id||""};` +
                       `${formValue.image_path||""};`
    
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
      value["image_path"] = this.currentImage
      value["proof_of_billing"] = this.proofOfBillingImagePath
      value["valid_id"] = this.validIdImagePath
        if(!!this.requestObj && !!this.requestObj.Id){
          value = Object.assign(this.requestObj,value)
        }
        this.storage.setItem("request",value)
        this.navCtrl.pop()
        // this.router.navigate([`/`])
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
            break;
          case 'ID':
              this.validIdImagePath = this.getTrustImg(newFile.nativeURL)
            break;
          default:
              this.currentImagePath = this.getTrustImg(newFile.nativeURL)
        }
        
          console.log(newFile);
      })
      .catch(err => {
        debugger
          console.error(err);
      })
    }
        
        // this.camera.getPicture(options).then((imageData) => {
        //  // imageData is either a base64 encoded string or a file URI
        //  // If it's base64 (DATA_URL):
        //  let base64Image = 'data:image/jpeg;base64,' + imageData;
        // }, (err) => {
        //  // Handle error
        // });
        // const options: CameraOptions = {
        //   quality: 100,
        //   sourceType: sourceType,
        //   mediaType: this.camera.MediaType.PICTURE,
        //   saveToPhotoAlbum: true
        // }
        //   this.platform.ready().then(() => {
        //       if(this.platform.is('cordova')){
        //         let camera = this.camera
        //         camera.getPicture(options).then((imagePath) => {
        //           this.currentImage = imagePath
        //           switch(type){
        //             case 'proof_of_billing':
        //                 this.proofOfBillingImagePath = this.getTrustImg(imagePath)
        //               break;
        //             case 'valid_id':
        //                 this.validIdImagePath = this.getTrustImg(imagePath)
        //               break;
        //             default:
        //                 this.currentImagePath = this.getTrustImg(imagePath)
        //           }
                 
        //           var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        //           var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        //           this.copyFileToLocalDir(correctPath, currentName, type);
        //          }, (err) => {
        //            debugger
        //           // Handle error
        //          });
        //       }
        //   })
      // }
    
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
 
}

