import { StorefrontModule } from '@vue-storefront/core/lib/modules'
import { StorageManager } from '@vue-storefront/core/lib/storage-manager'
import { module } from './store'
import { afterRegistration } from './hooks/afterRegistration'
import { beforeRegistration } from './hooks/beforeRegistration'

export const KEY = 'klaviyo'

export const defaultEventsConfig = {
  'productViewed': ['product-after-single'],
  'productAddedToCart': ['cart-before-add'],
  'productRemovedFromCart': [
    {
      'before': 'cart-before-delete',
      'after': 'cart-after-delete'
    }
  ],
  'checkoutStarted': ['checkout-after-mounted'],
  'orderPlaced': ['order-after-placed']
}

export const KlaviyoModule: StorefrontModule = function ({ store, appConfig }) {
  StorageManager.init(KEY)
  beforeRegistration(appConfig, store)
  store.registerModule(KEY, module)
  afterRegistration(appConfig, store)
}
