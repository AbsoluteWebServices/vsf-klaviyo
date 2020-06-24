import { StorefrontModule } from '@vue-storefront/core/lib/modules'
import { StorageManager } from '@vue-storefront/core/lib/storage-manager'
import { module } from './store'
import { afterRegistration } from './hooks/afterRegistration'

export const KEY = 'klaviyo'

export const KlaviyoModule: StorefrontModule = function ({ store, appConfig }) {
  StorageManager.init(KEY)

  store.registerModule(KEY, module)

  afterRegistration(appConfig, store)
}
