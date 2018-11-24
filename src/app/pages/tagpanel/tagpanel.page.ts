import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { SMS } from '@ionic-native/sms/ngx';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { SqliteService } from '../../services/util/sqlite.service';

@Component({
  selector: 'app-tagpanel',
  templateUrl: './tagpanel.page.html',
  styleUrls: ['./tagpanel.page.scss'],
})
export class tagpanelPage implements OnInit {

  formPanel: FormGroup;

  constructor(
    private barcodeScanner: BarcodeScanner,
    private sms: SMS,
    private fb: FormBuilder,
    private sql: SqliteService) {
      this.formPanel = fb.group({
        panel_code: ['', [Validators.required]],
        panel_name: ['', [Validators.required]],
        panel_status: ['', [Validators.required]],
        panel_gps_location: ['', [Validators.required]],
        panel_remarks: [''],
        panel_receipted: ['']
      });
     }

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
      this.formPanel.get('panel_code').setValue(barcodeData.text)
     }).catch(err => {
         console.log('Error', err);
     });
  }

  sendSMS(){
   this.sms.send('09177131456', this.formatMessage());
  }

  formatMessage(){
    let formValue = this.formPanel.value
    let message = `${formValue.panel_code};`+
                   `${formValue.panel_name};` +
                   `${formValue.panel_gps_location};` +
                   `${formValue.panel_status};` + 
                   `${formValue.panel_remarks};` +
                   `${formValue.panel_receipted}`
    return message 
  }

}
