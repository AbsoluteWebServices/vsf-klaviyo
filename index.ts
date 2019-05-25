import { VueStorefrontModule, VueStorefrontModuleConfig } from '@vue-storefront/core/lib/module'
import { afterRegistration } from './hooks/afterRegistration'
import { module } from './store'
import routes from './router'

const KEY = 'klaviyo'

const moduleConfig: VueStorefrontModuleConfig = {
  key: KEY,
  store: { modules: [{ key: KEY, module }] },
  afterRegistration,
  router: { routes }
}

export const Klaviyo = new VueStorefrontModule(moduleConfig)
