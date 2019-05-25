import KlaviyoState from '../types/KlaviyoState'
import { ActionTree } from 'vuex'
import * as types from './mutation-types'
import config from 'config'
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
