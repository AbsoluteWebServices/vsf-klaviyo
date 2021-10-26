import { ApiClientMethods, IntegrationContext } from '@absolute-web/vsf-core';
import { ClientInstance, Config } from './setup';
import { KlaviyoApiMethods } from './api';

export type Context = IntegrationContext<ClientInstance, Config, ApiClientMethods<KlaviyoApiMethods>>;
