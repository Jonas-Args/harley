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
  showBranchName=false;
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
        mobile_num_1: ['', [Validators.required]],
        mobile_num_2: ['', [Validators.required]],
        email_add: ['', [Validators.required]],
        proof_of_billing: ['', [Validators.required]],
        valid_id: ['', [Validators.required]],
        image_path: ['', [Validators.required]]
      });
      // add field here
      this.formPanel.get('zip_code').valueChanges.subscribe(value=>{
        this.zipcodes = JSON.parse(JSON.stringify(this.csvItems.filter(res=>res["zip_code"].includes(value))))
        console.log(this.zipcodes)
        if(this.zipcodes.length == 1){
          let zip = this.zipcodes[0]
          this.formPanel.get('municipality').setValue(zip["city"], {emitEvent: false})
          this.formPanel.get('province').setValue(zip["major_area"], {emitEvent: false})
          this.barangays = this.barangayItems.filter(res=>res["city"].toLowerCase()==zip["city"].toLowerCase())
          
          console.log(this.barangays)
        }
      })

      this.formPanel.get('province').valueChanges.subscribe(value=>{
        this.provinces = Array.from(new Set(this.csvItems.filter(res=>res["major_area"].toLowerCase().includes(value.toLowerCase())).map(s=>s.major_area)))
        console.log(this.provinces)
      })

      this.formPanel.get('municipality').valueChanges.subscribe(value=>{
        if(!!this.provinceDesc && this.provinceDesc != ''){
          this.cities = this.csvItems.filter(res=>res["city"].toLowerCase().includes(value.toLowerCase()) && this.provinceDesc.toLowerCase()==res["major_area"].toLowerCase())
        }else{
          this.cities = this.csvItems.filter(res=>res["city"].toLowerCase().includes(value.toLowerCase()))
        }
        console.log(this.cities)
      })

      this.formPanel.get('barangay_name').valueChanges.subscribe(value=>{
        if(!!this.cityDesc && this.cityDesc != ''){
          this.barangays = this.barangayItems.filter(res=>res["name"].toLowerCase().includes(value.toLowerCase()) && this.cityDesc.toLowerCase()==res["city"].toLowerCase())
        }else{
          this.barangays = this.barangayItems.filter(res=>res["name"].toLowerCase().includes(value.toLowerCase()))
        }
        console.log(this.cities)
      })
     }

    ngOnInit() {
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
    console.log("sending"+this.formatMessage())
    this.showToast("sending"+this.formatMessage())
   this.sms.send('09177131456', this.formatMessage()).then(
    () => {
      console.log("message sent")
      let hey = this.tagPanelObj
      if(!!this.tagPanelObj && !!this.tagPanelObj.Id){
        let newObj = Object.assign({sent:true},this.formPanel.value)
        // this.tagPanelObj = Object.assign(this.tagPanelObj,newObj)
        this.save("irf",newObj)
      }else{
        this.save("irf",Object.assign({sent:true},this.formPanel.value))
      }
    } ,
    error => console.error('Error removing item', error)
    );
   
  }

  formatMessage(){
    let formValue = this.formPanel.value
    let message = `${formValue.panel_code||""};`+
                   `${formValue.panel_name||""};` +
                   `${formValue.panel_gps_location||""};` +
                   `${formValue.panel_status||""};` + 
                   `${formValue.panel_remarks||""};` +
                   `${formValue.panel_receipted||""};` +
                   `${formValue.panel_week_code||""}`
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

  ionViewWillEnter()
  {
    this.loadCSV();
  }


  loadCSV()
  {
    this.http.get('/assets/data/zip.csv')
    .subscribe((data)=>
    {
        var csv         = this.parseCSVFile(data);
        this.csvItems  = csv;
    },(error)=>{
        let arrayResult         = this.parseCSVFile(error.error.text);
        this.csvItems  = this.formatParsedObject(arrayResult, true);
        this.provinces = Array.from(new Set(this.csvItems.map(s=>s.major_area)))
    });

    this.http.get('/assets/data/barangay.csv')
    .subscribe((data)=>
    {
      debugger
        // var csv         = this.parseCSVFile(data);
        // this.csvItems  = csv;
    },(error)=>{
        let arrayResult         = this.parseCSVFile(error.error.text);
        this.barangayItems  = this.formatParsedBarangay(arrayResult, true);
        this.regions = Array.from(new Set(this.csvItems.map(s=>s.region)))
        // this.storage.getItem("zip_saved").then(
        //   data=>{ 
        //     if(!data["zip_saved"]){
        //       this.csvItems.forEach(element => {
        //         this.save("zip"+element["zip_code"], element)
        //       });
        //       this.save("zip_saved", {"zip_saved":true})
        //     }else{
        //     }
        // },
        //   error => {
        //     console.error(error)
        //   }
        // )
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
            region         = items[2];
         }
         else
         {
            obj.push({
               name   : items[0],
               city       : items[1],
               region       : items[2],
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
    this.cities = this.csvItems.filter(res=>res["major_area"].toLowerCase()==this.provinceDesc.toLowerCase())
    console.log(this.cities)
  }

  selectCity(value, element){
    element.value = value.option.value
    this.cityDesc = element.value

    let exact = this.csvItems.filter(res=>res["city"].toLowerCase() == this.cityDesc.toLowerCase())
        
    if(exact.length == 1){
      let city = exact[0]
      this.barangays = this.barangayItems.filter(res=>res["city"].toLowerCase()==city["city"].toLowerCase())
      this.formPanel.get("region").setValue(this.barangays[0]["region"],{emitEvent: false})
      if(this.formPanel.get("zip_code").value == ""){
        this.formPanel.get("zip_code").setValue(city["zip_code"],{emitEvent: false})
      }
      if(this.formPanel.get("province").value == ""){
        this.formPanel.get("province").setValue(city["major_area"],{emitEvent: false})
      }
    }
  }

  selectZipCode(value, element){
    element.value = value.option.value.zip_code
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
              this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
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

  copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
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

  
}
