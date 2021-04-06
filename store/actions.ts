import KlaviyoState from '../types/KlaviyoState'
import { ActionTree } from 'vuex'
import * as types from './mutation-types'
import config from 'config'
import fetch from 'isomorphic-fetch'
import rootStore from '@vue-storefront/core/store'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'
import { StorageManager } from '@vue-storefront/core/lib/storage-manager'
import * as mappers from '../helpers/mappers'
import { processURLAddress, onlineHelper } from '@vue-storefront/core/helpers'
import { Base64 } from '../helpers/webtoolkit.base64.js'
import { KEY } from '../index'

const encode = (json) => {
  return Base64.encode(JSON.stringify(json)) // ERROR: Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.
}

// it's a good practice for all actions to return Promises with effect of their execution
export const actions: ActionTree<KlaviyoState, any> = {
  maybeIdentify ({ state, dispatch }, { user = null, useCache = true, additionalData = {} }): Promise<Response | object> {
    if (state.customer === null) {
      return dispatch('identify', { user, useCache, additionalData })
    } else {
      return new Promise((resolve) => resolve(state.customer))
    }
  },

  updateCustomerAddress ({ state, dispatch }, { address, useCache = true }): Promise<Response> {
    if (state.customer === null) {
      return new Promise((resolve, reject) => reject())
    } else {
      return dispatch('identify', { user: state.customer, useCache, additionalData: mappers.mapAddress(address) })
    }
  },

  identify ({ commit, dispatch }, { user, useCache = true, additionalData = {} }): Promise<Response> {
    if (!user) {
      throw new Error('User details are required')
    }

    const customer = mappers.mapCustomer(user)

    let request = {
      token: config.klaviyo.public_key,
      properties: Object.assign(customer, additionalData)
    }

    let url = processURLAddress(config.klaviyo.endpoint.api) + '/identify?data=' + encode(request)

    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors'
      }).then(res => {
        commit(types.SET_CUSTOMER, customer)

        const cacheStorage = StorageManager.get(KEY)
        if (useCache) cacheStorage.setItem('customer', customer)
        resolve(res)

        cacheStorage.getItem('trackQueue').then(items => {
          if (items) {
            cacheStorage.removeItem('trackQueue')
            items.forEach(event => dispatch('track', event).catch(_ => {}))
          }
        })
      }).catch(err => {
        reject(err)
      })
    })
  },

  loadCustomerFromCache ({ commit }): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      const cacheStorage = StorageManager.get(KEY)
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
      const cacheStorage = StorageManager.get(KEY)
      cacheStorage.removeItem('customer')
      cacheStorage.removeItem('backInStockWatching')
    }
  },

  track ({ state }, { event, data, time = Math.floor(Date.now() / 1000) }): Promise<Response> {
    if (state.customer === null || !onlineHelper.isOnline) {
      return new Promise((resolve, reject) => {
        if (state.customer === null) {
          console.warn('No customer identified')
          reject({ message: 'No customer identified' })
        } else {
          reject({ message: 'No connection' })
        }

        const cacheStorage = StorageManager.get(KEY)
        cacheStorage.getItem('trackQueue').then(items => {
          let newItems = items || []

          newItems.push({ event, data, time })
          cacheStorage.setItem('trackQueue', newItems)
        })
      })
    }

    let request = {
      token: config.klaviyo.public_key,
      event: event,
      customer_properties: state.customer,
      properties: data,
      time
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

  status ({ commit, state }, email): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fetch(processURLAddress(config.klaviyo.endpoint.subscribe) + '?email=' + encodeURIComponent(email) + '&storeCode=' + config.defaultStoreCode, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      }).then(res => res.json())
        .then(res => {
          if (Array.isArray(res.result) && res.result.length > 0) {
            commit(types.NEWSLETTER_SUBSCRIBE)
            resolve(true)
          } else {
            commit(types.NEWSLETTER_UNSUBSCRIBE)
            resolve(false)
          }
        }).catch(err => {
          reject(err)
        })
    })
  },

  subscribe ({ commit, dispatch, state }, email): Promise<Response> {
    if (!state.isSubscribed) {
      return new Promise((resolve, reject) => {
        fetch(processURLAddress(config.klaviyo.endpoint.subscribe), {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          body: JSON.stringify({
            email: email,
            storeCode: config.defaultStoreCode
          })
        }).then(res => {
          commit(types.NEWSLETTER_SUBSCRIBE)
          if (!state.customer) {
            dispatch('identify', { user: { email } }).then((identify) => resolve(identify))
          } else {
            resolve(res)
          }
        }).catch(err => {
          reject(err)
        })
      })
    }
  },

  subscribeAdvanced ({ commit, dispatch, state }, requestData): Promise<Response> {
    return new Promise((resolve, reject) => {
      fetch(processURLAddress(config.klaviyo.endpoint.subscribeAdvanced), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(requestData)
      }).then(res => {
        if (!state.customer && requestData.hasOwnProperty('email')) {
          dispatch('identify', { user: { email: requestData.email } }).then((identify) => resolve(identify))
        } else {
          resolve(res)
        }
      }).catch(err => {
        reject(err)
      })
    })
  },

  unsubscribe ({ commit, state, dispatch }, email): Promise<Response> {
    if (state.isSubscribed) {
      return new Promise((resolve, reject) => {
        dispatch('track', {
          event: 'Request to Unsubscribe',
          data: {
            email: email,
            listId: config.klaviyo.listId
          }
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
      let formData = new URLSearchParams()
      const { storeId } = currentStoreView()

      formData.append('a', config.klaviyo.public_key)
      formData.append('email', email)
      formData.append('g', config.klaviyo.backInStockListId)
      formData.append('variant', product.id)
      formData.append('product', product.id)
      formData.append('platform', config.klaviyo.platform)
      formData.append('store', storeId || config.defaultStoreId)
      formData.append('subscribe_for_newsletter', subscribeForNewsletter)

      return new Promise((resolve, reject) => {
        fetch(processURLAddress(config.klaviyo.endpoint.backInStock), {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          mode: 'cors',
          body: formData.toString()
        }).then(res => {
          res.json().then(json => {
            if (json.success) {
              commit(types.BACK_IN_STOCK_SUBSCRIBE, product.parentSku ? product.parentSku + '-' + product.sku : product.sku)
              if (useCache) {
                const cacheStorage = StorageManager.get(KEY)
                cacheStorage.setItem('backInStockWatching', state.backInStockWatching)
              }
              resolve(json)
            } else {
              reject(json)
            }
          })
        }).catch(err => {
          reject(err)
        })
      })
    }
  },

  backInStockUnsubscribe ({ state, commit, getters, dispatch }, { product, email, subscribeForNewsletter, useCache = true }): Promise<Response> {
    if (getters.isWatching(product.sku)) {
      const { storeId } = currentStoreView()

      return new Promise((resolve, reject) => {
        dispatch('track', {
          event: 'Requested Back In Stock Unsubscribe',
          data: {
            email: email,
            listId: config.klaviyo.backInStockListId,
            storeId: storeId || config.defaultStoreId,
            product: product.parentSku ? product.parentSku : product.sku,
            variant: product.sku
          }
        }).then(res => {
          res.json().then(json => {
            if (json.success) {
              commit(types.BACK_IN_STOCK_UNSUBSCRIBE, product.parentSku ? product.parentSku + '-' + product.sku : product.sku)
              if (useCache) {
                const cacheStorage = StorageManager.get(KEY)
                cacheStorage.setItem('backInStockWatching', state.backInStockWatching)
              }
              resolve(json)
            } else {
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
    return new Promise((resolve, reject) => {
      const loadFromServer = (): Promise<any> => {
        return new Promise((resolve, reject) => {
          reject({ message: 'Not Implemented' })
        })
      }

      if (useCache) {
        const cacheStorage = StorageManager.get(KEY)
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
    return dispatch('track', { event: 'Viewed Product', data: mappers.mapProduct(product) }).catch(_ => {})
  },

  productAddedToCart ({ dispatch }, product): Promise<Response> {
    return dispatch('track', { event: 'Added to Cart Product', data: mappers.mapLineItem(product) }).catch(_ => {})
  },

  productRemovedFromCart ({ dispatch }, product): Promise<Response> {
    return dispatch('track', { event: 'Removed from Cart Product', data: mappers.mapLineItem(product) }).catch(_ => {})
  },

  async checkoutStarted ({ dispatch }, cart): Promise<Response> {
    let cartMapper

    try {
      const cartMapperOverride = config.klaviyo.mappers.mapCart
      if (cartMapperOverride) {
        cartMapper = await rootStore.dispatch(`${cartMapperOverride}`, cart, { root: true })
      }
    } catch {
      cartMapper = mappers.mapCart(cart)
    }
    return dispatch('track', { event: 'Started Checkout', data: cartMapper || mappers.mapCart(cart) }).catch(_ => {})
  },

  orderPlaced ({ state, dispatch }, order): Promise<Response> {
    return new Promise(async (resolve, reject) => {
      try {
        const addressInfo = order.addressInformation.shippingAddress || order.addressInformation.billingAddress

        if (addressInfo) {
          let user: any = state.customer

          if (user === null) {
            user = {
              email: addressInfo.email
            }
          }

          user.firstname = addressInfo.firstname
          user.lastname = addressInfo.lastname
          user.telephone = addressInfo.telephone
          user.address = addressInfo

          await dispatch('identify', { user })
        }

        const response = await dispatch('track', { event: 'Placed Order', data: mappers.mapOrder(order) })
        order.products.forEach(product => {
          dispatch('productOrdered', { order, product })
        })

        resolve(response)
      } catch (_) {}
    })
  },

  productOrdered ({ dispatch }, { order, product }): Promise<Response> {
    return dispatch('track', { event: 'Ordered Product', data: mappers.mapOrderedProduct(order, product) }).catch(_ => {})
  }
}
