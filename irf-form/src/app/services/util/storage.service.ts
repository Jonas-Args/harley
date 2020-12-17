import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private nativeStorage: NativeStorage,
    private router: Router) { }
    
  setItem(type,object:any){
    let Id
    if(!!object.Id){
      Id = object.Id
    }else{
      Id = type+this.getKey()
      object = Object.assign({Id:Id},object)
    }
   
    this.nativeStorage.setItem(Id, object)
    .then(
      () => {
        console.log('Stored item!')
        this.router.navigateByUrl('/list');
      },
      error => console.error('Error storing item', error)
    );
  }

  getItem(key){
    return new Promise((resolve,reject)=>this.nativeStorage.getItem(key)
      .then(
        data => resolve(data),
        error => resolve(error)
      ));
  }

  removeItem(key){
    return new Promise((resolve,reject)=>this.nativeStorage.remove(key)
    .then(
      () => {console.log('item removed!'); resolve({})} ,
      error => console.error('Error removing item', error)
    ));

  }

  getAllItem() {
    return new Promise((resolve,reject)=>
    this.nativeStorage.keys()
      .then(keys => Promise.all(keys.map(k => this.nativeStorage.getItem(k))).then(data => resolve(data))
      )
    )
  }
  
  private getKey(){
    let date = new Date();
    let str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return str
  }
}
