export class PanelMain {
  public panel_code;
  public panel_fname;
  public panel_sec;
  public region;
  public fi_name;
  public sched_day;
  public proj_type;
  public panel_stat;
  public rowId;

  constructor(fields?: {
    panel_code?: string;
    panel_fname?: string;
    panel_sec?: string;
    region?: string;
    fi_name?: string;
    sched_day?: string;
    proj_type?: string;
    panel_stat?: string;
    rowId?: string;
  }) {
    Object.assign(this, fields);
  }
}
