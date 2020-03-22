import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AsyncSubject } from "rxjs";

@Injectable()
export class CsvService {
  itemId;
  brgy_lookup: any;
  barangayItems: any;
  regions: any;
  provinces: any;

  brgy_lookup_subject = new AsyncSubject();

  constructor(public http: HttpClient) {}

  loadCSV() {
    this.http.get("/assets/data/brgy_look_up.csv").subscribe(
      data => {},
      error => {
        let arrayResult = this.parseCSVFile(error.error.text);
        this.brgy_lookup = this.formatParsedObject(arrayResult, true);
        this.brgy_lookup.splice(0, 1);
        this.brgy_lookup_subject.next(this.brgy_lookup);
        this.brgy_lookup_subject.complete();
        // console.log("csv-items", this.csvItems);
      }
    );

    // this.http.get("/assets/data/barangay.csv").subscribe(
    //   data => {},
    //   error => {
    //     let arrayResult = this.parseCSVFile(error.error.text);
    //     this.barangayItems = this.formatParsedBarangay(arrayResult, true);
    //     this.regions = Array.from(
    //       new Set(this.barangayItems.map(s => s.region))
    //     );
    //     this.provinces = Array.from(
    //       new Set(this.csvItems.map(s => s.major_area))
    //     );
    //     console.log("regions", this.regions);
    //     console.log("barangayItems", this.barangayItems);
    //   }
    // );
  }

  parseCSVFile(str) {
    var arr = [],
      obj = [],
      row,
      col,
      c,
      quote = false; // true means we're inside a quoted field

    // iterate over each character, keep track of current row and column (of the returned array)
    for (row = col = c = 0; c < str.length; c++) {
      var cc = str[c],
        nc = str[c + 1]; // current character, next character

      arr[row] = arr[row] || [];
      arr[row][col] = arr[row][col] || "";

      /* If the current character is a quotation mark, and we're inside a
    quoted field, and the next character is also a quotation mark,
    add a quotation mark to the current column and skip the next character
      */
      if (cc == '"' && quote && nc == '"') {
        arr[row][col] += cc;
        ++c;
        continue;
      }

      // If it's just one quotation mark, begin/end quoted field
      if (cc == '"') {
        quote = !quote;
        continue;
      }

      // If it's a comma and we're not in a quoted field, move on to the next column
      if (cc == "," && !quote) {
        ++col;
        continue;
      }

      /* If it's a newline and we're not in a quoted field, move on to the next
         row and move to column 0 of that new row */
      if (cc == "\n" && !quote) {
        ++row;
        col = 0;
        continue;
      }

      // Otherwise, append the current character to the current column
      arr[row][col] += cc;
    }

    return arr;
  }

  formatParsedObject(arr, hasTitles) {
    let brgy_code,
      brgy,
      municipality,
      province,
      region,
      urbanity,
      obj = [];

    for (var j = 0; j < arr.length; j++) {
      var items = arr[j];

      if (items.indexOf("") === -1) {
        obj.push({
          brgy_code: items[0],
          brgy: items[1],
          municipality: items[2],
          province: items[3],
          region: items[4],
          urbanity: items[5]
        });
      }
    }
    return obj;
  }

  // formatParsedBarangay(arr, hasTitles) {
  //   let name,
  //     city,
  //     region,
  //     province,
  //     obj = [];

  //   for (var j = 0; j < arr.length; j++) {
  //     var items = arr[j];

  //     if (items.indexOf("") === -1) {
  //       if (hasTitles === true && j === 0) {
  //         name = items[0];
  //         city = items[1];
  //         province = items[2];
  //         region = items[3];
  //       } else {
  //         obj.push({
  //           name: items[0],
  //           city: items[1],
  //           province: items[2],
  //           region: items[3]
  //         });
  //       }
  //     }
  //   }
  //   return obj;
  // }
}
