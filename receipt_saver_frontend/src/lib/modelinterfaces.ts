export interface User {
  id: number;
  username: string;
  email: string;
  user_uuid: string;
  num_receipts: number;
}

export const baseUser: User = {
  id: 0,
  username: "",
  email: "",
  user_uuid: "",
  num_receipts: 0,
};

export interface Receipt {
  id: number;
  user: number;
  receipt_uuid: string;
  name: string;
  store: string;
  address: string;
  date_purchased: string;
  last_updated: string;
  num_items: number;
  total: number;
  subtotal: number;
  tax: number;
  taxpercent: number;

  items: any;
}

export const baseReceipt: Receipt = {
  id: 0,
  user: 0,
  receipt_uuid: "",
  name: "",
  store: "",
  address: "",
  date_purchased: "",
  last_updated: "",
  num_items: 0,
  total: 0,
  subtotal: 0,
  tax: 0,
  taxpercent: 0,

  items: null,
};

export interface Item {
  item_uuid: string;
  receipt: number;
  name: string;
  quantity: number;
  price: number;
  stores_checked: object;
  last_updated: string;
}

export const baseItem: Item = {
  item_uuid: "",
  receipt: 0,
  name: "",
  quantity: 0,
  price: 0.0,
  stores_checked: {},
  last_updated: "",
};

export interface ComparedItem {
  name: string;
  productLink: string;
  price: number;
  imgURL: string;
  rating: number;
  reviewsAmount: number;
}

export const BaseComparedItem: ComparedItem = {
  name: "",
  productLink: "",
  price: 0.0,
  imgURL: "",
  rating: 0,
  reviewsAmount: 0,
};
