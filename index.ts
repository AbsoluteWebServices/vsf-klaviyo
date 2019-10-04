import { VueStorefrontModule, VueStorefrontModuleConfig } from '@vue-storefront/core/lib/module'
import { afterRegistration } from './hooks/afterRegistration'
import { module } from './store'
import { initCacheStorage } from '@vue-storefront/core/helpers/initCacheStorage'

export const KEY = 'klaviyo'

export const cacheStorage = initCacheStorage(KEY)

const moduleConfig: VueStorefrontModuleConfig = {
  key: KEY,
  store: { modules: [{ key: KEY, module }] },
  afterRegistration
}

export const Klaviyo = new VueStorefrontModule(moduleConfig)
