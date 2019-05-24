import KlaviyoState from '../types/KlaviyoState'
import { ActionTree } from 'vuex'
import * as types from './mutation-types'
import config from 'config'
import { mapCustomer, mapProduct, mapOrder, mapCart, mapLineItem, mapOrderedProduct } from '../helpers/mappers'

const encode = (json) => {
  return window.btoa(JSON.stringify(json))
}

export const actions: ActionTree<KlaviyoState, any> = {
  async identify ({ commit }, user) {
    let customer = mapCustomer(user)
    let request = {
      token: config.klaviyo.public_key,
      properties: customer
    }

    let url = config.klaviyo.endpoint
    url += '/identify'
    url = new URL(url),
    url.searchParams.append('data', encode(request))

    const resp = await fetch(url, {
      method: 'GET',
      mode: 'cors'
    })

    if (resp.ok) {
      commit(types.SET_CUSTOMER, customer)
    }

    return resp.ok
  },

  async track ({ state }, { event, data }) {
    if (state.customer === null) {
      return false
    }

    let request = {
      token: config.klaviyo.public_key,
      event : event,
      customer_properties : state.customer,
      properties : data
    }

    let url = config.klaviyo.endpoint
    url += '/track'
    url = new URL(url),
    url.searchParams.append('data', encode(request))

    const resp = await fetch(url, {
      method: 'GET',
      mode: 'cors'
    })
    
    return resp.ok
  },

  async productViewed ({ dispatch }, product) {
    dispatch('track', { event: 'Viewed Product', data: mapProduct(product) })
  },

  async productAddedToCart ({ dispatch }, product) {
    dispatch('track', { event: 'Added to Cart Product', data: mapLineItem(product) })
  },

  async productRemovedFromCart ({ dispatch }, product) {
    dispatch('track', { event: 'Removed from Cart Product', data: mapLineItem(product) })
  },

  async checkoutStarted ({ dispatch }, cart) {
    dispatch('track', { event: 'Started Checkout', data: mapCart(cart) })
  },

  async orderPlaced ({ dispatch }, order) {
    dispatch('track', { event: 'Placed Order', data: mapOrder(order) })
    order.products.forEach(product => {
      dispatch('productOrdered', { order, product })
    });
  },

  async productOrdered ({ dispatch }, { order, product }) {
    dispatch('track', { event: 'Ordered Product', data: mapOrderedProduct(order, product) })
  },
}
