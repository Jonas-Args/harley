import { Injectable, Inject } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';

// const ENDPOINT = `${environment.API_URL}/php/api/incentiveList`;
const ENDPOINT  = "endpoint"

@Injectable()
export class IncentiveService extends BaseService {

  constructor(
    public http: HttpClient
  ) {
    super(http, ENDPOINT);
  }

  getIncentives():any {
    // return this.http.get(`${ENDPOINT}/read.php`,true);
  }

}
