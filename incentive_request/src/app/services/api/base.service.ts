import { HttpService } from '../util/http.service';

export abstract class BaseService {

  protected apiEndpoint: string;

  constructor(
    public http: HttpService,
    public url: string
  ) {
    this.apiEndpoint = url;
  }

  create(payload: Object, skipLoading?: boolean): any {
    return this.http.post(this.apiEndpoint, { resource: payload }, false);
  }

  update(id: number, payload: Object): any {
    return this.http.patch(`${this.apiEndpoint}/${id}`, { resource: payload });
  }

  get(id: number): any {
    return this.http.get(`${this.apiEndpoint}/${id}`);
  }

  query(query: Object, skipLoading?: boolean): any {
    var params = this.buildParams(query);
    return this.http.get(`${this.apiEndpoint}?${params}`, false);
  }

  destroy(id: number): any {
   return this.http.delete(`${this.apiEndpoint}/${id}`, false);
  }

  buildParams(query: Object): any {
    let paramsArray = [];
    let payload = "";
    let keys = Object.keys(query);
    for (let item of keys) {
      let value = query[item];
      if (value == null) {
        continue;
      }
      if (Array.isArray(value)) {
        let payloadArr = [];
        for (let val of value) {
          payloadArr.push(`${item}[]=${encodeURIComponent(val)}`);
        }
        payload = payloadArr.join("&");
      } else {
        payload = item+"="+encodeURIComponent(value);
      }
      paramsArray.push(payload);
    }
    return paramsArray.join("&");
  }

}
