import { ApiClientMethods, IntegrationContext } from '@vue-storefront/core';
import { ClientInstance, Config, KlaviyoApiMethods } from './types';

declare module '@vue-storefront/core' {
  export interface Context {
    $klaviyo: IntegrationContext<ClientInstance, Config, ApiClientMethods<KlaviyoApiMethods>>;
  }
}
