export class HhpPurchase {
  public rowId;
  public date_retrieved;
  public time_ordered;
  public date_ordered;
  public outlet_name;
  public outlet_type;
  public prod_cat;
  public brand;
  public variant;
  public size;
  public quantity;
  public price;
  public promo
  public promo_user
  public docupic_Id;
  public serverId;
  public panel_code;
  public period_code;
  public page_num;
  public fi_name;
  public stored;

  constructor(fields?: {
    rowId?: number;
    date_retrieved?: string;
    time_ordered?: string;
    date_ordered?: string;
    outlet_name?: string;
    outlet_type?: string;
    prod_cat?: string;
    brand?: string;
    variant?: string;
    size?: string;
    quantity?: string;
    price?: string;
    promo
    promo_user
    docupic_Id?: string;
    serverId?: number;
    panel_code?: string;
    period_code?: string;
    page_num?: string;
    stored?: string;
    fi_name?: string;
  }) {
    Object.assign(this, fields);
  }
}
