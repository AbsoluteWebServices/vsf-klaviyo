import rootStore from '@vue-storefront/core/store'
import { isServer } from '@vue-storefront/core/helpers'
import { StorageManager } from '@vue-storefront/core/lib/storage-manager'
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { defaultEventsConfig } from '../index'

export async function afterRegistration (appConfig, store) {
  if (!isServer && appConfig.klaviyo && appConfig.klaviyo.public_key) {
    await store.dispatch('klaviyo/loadCustomerFromCache')

    if (!store.state.klaviyo.customer) {
      const receivedData = await StorageManager.get('checkout').getItem('personal-details')
      if (receivedData) {
        store.dispatch('klaviyo/identify', { user: receivedData })
      }
    }

    EventBus.$on('user-after-loggedin', receivedData => {
      store.dispatch('klaviyo/identify', { user: receivedData })
    })

    EventBus.$on('checkout-after-personalDetails', receivedData => {
      if (!store.state.klaviyo.customer && receivedData.hasOwnProperty('email')) {
        store.dispatch('klaviyo/identify', { user: receivedData })
      }
    })

    EventBus.$on('user-before-logout', () => {
      store.dispatch('klaviyo/resetCustomer')
    })

    const eventsConfig = appConfig.klaviyo.events || defaultEventsConfig

    if (eventsConfig.hasOwnProperty('productViewed')) {
      if (!Array.isArray(eventsConfig.productViewed)) {
        eventsConfig.productViewed = [eventsConfig.productViewed]
      }

      for (let i = 0; i < eventsConfig.productViewed.length; i++) {
        EventBus.$on(eventsConfig.productViewed[i], event => {
          store.dispatch('klaviyo/productViewed', event.product)
        })
      }
    }

    if (eventsConfig.hasOwnProperty('productAddedToCart')) {
      if (!Array.isArray(eventsConfig.productAddedToCart)) {
        eventsConfig.productAddedToCart = [eventsConfig.productAddedToCart]
      }

      for (let i = 0; i < eventsConfig.productAddedToCart.length; i++) {
        EventBus.$on(eventsConfig.productAddedToCart[i], event => {
          store.dispatch('klaviyo/productAddedToCart', event.product)
        })
      }
    }

    if (eventsConfig.hasOwnProperty('productRemovedFromCart')) {
      if (!Array.isArray(eventsConfig.productRemovedFromCart)) {
        eventsConfig.productRemovedFromCart = [eventsConfig.productRemovedFromCart]
      }

      for (let i = 0; i < eventsConfig.productRemovedFromCart.length; i++) {
        EventBus.$on(eventsConfig.productRemovedFromCart[i].before, event => {
          const beforeDelete = event.items

          EventBus.$on(eventsConfig.productRemovedFromCart[i].after, event => {
            const deleted = beforeDelete.find(x => !event.items.includes(x))

            if (deleted) {
              store.dispatch('klaviyo/productRemovedFromCart', deleted)
            }
          })
        })
      }
    }

    if (eventsConfig.hasOwnProperty('checkoutStarted')) {
      if (!Array.isArray(eventsConfig.checkoutStarted)) {
        eventsConfig.checkoutStarted = [eventsConfig.checkoutStarted]
      }

      for (let i = 0; i < eventsConfig.checkoutStarted.length; i++) {
        if (eventsConfig.checkoutStarted[i] === 'checkout-after-mounted') {
          EventBus.$on(eventsConfig.checkoutStarted[i], () => {
            const onCheckoutStarted = () => {
              EventBus.$off('cart-after-updatetotals', onCheckoutStarted)
              store.dispatch('klaviyo/checkoutStarted', rootStore.state.cart)
            }

            EventBus.$on('cart-after-updatetotals', onCheckoutStarted)
          })
        } else {
          EventBus.$on(eventsConfig.checkoutStarted[i], event => {
            store.dispatch('klaviyo/checkoutStarted', (event && event.cart) || rootStore.state.cart)
          })
        }
      }
    }

    if (eventsConfig.hasOwnProperty('orderPlaced')) {
      if (!Array.isArray(eventsConfig.orderPlaced)) {
        eventsConfig.orderPlaced = [eventsConfig.orderPlaced]
      }

      for (let i = 0; i < eventsConfig.orderPlaced.length; i++) {
        EventBus.$on(eventsConfig.orderPlaced[i], event => {
          store.dispatch('klaviyo/orderPlaced', {
            ...event.order,
            cart: event.cart || rootStore.state.cart
          })
        })
      }
    }
  }
}
