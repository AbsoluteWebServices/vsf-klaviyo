import { Ref, computed } from 'vue-demi';
import {
  configureFactoryParams,
  Context,
  FactoryParams,
  Logger,
  sharedRef,
} from '@absolute-web/vsf-core';
import {
  BackInStockSubscribeParams,
  CustomerProperties,
  EventProperties,
  ProfileProperties,
  TrackEvent,
  UseKlaviyo,
  UseKlaviyoErrors,
} from '../types';

export interface UseKlaviyoFactoryParams extends FactoryParams{
  identify: (context: Context, params: { customer: CustomerProperties }) => Promise<boolean>;
  track: (context: Context, params: { event: string; customer?: CustomerProperties; properties?: EventProperties; time?: number }) => Promise<boolean>;
  checkSubscription: (context: Context, params: { email?: string; phone_number?: string; push_token?: string }) =>  Promise<boolean>;
  subscribe: (context: Context, params: { profile: ProfileProperties }) =>  Promise<boolean>;
  unsubscribe: (context: Context, params: { email?: string; phone_number?: string; push_token?: string }) =>  Promise<boolean>;
  backInStockSubscribe: (context: Context, params: BackInStockSubscribeParams) =>  Promise<boolean>;
}

declare global {
  interface Window {
    _learnq?: any;
  }
}
declare const window: Window;

export function useKlaviyoFactory(
  factoryParams: UseKlaviyoFactoryParams,
) {
  return function useKlaviyo(ssrKey = 'default'): UseKlaviyo {
    const customer: Ref<CustomerProperties | null> = sharedRef<CustomerProperties | null>(null, `useKlaviyo-${ssrKey}-customer`);
    const isSubscribed: Ref<boolean> = sharedRef<boolean>(false, `useKlaviyo-${ssrKey}-isSubscribed`);
    const loading: Ref<boolean> = sharedRef<boolean>(false, `useKlaviyo-${ssrKey}-loading`);
    const error: Ref<UseKlaviyoErrors> = sharedRef({
      identify: null,
      track: null,
      subscribe: null,
      checkSubscription: null,
      unsubscribe: null,
      backInStockSubscribe: null,
    }, `useKlaviyo-${ssrKey}-error`);
    // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle
    const _factoryParams = configureFactoryParams(factoryParams);

    const trackQueue: Ref<TrackEvent[]> = sharedRef([], `useKlaviyo-${ssrKey}-trackQueue`);

    const reset = () => {
      customer.value = null;
      loading.value = false;
      error.value = {
        identify: null,
        track: null,
        subscribe: null,
        checkSubscription: null,
        unsubscribe: null,
        backInStockSubscribe: null,
      };
      trackQueue.value = [];
    }

    const track = async ({ event, properties, time = Math.floor(Date.now() / 1000) }: TrackEvent): Promise<boolean> => {
      if (!window?._learnq && !customer.value) {
        Logger.debug(`useKlaviyo/${ssrKey}/track-queued`, { event, properties, time });
        trackQueue.value.push({ event, properties, time });
        return false;
      }

      Logger.debug(`useKlaviyo/${ssrKey}/track`, { event, customer: customer.value, properties, time });

      try {
        loading.value = true;
        const result = await _factoryParams.track({ event, customer: customer.value, properties, time });
        error.value.track = null;
        return result;
      } catch (err: any) {
        error.value.track = err;
        Logger.error(`useKlaviyo/${ssrKey}/track`, err);
        return false;
      } finally {
        loading.value = false;
      }
    };

    const identify = async (params: { customer: CustomerProperties }): Promise<boolean> => {
      Logger.debug(`useKlaviyo/${ssrKey}/identify`, { customer: params.customer });

      try {
        loading.value = true;
        const result = await _factoryParams.identify({ customer: params.customer });
        error.value.identify = null;
        if (result) {
          customer.value = params.customer;

          const promises: Promise<boolean>[] = [];
          while (trackQueue.value.length) {
            const event = trackQueue.value.shift();

            if (event) {
              promises.push(track(event));
            }
          }

          await Promise.all(promises);
        }
        return result;
      } catch (err: any) {
        error.value.identify = err;
        Logger.error(`useKlaviyo/${ssrKey}/identify`, err);
        return false;
      } finally {
        loading.value = false;
      }
    };

    const checkSubscription = async (params: { email?: string; phone_number?: string; push_token?: string }): Promise<boolean> => {
      Logger.debug(`useKlaviyo/${ssrKey}/checkSubscription`, { ...params });

      try {
        loading.value = true;
        isSubscribed.value = await _factoryParams.checkSubscription({ ...params });
        error.value.checkSubscription = null;
        return isSubscribed.value;
      } catch (err: any) {
        error.value.checkSubscription = err;
        Logger.error(`useKlaviyo/${ssrKey}/checkSubscription`, err);
        return false;
      } finally {
        loading.value = false;
      }
    };

    const subscribe = async ({ profile }: { profile: ProfileProperties }): Promise<boolean> => {
      Logger.debug(`useKlaviyo/${ssrKey}/subscribe`, { profile });

      try {
        loading.value = true;
        const result = await _factoryParams.subscribe({ profile });
        error.value.subscribe = null;
        if (result && !customer.value) {
          const { email, phone_number, ...rest } = profile;
          await identify({ customer: { $email: email, $phone_number: phone_number, ...rest } });
        }
        return result;
      } catch (err: any) {
        error.value.subscribe = err;
        Logger.error(`useKlaviyo/${ssrKey}/subscribe`, err);
        return false;
      } finally {
        loading.value = false;
      }
    };

    const unsubscribe = async (params: { email?: string; phone_number?: string; push_token?: string }): Promise<boolean> => {
      Logger.debug(`useKlaviyo/${ssrKey}/unsubscribe`, { ...params });

      try {
        loading.value = true;
        const result = await _factoryParams.unsubscribe({ ...params });
        error.value.unsubscribe = null;
        return result;
      } catch (err: any) {
        error.value.unsubscribe = err;
        Logger.error(`useKlaviyo/${ssrKey}/unsubscribe`, err);
        return false;
      } finally {
        loading.value = false;
      }
    };

    const backInStockSubscribe = async ({ email, productId, variantId, subscribe, storeId }: BackInStockSubscribeParams): Promise<boolean> => {
      Logger.debug(`useKlaviyo/${ssrKey}/backInStockSubscribe`, { email, productId, variantId, subscribe });

      try {
        loading.value = true;
        const result = await _factoryParams.backInStockSubscribe({ email, productId, variantId, subscribe, storeId });
        error.value.backInStockSubscribe = null;
        return result;
      } catch (err: any) {
        error.value.backInStockSubscribe = err;
        Logger.error(`useKlaviyo/${ssrKey}/backInStockSubscribe`, err);
        return false;
      } finally {
        loading.value = false;
      }
    };

    return {
      customer: computed(() => customer.value),
      isSubscribed: computed(() => isSubscribed.value),
      loading: computed(() => loading.value),
      error: computed(() => error.value),
      reset,
      identify,
      track,
      checkSubscription,
      subscribe,
      unsubscribe,
      backInStockSubscribe,
    };
  };
}
