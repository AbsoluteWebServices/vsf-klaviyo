import { ComputedProperty } from '@vue-storefront/core';
import { BackInStockSubscribeParams, CustomerProperties, EventProperties, ProfileProperties } from './klaviyo';

export interface TrackEvent {
  event: string;
  properties?: EventProperties;
  time?: number
};

export interface  UseKlaviyoErrors {
  identify: Error | null;
  track: Error | null;
  subscribe: Error | null;
  checkSubscription: Error | null;
  unsubscribe: Error | null;
  backInStockSubscribe: Error | null;
}

export interface UseKlaviyo {
  customer: ComputedProperty<CustomerProperties | null>;
  isSubscribed: ComputedProperty<boolean>;
  loading: ComputedProperty<boolean>;
  error: ComputedProperty<UseKlaviyoErrors>;
  reset: () => void;
  identify: (params: { customer: CustomerProperties }) => Promise<boolean>;
  track: (params: TrackEvent) => Promise<boolean>;
  checkSubscription: (params: { email?: string; phone_number?: string; push_token?: string }) =>  Promise<boolean>;
  subscribe: (params: { profile: ProfileProperties }) =>  Promise<boolean>;
  unsubscribe: (params: { email?: string; phone_number?: string; push_token?: string }) =>  Promise<boolean>;
  backInStockSubscribe: (params: BackInStockSubscribeParams) =>  Promise<boolean>;
}
