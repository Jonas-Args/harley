import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { SMS } from '@ionic-native/sms/ngx';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Toast } from '@ionic-native/toast/ngx';
import { StorageService } from '../../services/util/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { HttpClient } from '@angular/common/http';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';
import { Platform } from '@ionic/angular';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { File } from '@ionic-native/File/ngx';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
  tagPanelObj;
  showOtherAddress=false;
  csvItems : any;
  barangayItems : any;
  selectedZip;

  barangays;
  provinces;
  zipcodes;
  cities;
  regions;

  selectedBarangay;
  selectedProvince;
  itemDesc="";
  provinceDesc="";
  cityDesc="";
  zipDesc="";

  private win: any = window;
  
  currentImage: any;
  currentImagePath: any;

  requestObj:any;

  STORAGE_KEY = 'my_images';

  constructor(
    private barcodeScanner: BarcodeScanner,
    private sms: SMS,
    private storage: StorageService,
    private fb: FormBuilder,
    private toast: Toast,
    private route: ActivatedRoute,
    private router: Router,
    private nativeStorage: NativeStorage,
    public http   : HttpClient,
    public camera: Camera,
    private file: File, 
    private webview: WebView,
    private filePath: FilePath,
    private platform: Platform
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
        image_path: ['', [Validators.required]]
      });
      // add field here
      this.formPanel.valueChanges.subscribe(value=>{
        console.log(this.formPanel.get('email_add').errors)
      })
      this.formPanel.get('zip_code').valueChanges
      .pipe(debounceTime(800),distinctUntilChanged(),distinctUntilChanged())
       // only emit if value is different from previous value
      .subscribe(value=>{
        this.zipcodes = JSON.parse(JSON.stringify(this.csvItems.filter(res=>res["zip_code"].includes(value))))

      })

      this.formPanel.get('province').valueChanges
      .pipe(debounceTime(800),distinctUntilChanged())
      .subscribe(value=>{
        this.provinces = Array.from(new Set(this.barangayItems.filter(res=>res["province"].toLowerCase().includes(value.toLowerCase())).map(s=>s.province)))
        console.log(this.provinces)
      })

      this.formPanel.get('municipality').valueChanges
      .pipe(debounceTime(800),distinctUntilChanged())
      .subscribe(value=>{
        if(!!this.provinceDesc && this.provinceDesc != ''){
          this.cities = Array.from(new Set(this.barangayItems.filter(res=>res["city"].toLowerCase().includes(value.toLowerCase()) && this.provinceDesc.toLowerCase()==res["province"].toLowerCase()).map(s=>s.city)))
        }else{
          this.cities = Array.from(new Set(this.barangayItems.filter(res=>res["city"].toLowerCase().includes(value.toLowerCase())).map(s=>s.city)))
        }
        console.log("cities",this.cities)
      })

      this.formPanel.get('barangay_name').valueChanges
      .pipe(debounceTime(800),distinctUntilChanged())
      .subscribe(value=>{
        if(!!this.cityDesc && this.cityDesc != ''){
          this.barangays = this.barangayItems.filter(res=>res["name"].toLowerCase().includes(value.toLowerCase()) && this.cityDesc.toLowerCase()==res["city"].toLowerCase())
        }else{
          this.barangays = this.barangayItems.filter(res=>res["name"].toLowerCase().includes(value.toLowerCase()))
        }
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
      this.start()
      this.route.queryParams
      .subscribe(params => {
        console.log("params",params)
        if(!!params.Id){
          this.storage.getItem(params.Id).then(
            data=>{ this.requestObj = data 
              this.currentImagePath = this.getTrustImg(this.requestObj["image_path"])
              console.log("data is", data)
            this.formPanel.patchValue(data,{emitEvent: false})
          },
            error => console.error(error))
        }

        if(!!params.panel_code){
          this.formPanel.get("panel_code").setValue(params.panel_code)
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
    this.showToast("sending"+this.formatMessage())
    console.log("sending",this.formatMessage())
   this.sms.send('09177131456', this.formatMessage()).then(
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
                   `${formValue.proof_of_billing||""};` +
                   `${formValue.valid_id||""};`

    // add field here 
    console.log("message",message)
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

  ionViewWillEnter()
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
        this.provinces = Array.from(new Set(this.csvItems.map(s=>s.major_area)))
    });

    this.http.get('/assets/data/barangay.csv')
    .subscribe((data)=>
    {
    },(error)=>{
        let arrayResult         = this.parseCSVFile(error.error.text);
        this.barangayItems  = this.formatParsedBarangay(arrayResult, true);
        this.regions = Array.from(new Set(this.csvItems.map(s=>s.region)))
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
    if(!!this.requestObj && !!this.requestObj.Id){
      value = Object.assign(this.requestObj,value)
    }
    this.storage.setItem("request",value)
    this.router.navigate([`/`])
}

  selectDescription(value, element){
    element.value = value.option.value
    this.itemDesc = element.value
    this.selectedBarangay = this.barangays.filter(res=>res["name"].toLowerCase()==this.itemDesc.toLowerCase())[0]
    if(!!this.selectedBarangay["region"]){
      this.formPanel.get("region").setValue(this.selectedBarangay["region"],{emitEvent: false})
    }
  }

  selectProvince(value, element){
    element.value = value.option.value
    this.provinceDesc = element.value

    this.selectedProvince = this.barangayItems.filter(res=>res["province"].toLowerCase()==this.provinceDesc.toLowerCase())[0]
    
    this.cities = Array.from(new Set(this.barangayItems.filter(res=>res["province"].toLowerCase()==this.provinceDesc.toLowerCase()).map(s=>s.city)))
    console.log("cities",this.cities)
    if(this.formPanel.get("region").value == "" && !!this.selectedProvince["region"]){
      this.formPanel.get("region").setValue(this.selectedProvince["region"],{emitEvent: false})
    }
    console.log(this.cities)
  }

  selectCity(value, element){
    element.value = value.option.value
    this.cityDesc = element.value

    let city = this.barangayItems.filter(res=>res["city"].toLowerCase() == this.cityDesc.toLowerCase())[0]
        
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

  selectZipCode(value, element){
    element.value = value.option.value
    this.zipDesc = element.value
  }

  takePicture(sourceType: PictureSourceType = this.camera.PictureSourceType.CAMERA) {
    const options: CameraOptions = {
      quality: 100,
      sourceType: sourceType,
      mediaType: this.camera.MediaType.PICTURE
    }
      this.platform.ready().then(() => {
          if(this.platform.is('cordova')){
            let camera = this.camera
            camera.getPicture(options).then((imagePath) => {
              this.currentImage = imagePath
              this.currentImagePath = this.getTrustImg(imagePath)
              var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
              var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
              this.copyFileToLocalDir(currentName, this.createFileName());
             }, (err) => {
               debugger
              // Handle error
             });
          }
      })
  }

  getTrustImg(imageSrc){
    let path = this.win.Ionic.WebView.convertFileSrc(imageSrc);
    console.log(path);
    return path;
    }

  copyFileToLocalDir(currentName, newFileName) {
    let path= this.file.externalRootDirectory + "irf_entry"
    this.file.copyFile(path, currentName, this.file.dataDirectory, newFileName).then(success => {
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

  start(){
  
    AdvancedGeolocation.start((success)=>{

        try{
          let jsonObject: any = JSON.parse(success);

          if(!!jsonObject.latitude){
            this.location = jsonObject
            
            this.formPanel.get('gps_location').setValue(`${this.location.latitude}, ${this.location.longitude}`)
            this.formPanel.get('loc_accuracy').setValue(`${parseFloat(this.location.accuracy.toFixed(2))} meters`)
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
        "providers":"all",     // Return GPS, NETWORK and CELL locations
        "useCache":true,       // Return GPS and NETWORK cached locations
        "satelliteData":true, // Return of GPS satellite info
        "buffer":true,        // Buffer location data
        "bufferSize":3,         // Max elements in buffer
        "signalStrength":false // Return cell signal strength data
      });
  }

  
}
