import { ApiClientMethods, IntegrationContext } from '@absolute-web/vsf-core';
import { ClientInstance, Config, KlaviyoApiMethods } from './types';

declare module '@absolute-web/vsf-core' {
  export interface Context {
    $klaviyo: IntegrationContext<ClientInstance, Config, ApiClientMethods<KlaviyoApiMethods>>;
  }
}
