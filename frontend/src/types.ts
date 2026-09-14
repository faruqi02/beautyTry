export interface User {
  id?: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  status: string;
  saved_product?: string;
  profile_image_url?: string;
  password?: string;
  last_login?: string;
  created_at?: string;
}

export interface Product {
  id?: number;
  product_name: string;
  skintone: string;
  code_colour: string;
  hex_colour: string;
  product_info?: string;
  intensity_colour?: number;
  stock_qty: number;
  image_urls?: string;
  created_at?: string;
  updated_at?: string;
}
