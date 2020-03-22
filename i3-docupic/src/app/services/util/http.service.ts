import { Injectable } from '@angular/core';
import { HttpClient , HttpHeaders, HttpClientModule } from '@angular/common/http';

@Injectable()
export class HttpService {

  constructor(
    private http: HttpClient ) {

    }

  createAuthorizationHeader(skipAuth? :boolean): any {
    let headerParams = {}
    // headerParams['Content-Type'] =  environment['default_http_content_type'];
    if(!skipAuth) {
      //local
      // headerParams['X-AUTH-TOKEN'] =  "c719a1c8c05090d54bc1aada1f93b308";
      //prod
      headerParams['X-AUTH-TOKEN'] =  "895f54e4335491725cfea0b0372a1c98";
      
      // let currentUser = this.storage.getObject('currentUser')
      // if (!currentUser) {
      //   this.router.navigateByUrl(environment['login_url']);
      // } else {
      //   headerParams["AccessToken"] = currentUser["access_token"];
      //   headerParams["UserId"] = currentUser["_id"]["$oid"];
      // }
    }
    return headerParams;
  }

  
  get(url, skipAuth? :boolean): any {
    const headers = new HttpHeaders(this.createAuthorizationHeader(skipAuth));
    return this.http.get(url, {
      headers: headers
    })
  }

  post(url, data, skipAuth? :boolean): any {
    const headers = new HttpHeaders(this.createAuthorizationHeader(skipAuth));
    return this.http.post(url, data, {
      headers: headers
    })
  }

  patch(url, data, skipAuth? :boolean): any {
    const headers = new HttpHeaders(this.createAuthorizationHeader(skipAuth));
    return this.http.patch(url, data, {
      headers: headers
    })
  }

  delete(url, skipAuth? :boolean): any {
    const headers = new HttpHeaders(this.createAuthorizationHeader(skipAuth));
    return this.http.delete(url, {
      headers: headers
    })
  }

}
