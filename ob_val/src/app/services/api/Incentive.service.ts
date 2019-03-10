import { Injectable, Inject } from '@angular/core';
import { HttpService } from '../util/http.service';
import { BaseService } from './base.service';
import { environment } from '../../../environments/environment';

const ENDPOINT = `${environment.API_URL}/php/api/incentiveList`;

@Injectable()
export class IncentiveService extends BaseService {

  constructor(
    public http: HttpService
  ) {
    super(http, ENDPOINT);
  }

  getIncentives():any {
    return this.http.get(`${ENDPOINT}/read.php`,true);
  }

}
