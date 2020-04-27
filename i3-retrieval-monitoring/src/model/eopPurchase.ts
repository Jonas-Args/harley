export class EopPurchase {
  public date_ordered;
  public time_ordered;
  public outlet_name;
  public outlet_type;
  public inside_mall;
  public access_type;
  public for_whom;
  public food_ordered;
  public meat_type;
  public cook_type;
  public amount_paid;
  public with_receipt;
  public group_size;
  public kids_below_12;
  public rowId;
  public stored;
  public docupic_Id;
  public date_retrieved;
  public serverId

  constructor(fields?: {
    date_retrieved?: string;
    date_ordered?: string;
    time_ordered?: string;
    outlet_name?: string;
    outlet_type?: string;
    inside_mall?: string;
    access_type?: string;
    for_whom?: string;
    food_ordered?: string;
    meat_type?: string;
    cook_type?: string;
    amount_paid?: string;
    with_receipt?: string;
    group_size?: string;
    kids_below_12?: string;
    rowId?: number;
    stored?: string;
    docupic_Id?: string;
    serverId?: number;
  }) {
    Object.assign(this, fields);
  }
}
