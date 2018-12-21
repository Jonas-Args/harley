import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from './common.service';
import { Subscription } from 'rxjs';
import { of } from 'rxjs';
import { catchError, map, share } from 'rxjs/operators';
import { HttpClient , HttpHeaders } from '@angular/common/http';

@Injectable()
export class HttpService {

  constructor(
      private commonService: CommonService,
      private router: Router,
      private http: HttpClient
    ) {
      let interval = 1000;
      let subscription: Subscription;
    }

  createAuthorizationHeader(skipAuth? :boolean): {} {
    let headerParams = {};

    if(!!skipAuth) {
      headerParams['Content-Type'] = 'application/json';
    } else {
      headerParams['Content-Type'] = 'application/json';
      // headerParams['Authorization'] = this.storage.get('accessToken');
      // headerParams['UserId'] = this.storage.get('userId');
      // headerParams['AccessToken'] = this.storage.get('accessToken');
    }

    return headerParams;
  }

  get(url, skipAuth?:boolean): any {
    const headers = new HttpHeaders(this.createAuthorizationHeader(skipAuth));

    return this.http.get(url, {
      headers: headers
    }).pipe(
      catchError(res => {
        return this.commonErrorHandler(res)
      }), share()
    );
  }

  post(url, data, skipAuth? :boolean): any {
    const headers = new HttpHeaders(this.createAuthorizationHeader(skipAuth));
    return this.http.post(url, data, {
      headers: headers,
    }).pipe(
      catchError(res => {
        return this.commonErrorHandler(res)
      }), share()
    );
  }

  patch(url, data, skipAuth? :boolean): any {
    const headers = new HttpHeaders(this.createAuthorizationHeader(skipAuth));
    return this.http.patch(url, data, {
      headers: headers
    }).pipe(
      catchError(res => {
        return this.commonErrorHandler(res)
      }), share()
    );
  }

  put(url, data, skipAuth? :boolean):any {
    const headers = new HttpHeaders(this.createAuthorizationHeader(skipAuth));
    return this.http.put(url, data, {
      headers: headers
    }).pipe(
      catchError(res => {
        return this.commonErrorHandler(res)
      }), share()
    );
  }

  delete(url, skipAuth? :boolean): any {
    const headers = new HttpHeaders(this.createAuthorizationHeader(skipAuth));
    return this.http.delete(url, {
      headers: headers
    }).pipe(
      catchError(res => {
        return this.commonErrorHandler(res)
      }), share()
    );
  }

  private commonErrorHandler(res: any) {
    const body = res;
    let errors = body.errors ? body.errors : body.error.errors
    if (errors) {
      errors.forEach((err) => {
        if (res.status === 401) {
          this.displayError(err);
          // this.storage.clear();
          this.router.navigateByUrl("/");
        } else if ( res.status === 404) {
          this.router.navigateByUrl("/listings");
        } else if ( res.status === 422) {
          this.displayError(err);
        }
      });
    } else {
      const err = body.error || body.error.errors;
      if (res.status === 401) {
        this.displayError(err);
        // this.storage.clear();
        this.router.navigateByUrl("/");
      } else {
        this.displayError(err);
      }
    }
    return this.commonService.handleError(res);
  }

  private displayToast(msg) {
    console.log(msg, 'Error!');
  }

  displayError(err) {
    if (typeof err === 'object') {
      let errorMsg = "";
      for (var k in err){
        if(Array.isArray(err)){
          errorMsg += `${err.toString()}`
        }
        errorMsg += `${err[k]}`
      }
      this.displayToast(errorMsg);
    } else {
      this.displayToast(err);
    }
  }
}
