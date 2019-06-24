import KlaviyoState from '../types/KlaviyoState'
import { ActionTree } from 'vuex'
import * as types from './mutation-types'
import config from 'config'
import rootStore from '@vue-storefront/core/store'
import { mapCustomer, mapProduct, mapOrder, mapCart, mapLineItem, mapOrderedProduct } from '../helpers/mappers'

const encode = (json) => {
  return window.btoa(JSON.stringify(json))
}

// it's a good practice for all actions to return Promises with effect of their execution
export const actions: ActionTree<KlaviyoState, any> = {
  identify ({ commit }, user): Promise<Response> {
    let customer = mapCustomer(user)
    let request = {
      token: config.klaviyo.public_key,
      properties: customer
    }

    let url = config.klaviyo.endpoint.api
    url += '/identify'
    url = new URL(url),
    url.searchParams.append('data', encode(request))

    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors'
      }).then(res => {
        commit(types.SET_CUSTOMER, customer)
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },

  track ({ state }, { event, data }): Promise<Response> {
    if (state.customer === null) {
      return new Promise((resolve, reject) => {
        reject()
      })
    }

    let request = {
      token: config.klaviyo.public_key,
      event : event,
      customer_properties : state.customer,
      properties : data
    }

    let url = config.klaviyo.endpoint.api
    url += '/track'
    url = new URL(url),
    url.searchParams.append('data', encode(request))

    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors'
      }).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },

  subscribe ({ commit, state }, email): Promise<Response> {
    if (!state.isSubscribed) {
      return new Promise((resolve, reject) => {
        fetch(config.klaviyo.endpoint.subscribe, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          body: JSON.stringify({ email })
        }).then(res => {
          commit(types.NEWSLETTER_SUBSCRIBE)

          if (!state.customer) {
            let customer = mapCustomer({ email })
            commit(types.SET_CUSTOMER, customer)
          }

          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    }
  },

  unsubscribe ({ commit, state }, email): Promise<Response> {
    if (state.isSubscribed) {
      return new Promise((resolve, reject) => {
        fetch(config.klaviyo.endpoint.subscribe, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          body: JSON.stringify({ email })
        }).then(res => {
          commit(types.NEWSLETTER_UNSUBSCRIBE)

          if (!rootStore.state.user.current || !rootStore.state.user.current.email) {
            commit(types.SET_CUSTOMER, null)
          }

          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    }
  },

  backInStockSubscribe ({ commit, getters }, { product, email, subscribeForNewsletter }): Promise<Response> {
    if (!getters.isWatching(product.sku)) {
      let formData = new FormData()

      formData.append('a', config.klaviyo.public_key)
      formData.append('email', email)
      formData.append('g', config.klaviyo.listId)
      formData.append('variant', product.sku)
      formData.append('product', product.parentSku ? product.parentSku : product.sku)
      formData.append('platform', config.klaviyo.platform)
      formData.append('subscribe_for_newsletter', subscribeForNewsletter)

      return new Promise((resolve, reject) => {
        fetch(config.klaviyo.endpoint.backInStock, {
          method: 'POST',
          mode: 'cors',
          body: formData
        }).then(res => {
          res.json().then(json => {
            if (json.success) {
              commit(types.BACK_IN_STOCK_SUBSCRIBE, product.sku)
              resolve(res)
            }
            else {
              reject(res)
            }
          })
        }).catch(err => {
          reject(err)
        })
      })
    }
  },

  backInStockUnsubscribe ({ commit, getters }, { product, email, subscribeForNewsletter }): Promise<Response> {
    if (getters.isWatching(product.sku)) {
      let formData = new FormData()
      
      formData.append('a', config.klaviyo.public_key)
      formData.append('email', email)
      formData.append('g', config.klaviyo.listId)
      formData.append('variant', product.sku)
      formData.append('product', product.parentSku ? product.parentSku : product.sku)
      formData.append('platform', config.klaviyo.platform)
      formData.append('subscribe_for_newsletter', subscribeForNewsletter)

      return new Promise((resolve, reject) => {
        fetch(config.klaviyo.endpoint.subscribe, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          body: formData
        }).then(res => {
          res.json().then(json => {
            if (json.success) {
              commit(types.BACK_IN_STOCK_UNSUBSCRIBE, product.sku)
              resolve(res)
            }
            else {
              reject(res)
            }
          })
        }).catch(err => {
          reject(err)
        })
      })
    }
  },

  productViewed ({ dispatch }, product): Promise<Response> {
    return dispatch('track', { event: 'Viewed Product', data: mapProduct(product) })
  },

  productAddedToCart ({ dispatch }, product): Promise<Response> {
    return dispatch('track', { event: 'Added to Cart Product', data: mapLineItem(product) })
  },

  productRemovedFromCart ({ dispatch }, product): Promise<Response> {
    return dispatch('track', { event: 'Removed from Cart Product', data: mapLineItem(product) })
  },

  checkoutStarted ({ dispatch }, cart): Promise<Response> {
    return dispatch('track', { event: 'Started Checkout', data: mapCart(cart) })
  },

  orderPlaced ({ dispatch }, order): Promise<Response> {
    return new Promise((resolve, reject) => {
      dispatch('track', { event: 'Placed Order', data: mapOrder(order) }).then(res => {
        order.products.forEach(product => {
          dispatch('productOrdered', { order, product })
        })
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },

  productOrdered ({ dispatch }, { order, product }): Promise<Response> {
    return dispatch('track', { event: 'Ordered Product', data: mapOrderedProduct(order, product) })
  }
}
