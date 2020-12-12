import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/throw';

@Injectable()
export class CommonService {

  extractData(response: Response) {
    return response || { };
  }

  handleError (error: Response | any) {
    throw error 
  }

}