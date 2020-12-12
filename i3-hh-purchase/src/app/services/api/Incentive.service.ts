import { Injectable, Inject } from '@angular/core';
import { BaseService } from './base.service';
import { HttpService } from '../util/http.service';

const ENDPOINT  = "endpoint"

@Injectable()
export class IncentiveService {

  constructor(
    public http: HttpService
  ) {
  
  }

  getIncentives():any {
    // return this.http.get(`${ENDPOINT}/read.php`,true);
  }

}
