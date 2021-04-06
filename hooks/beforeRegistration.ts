import { isServer } from '@vue-storefront/core/helpers'
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { Logger } from '@vue-storefront/core/lib/logger'

declare const window

export function beforeRegistration (appConfig, store) {
  if (!isServer && appConfig.klaviyo && appConfig.klaviyo.public_key && appConfig.klaviyo.pixel) {
    const load = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      document.body.appendChild(script)
      script.onload = resolve
      script.onerror = reject
      script.async = true
      script.src = '//static.klaviyo.com/onsite/js/klaviyo.js?company_id=' + appConfig.klaviyo.public_key
    })

    load.then(() => {
      EventBus.$emit('klaviyo-pixel-loaded')
    }).catch(err => {
      Logger.debug('Klaviyo Pixel Not Loaded.')
      console.log(err)
    })
  }
}
