import { Context } from '@vue-storefront/core';
import { SubscriptionsParams } from '../types';
import { useKlaviyoFactory, UseKlaviyoFactoryParams } from '../factories/useKlaviyoFactory';

declare global {
  interface Window {
    _learnq?: any;
  }
}
declare const window: Window;

const factoryParams: UseKlaviyoFactoryParams = {
  identify: async (context: Context, { customer }): Promise<boolean> => {
    if (window?._learnq) {
      window._learnq.push(['identify', customer]);
      return true;
    } else {
      return context.$klaviyo.api.identify({ properties: customer });
    }
  },
  track: async (context: Context, { event, customer, properties }): Promise<boolean> => {
    if (window?._learnq) {
      window._learnq.push(['track', event, properties]);
      return true;
    } else {
      return context.$klaviyo.api.track({ event, customer_properties: customer, properties });
    }
  },
  checkSubscription: async (context: Context, { email, phone_number, push_token }): Promise<boolean> => {
    const params: SubscriptionsParams = {};

    if (email) {
      params.emails = [email];
    }
    if (phone_number) {
      params.phone_numbers = [phone_number];
    }
    if (push_token) {
      params.push_tokens = [push_token];
    }

    const results = await context.$klaviyo.api.subscriptions(params);

    return results && Array.isArray(results)
      && results.some(subscription => subscription.email === email
        || subscription.phone_number === phone_number
        || subscription.push_token === push_token);
  },
  subscribe: async (context: Context, { profile }): Promise<boolean> => {
    return context.$klaviyo.api.subscribe({ profiles: [profile] });
  },
  unsubscribe: async (context: Context, { email, phone_number, push_token }): Promise<boolean> => {
    const params: SubscriptionsParams = {};

    if (email) {
      params.emails = [email];
    }
    if (phone_number) {
      params.phone_numbers = [phone_number];
    }
    if (push_token) {
      params.push_tokens = [push_token];
    }

    return context.$klaviyo.api.unsubscribe(params);
  },
};


export default useKlaviyoFactory(factoryParams);
