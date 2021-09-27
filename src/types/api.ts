import { IdentifyParams, SubscribeParams, SubscriptionInfo, SubscriptionsParams, TrackParams } from './klaviyo';

export interface KlaviyoApiMethods {
  identify(params: IdentifyParams): Promise<boolean>;
  subscribe(params: SubscribeParams): Promise<boolean>;
  subscriptions(params: SubscriptionsParams): Promise<SubscriptionInfo[]>;
  track(params: TrackParams): Promise<boolean>;
  unsubscribe(params: SubscriptionsParams): Promise<boolean>;
}
