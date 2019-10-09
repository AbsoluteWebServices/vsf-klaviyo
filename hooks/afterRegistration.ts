import rootStore from '@vue-storefront/core/store'

export async function afterRegistration({ Vue, config, store, isServer }) {
  if (!isServer && config.klaviyo && config.klaviyo.public_key) {
    await store.dispatch('klaviyo/loadCustomerFromCache')

    if (!store.state.klaviyo.customer) {
      const receivedData = await Vue.prototype.$db.checkoutFieldsCollection.getItem('personal-details')
      if (receivedData) {
        store.dispatch('klaviyo/identify', { personalDetails: receivedData })
      }
    }

    Vue.prototype.$bus.$on('user-after-loggedin', receivedData => {
      store.dispatch('klaviyo/identify', { user: receivedData })
    })

    Vue.prototype.$bus.$on('checkout-after-personalDetails', receivedData => {
      if (!store.state.klaviyo.customer && receivedData.hasOwnProperty('email')) {
        store.dispatch('klaviyo/identify', { personalDetails: receivedData })
      }
    })

    Vue.prototype.$bus.$on('user-before-logout', () => {
      store.dispatch('klaviyo/resetCustomer')
    })

    Vue.prototype.$bus.$on('product-after-single', event => {
      store.dispatch('klaviyo/productViewed', event.product)
    })

    Vue.prototype.$bus.$on('cart-before-add', event => {
      store.dispatch('klaviyo/productAddedToCart', event.product)
    })

    Vue.prototype.$bus.$on('cart-before-delete', event => {
      let beforeDelete = event.items
      Vue.prototype.$bus.$on('cart-after-delete', event => {
        let deleted = beforeDelete.filter(x => !event.items.includes(x))

        if (deleted.length) {
          store.dispatch('klaviyo/productRemovedFromCart', deleted[0])
        }
      })
    })

    Vue.prototype.$bus.$on('checkout-after-mounted', event => { // TODO: maybe bind it to another event
      const onCheckoutStarted = event => {
        Vue.prototype.$bus.$off('cart-after-updatetotals', onCheckoutStarted)
        let cart = rootStore.state.cart
        store.dispatch('klaviyo/checkoutStarted', cart)
      }

      Vue.prototype.$bus.$on('cart-after-updatetotals', onCheckoutStarted)
    })

    Vue.prototype.$bus.$on('order-after-placed', event => {
      let cart = rootStore.state.cart
      let order = {
        ...event.order,
        cart
      }
      store.dispatch('klaviyo/orderPlaced', order)
    })
  }
}
