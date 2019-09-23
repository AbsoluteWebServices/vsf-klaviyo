import KlaviyoState from '../types/KlaviyoState'
import { ActionTree } from 'vuex'
import * as types from './mutation-types'
import config from 'config'
import fetch from 'isomorphic-fetch'
import rootStore from '@vue-storefront/core/store'
import { mapCustomer, mapProduct, mapOrder, mapCart, mapLineItem, mapOrderedProduct } from '../helpers/mappers'
import { cacheStorage } from '../'
import { processURLAddress } from '@vue-storefront/core/helpers'
import { Base64 } from '../helpers/webtoolkit.base64.js'

const encode = (json) => {
  return Base64.encode(JSON.stringify(json)) // ERROR: Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.
}

// it's a good practice for all actions to return Promises with effect of their execution
export const actions: ActionTree<KlaviyoState, any> = {
  identify ({ commit }, { user, useCache = true }): Promise<Response> {
    let customer = mapCustomer(user)
    let request = {
      token: config.klaviyo.public_key,
      properties: customer
    }
    let url = processURLAddress(config.klaviyo.endpoint.api) + '/identify?data=' + encode(request)

    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors'
      }).then(res => {
        commit(types.SET_CUSTOMER, customer)
        if (useCache) cacheStorage.setItem('customer', customer)
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },

  loadCustomerFromCache ({ commit }): Promise<Object> {
    return new Promise ((resolve, reject) => {
      cacheStorage.getItem('customer').then(customer => {
        if (customer) {
          commit(types.SET_CUSTOMER, customer)
          resolve(customer)
        } else {
          resolve(null)
        }
      }).catch(() => reject())
    })
  },

  resetCustomer ({ commit }, useCache = true) {
    commit(types.SET_CUSTOMER, null)
    commit(types.SET_NEWSLETTER_SUBSCRIBED, null)
    commit(types.SET_WATCHING, [])
    if (useCache) {
      cacheStorage.removeItem('customer')
      cacheStorage.removeItem('backInStockWatching')
    }
  },

  track ({ state }, { event, data }): Promise<Response> {
    if (state.customer === null) {
      return new Promise((resolve, reject) => {
        console.warn('No customer identified')
        reject({ message: 'No customer identified'})
      })
    }

    let request = {
      token: config.klaviyo.public_key,
      event : event,
      customer_properties : state.customer,
      properties : data
    }
    let url = processURLAddress(config.klaviyo.endpoint.api) + '/track?data=' + encode(request)

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

  status ({ commit, state }, email): Promise<Boolean> {
    return new Promise((resolve, reject) => {
      fetch(processURLAddress(config.klaviyo.endpoint.subscribe) + '?email=' + encodeURIComponent(email), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
      }).then(res => res.json())
        .then(res => {
          if (Array.isArray(res.result) && res.result.length > 0) {
            commit(types.NEWSLETTER_SUBSCRIBE)
            if (!state.customer) {
              let customer = mapCustomer({ email })
              commit(types.SET_CUSTOMER, customer)
            }
            resolve(true)
          } else {
            commit(types.NEWSLETTER_UNSUBSCRIBE)
            if (!rootStore.state.user.current || !rootStore.state.user.current.email) {
              commit(types.SET_CUSTOMER, null)
            }
            resolve(false)
          }
        }).catch(err => {
          reject(err)
        })
    })
  },

  subscribe ({ commit, state }, email): Promise<Response> {
    if (!state.isSubscribed) {
      return new Promise((resolve, reject) => {
        fetch(processURLAddress(config.klaviyo.endpoint.subscribe), {
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
        fetch(processURLAddress(config.klaviyo.endpoint.subscribe), {
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

  backInStockSubscribe ({ state, commit, getters }, { product, email, subscribeForNewsletter, useCache = true }): Promise<Response> {
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
        fetch(processURLAddress(config.klaviyo.endpoint.backInStock), {
          method: 'POST',
          mode: 'cors',
          body: formData
        }).then(res => {
          res.json().then(json => {
            if (json.success) {
              commit(types.BACK_IN_STOCK_SUBSCRIBE, product.parentSku ? product.parentSku + '-' + product.sku : product.sku)
              if (useCache) cacheStorage.setItem('backInStockWatching', state.backInStockWatching)
              resolve(json)
            }
            else {
              reject(json)
            }
          })
        }).catch(err => {
          reject(err)
        })
      })
    }
  },

  backInStockUnsubscribe ({ state, commit, getters }, { product, email, subscribeForNewsletter, useCache = true }): Promise<Response> {
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
        fetch(processURLAddress(config.klaviyo.endpoint.subscribe), {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          body: formData
        }).then(res => {
          res.json().then(json => {
            if (json.success) {
              commit(types.BACK_IN_STOCK_UNSUBSCRIBE, product.parentSku ? product.parentSku + '-' + product.sku : product.sku)
              if (useCache) cacheStorage.setItem('backInStockWatching', state.backInStockWatching)
              resolve(json)
            }
            else {
              reject(json)
            }
          })
        }).catch(err => {
          reject(err)
        })
      })
    }
  },

  loadWatchingList ({ commit, dispatch }, useCache = true): Promise<Response> {
    return new Promise ((resolve, reject) => {
      const loadFromServer = (): Promise<any> => {
        return new Promise((resolve, reject) => {
          reject({ message: 'Not Implemented'})
        })
      }

      if (useCache) {
        cacheStorage.getItem('backInStockWatching').then(backInStockWatching => {
          if (backInStockWatching) {
            commit(types.SET_WATCHING, backInStockWatching)
            resolve(backInStockWatching)
          } else {
            loadFromServer().then(res => {
              resolve(res)
            }).catch(err => {
              reject(err)
            })
          }
        }).catch(() => reject())
      } else {
        loadFromServer().then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      }
    })
  },

  productViewed ({ dispatch }, product): Promise<Response> {
    return dispatch('track', { event: 'Viewed Product', data: mapProduct(product) }).catch(err => {})
  },

  productAddedToCart ({ dispatch }, product): Promise<Response> {
    return dispatch('track', { event: 'Added to Cart Product', data: mapLineItem(product) }).catch(err => {})
  },

  productRemovedFromCart ({ dispatch }, product): Promise<Response> {
    return dispatch('track', { event: 'Removed from Cart Product', data: mapLineItem(product) }).catch(err => {})
  },

  checkoutStarted ({ dispatch }, cart): Promise<Response> {
    return dispatch('track', { event: 'Started Checkout', data: mapCart(cart) }).catch(err => {})
  },

  orderPlaced ({ dispatch }, order): Promise<Response> {
    return new Promise((resolve, reject) => {
      dispatch('track', { event: 'Placed Order', data: mapOrder(order) }).then(res => {
        order.products.forEach(product => {
          dispatch('productOrdered', { order, product })
        })
        resolve(res)
      }).catch(err => {})
    })
  },

  productOrdered ({ dispatch }, { order, product }): Promise<Response> {
    return dispatch('track', { event: 'Ordered Product', data: mapOrderedProduct(order, product) }).catch(err => {})
  }
}
