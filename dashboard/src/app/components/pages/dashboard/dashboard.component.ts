import { Component, OnInit, Input } from '@angular/core';
import { TagPanelService } from 'src/app/services/api/tagpanel.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  tagPanels=[];
  origTagPanels=[];
  formFilter: FormGroup;

  constructor(
    private tagPanelServ: TagPanelService,
    private fb: FormBuilder) {
    this.formFilter = fb.group({
      week_code: [''],
    });
   }

  ngOnInit() {
    this.getAllTagPanels();
    this.formFilter.get("week_code").valueChanges.subscribe(value=>{
      this.filter("WeekCode",value)
    })
  }

  filter(byValue, filterValue){
    console.log("value",filterValue)
    if(filterValue==""){
      this.tagPanels = this.origTagPanels
      return
    }
    this.tagPanels = this.origTagPanels.filter(value=> value[byValue]==filterValue)
  }
  
  private getAllTagPanels(){
    this.tagPanelServ.getTagPanels()
    .subscribe(res => { 
      this.tagPanels = res.records;
      this.origTagPanels = res.records;});
  }

}
