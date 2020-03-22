import { Injectable } from "@angular/core";
import { BaseService } from './base.service';
import { HttpService } from "../util/http.service";


@Injectable()
export class IrfFormService{
  public apiEndpoint: any;

  constructor(
    public http: HttpService
  ){
   
  }
}