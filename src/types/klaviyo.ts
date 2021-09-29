export type CustomerProperties = {
  $email?: string;
  $first_name?: string;
  $last_name?: string;
  $phone_number?: string;
  $city?: string;
  $region?: string;
  $country?: string;
  $zip?: string;
  $image?: string;
  $consent?: string[];
  [key: string]: any;
}

export interface IdentifyParams {
  properties?: CustomerProperties | null;
}

export interface EventProperties {
  $event_id?: string;
  $value?: number;
  [key: string]: any;
}

export interface TrackParams {
  event: string;
  customer_properties?: CustomerProperties | null;
  properties?: EventProperties | null;
  time?: number;
}

export type KlaviyoConsent = 'email' | 'web' | 'sms' | 'directmail' | 'mobile';

export interface ProfileProperties {
  email?: string;
  phone_number?: string;
  sms_consent?: boolean;
  $consent?: KlaviyoConsent[];
  [key: string]: any;
}

export interface SubscribeParams {
  profiles: ProfileProperties[];
}

export interface SubscriptionInfo {
  id: string;
  created: string;
  email?: string;
  phone_number?: string;
  push_token?: string;
}

export interface SubscriptionsParams {
  emails?: string[];
  phone_numbers?: string[];
  push_tokens?: string[];
}

export type ProductAttributes = {
  ProductName: string;
  ProductID: string;
  SKU: string;
  Categories: string[];
  ImageURL: string;
  URL: string;
  Brand: string;
  Price: number;
  CompareAtPrice: number;
  [key: string]: any;
};

export type LineItemAttributes = ProductAttributes & {
  Quantity: number;
  RowTotal: number;
  [key: string]: any;
};

export type CartAttributes = {
  $value: number;
  ItemNames: string[];
  CheckoutURL: string;
  Items: LineItemAttributes[];
  Categories: string[];
  [key: string]: any;
};

export type CartAddedItemAttributes = CartAttributes & {
  AddedItemProductName: string;
  AddedItemProductID: string;
  AddedItemSKU: string;
  AddedItemCategories: string[];
  AddedItemImageURL: string;
  AddedItemURL: string;
  AddedItemPrice: number;
  AddedItemQuantity: number;
  [key: string]: any;
};

export type CheckoutAttributes = CartAttributes & {
  $event_id: string;
  [key: string]: any;
};

export interface BackInStockSubscribeParams {
  email: string;
  variantId?: string;
  productId: string;
  subscribe?: boolean;
}
