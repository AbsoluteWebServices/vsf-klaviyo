import { Logger } from '@vue-storefront/core/lib/logger'
import { once } from '@vue-storefront/core/helpers'

export function beforeRegistration({ Vue, config, store, isServer }) {
  if (!isServer) {
    if (config.klaviyo && config.klaviyo.public_key) {
      once('__VUE_KLAVIYO_SNIPPET__', () => {
        store.dispatch('klaviyo/setup')
      })
    } else {
      Logger.warn(
        'Klaviyo extension is not working. Ensure Klaviyo public key is defined in config',
        'Klaviyo'
      )()
    }
  }
}
