export class Irf {
  public proj_type;
  public region;
  public year;
  public period;
  public week;
  public gl_name;
  public fi_name;
  public panel_code;
  public last;
  public rowId;
  public week_code;
  public panel_name;
  public panel_status;
  public gps_location;
  public date_retrieved;
  public accuracy;
  public panel_remarks;
  public panel_receipted;

  constructor(
    fields?: {
      proj_type?: any,
      region?: number,
      year?: string,
      period?: string,
      week?:string,
      week_code?:string,
      gl_name?:string,
      fi_name?:string,
      panel_status?:string,
      panel_code?:string,
      panel_name?:string,
      gps_location?:string,
      date_retrieved?:string,
      accuracy?:string,
      panel_remarks?:string,
      panel_receipted?:string,
      last?:number,
      rowId?:number
    }) {
      Object.assign(this, fields);
    }
  
  
}