import rootStore from '@vue-storefront/core/store'
import { isServer } from '@vue-storefront/core/helpers'
import { StorageManager } from '@vue-storefront/core/lib/storage-manager'
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'

export async function afterRegistration (appConfig, store) {
  if (!isServer && appConfig.klaviyo && appConfig.klaviyo.public_key) {
    await store.dispatch('klaviyo/loadCustomerFromCache')

    if (!store.state.klaviyo.customer) {
      const receivedData = await StorageManager.get('checkout').getItem('personal-details')
      if (receivedData) {
        store.dispatch('klaviyo/identify', { personalDetails: receivedData })
      }
    }

    EventBus.$on('user-after-loggedin', receivedData => {
      store.dispatch('klaviyo/identify', { user: receivedData })
    })

    EventBus.$on('checkout-after-personalDetails', receivedData => {
      if (!store.state.klaviyo.customer && receivedData.hasOwnProperty('email')) {
        store.dispatch('klaviyo/identify', { personalDetails: receivedData })
      }
    })

    EventBus.$on('user-before-logout', () => {
      store.dispatch('klaviyo/resetCustomer')
    })

    EventBus.$on('product-after-single', event => {
      store.dispatch('klaviyo/productViewed', event.product)
    })

    EventBus.$on('cart-before-add', event => {
      store.dispatch('klaviyo/productAddedToCart', event.product)
    })

    EventBus.$on('cart-before-delete', event => {
      let beforeDelete = event.items
      EventBus.$on('cart-after-delete', event => {
        let deleted = beforeDelete.filter(x => !event.items.includes(x))

        if (deleted.length) {
          store.dispatch('klaviyo/productRemovedFromCart', deleted[0])
        }
      })
    })

    EventBus.$on('checkout-after-mounted', event => { // TODO: maybe bind it to another event
      const onCheckoutStarted = event => {
        EventBus.$off('cart-after-updatetotals', onCheckoutStarted)
        let cart = rootStore.state.cart
        store.dispatch('klaviyo/checkoutStarted', cart)
      }

      EventBus.$on('cart-after-updatetotals', onCheckoutStarted)
    })

    EventBus.$on('order-after-placed', event => {
      let cart = rootStore.state.cart
      let order = {
        ...event.order,
        cart
      }
      store.dispatch('klaviyo/orderPlaced', order)
    })
  }
}
