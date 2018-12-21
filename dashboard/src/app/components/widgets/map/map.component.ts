import { Component, OnInit, ViewChild, Input } from '@angular/core';
import * as MarkerClusterer from "@google/markerclusterer"

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;
  latLongs:any;
  markers:any = [];
  records:any;

  @Input() 
  set _records(records:any){
    if(!!records && !!this.map && records.length > 0 ){
      console.log("records",records)
      this.records = records
      this.clearMarkers()
      let temp_LatLongs = this.formatLatLng(records)
      this.markers = this.getMarkers(temp_LatLongs)
      this.setBounds(this.markers)
      this.addToMap(this.markers)
      }else if(!!records && records.length == 0){
        this.clearMarkers()
      }
  }

  myLatLng = {lat: -25.363, lng: 131.044};
  constructor() { }

  ngOnInit() {
    var mapProp = {
      zoom: 3,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
  }

  addMarker(latlng) {
    let gmarkers=[];
    var marker = new google.maps.Marker({
        position: latlng,
        animation: google.maps.Animation.DROP,
        map: this.map
    });
    gmarkers.push(marker);
}

  formatLatLng(records){
    return records.map(value=>{
      if(!!value){
        let ltlng = value.GPSLoc.split(", ")
        return {
          lat: parseFloat(ltlng[0]),
          lng: parseFloat(ltlng[1]),
        }
      }
    })
  }

  getMarkers(locations){
    return locations.map((location, i) => {
      if(!!this.map){
        console.log("adding")
        let marker =  new google.maps.Marker({
          position: location,
          label: this.records[i].PanelNAme,
          animation: google.maps.Animation.DROP,
          map: this.map
        });

      //   var customIcon = {
      //     url: "/assets/static/images/map_icon.png",
      //     scaledSize: new google.maps.Size(32, 40),
      //     origin: new google.maps.Point(0, 0), 
      //     anchor: new google.maps.Point(16, 40)
      //   };
      //  marker.setIcon(customIcon)
       return marker
      }
      
    });
  }

  addToMap(markers){
    markers.forEach(element => {
      element.setMap(this.map)
    });
  }

  setBounds(markers){
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
      bounds.extend(markers[i].getPosition());
    }

    this.map.fitBounds(bounds);
  }  

   // Sets the map on all markers in the array.
  setMapOnAll(map) {
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(map);
    }
  }

  // Removes the markers from the map, but keeps them in the array.
  clearMarkers() {
    this.setMapOnAll(null);
  }

  // Shows any markers currently in the array.
  showMarkers() {
    this.setMapOnAll(this.map);
  }

  // Deletes all markers in the array by removing references to them.
  deleteMarkers() {
    this.clearMarkers();
    this.markers = [];
  }

}
