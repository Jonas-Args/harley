import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@Component({
  selector: 'app-tagpanel',
  templateUrl: './tagpanel.page.html',
  styleUrls: ['./tagpanel.page.scss'],
})
export class tagpanelPage implements OnInit {

  constructor(private barcodeScanner: BarcodeScanner) { }

  statuses = [
    {value:"retrieved"},
    {value:"zero"},
    {value:"na"},
    {value:"hatching"},
    {value:"invited"},
    {value:"dropped"}]

  ngOnInit() {
  }

  scan(){
    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
     }).catch(err => {
         console.log('Error', err);
     });
  }

}
