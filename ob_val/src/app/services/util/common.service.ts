import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';

@Injectable()
export class CommonService {

  extractData(response: Response) {
    return response || { };
  }

  handleError (error: Response | any) {
    return throwError(error);
  }

}