export class DocuPic {
  public page_num;
  public image_path;
  public irf_id;
  public rowId;
  public stored;
  public panel_code;
  public period_code;
  public date_retrieved;

  constructor(fields?: {
    page_num?: string;
    image_path?: string;
    irf_id?: string;
    stored?: string;
    rowId?: string;
    panel_code?: string;
    period_code?: string;
    date_retrieved?: string;
  }) {
    Object.assign(this, fields);
  }
}
