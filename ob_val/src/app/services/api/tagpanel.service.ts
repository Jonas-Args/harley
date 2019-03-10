import { Injectable, Inject } from '@angular/core';
import { HttpService } from '../util/http.service';
import { BaseService } from './base.service';
import { environment } from '../../../environments/environment';

const ENDPOINT = `${environment.API_URL}/php/api/gpstag`;

@Injectable()
export class TagPanelService extends BaseService {

  constructor(
    public http: HttpService
  ) {
    super(http, ENDPOINT);
  }

  findByPanelCodeWeekCode(panelCode, weekCode):any {
    return this.http.get(`${ENDPOINT}/find.php?PanelCode=${panelCode}&WeekCode=${weekCode}`,true);
  }

}
