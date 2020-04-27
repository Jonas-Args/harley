export class PurchaseEntry {
  public stored;
  public prod_cat;
  public prod_cat_attributes;
  public period_code;
  public manufacturer;
  public manufacturer_attributes;
  public brand;
  public brand_attributes;
  public sub_brand;
  public sub_brand_attributes;
  public flavor;
  public flavor_attributes;
  public formula;
  public formula_attributes;
  public variant;
  public variant_attributes;
  public weight_size;
  public weight_size_attributes;
  public packaging;
  public packaging_attributes;
  public packaging_color;
  public use_type;
  public form;
  public skin_type;
  public hair_type;
  public product_type;
  public gender;
  public age;
  public quantity;
  public price;
  public promo;
  public outlet_type;
  public outlet_name;
  public week;
  public period;
  public year;
  public purchase_time;
  public day;
  public panel_code;
  public last;
  public rowId;
  public date_retrieved;

  constructor(fields?: {
    stored?: string;
    prod_cat_attributes?: string;
    prod_cat?: string;
    period_code?: string;
    manufacturer?: string;
    manufacturer_attributes?: string;
    brand?: string;
    brand_attributes?: string;
    sub_brand?: string;
    sub_brand_attributes?: string;
    flavor?: string;
    flavor_attributes?: string;
    formula?: string;
    formula_attributes?: string;
    variant?: string;
    variant_attributes?: string;
    weight_size?: string;
    weight_size_attributes?: string;
    packaging?: string;
    packaging_attributes?: string;
    packaging_color?: string;
    use_type?: string;
    form?: string;
    skin_type?: string;
    hair_type?: string;
    product_type?: string;
    gender?: string;
    age?: string;
    quantity?: string;
    price?: string;
    promo?: string;
    outlet_type?: string;
    outlet_name?: string;
    week?: string;
    purchase_time?: string;
    day?: string;
    panel_code?: string;
    rowId?: number;
    last?: number;
    year?: string;
    period?: string;
    date_retrieved?: string;
  }) {
    Object.assign(this, fields);
  }
}
