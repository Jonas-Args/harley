export class Irf {
  public proj_type;
  public region;
  public year;
  public period;
  public week;
  public fi_name;
  public panel_code;
  public last;
  public rowId;
  public period_code;
  public panel_name;
  public panel_status;
  public gps_location;
  public date_retrieved;
  public accuracy;
  public panel_remarks;
  public panel_receipted;
  public stored;

  constructor(fields?: {
    proj_type?: any;
    region?: number;
    year?: string;
    period?: string;
    week?: string;
    period_code?: string;
    fi_name?: string;
    panel_status?: string;
    panel_code?: string;
    panel_name?: string;
    gps_location?: string;
    date_retrieved?: string;
    accuracy?: string;
    panel_remarks?: string;
    panel_receipted?: string;
    last?: number;
    rowId?: number;
    stored?: string;
  }) {
    Object.assign(this, fields);
  }
}
