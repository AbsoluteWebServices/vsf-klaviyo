import { MutationTree } from 'vuex'
import * as types from './mutation-types'
import KlaviyoState from '../types/KlaviyoState'

export const mutations: MutationTree<KlaviyoState> = {
  [types.SET_CUSTOMER] (state, customer) {
    state.customer = customer
  },
  [types.NEWSLETTER_SUBSCRIBE] (state) {
    state.isSubscribed = true
  },
  [types.NEWSLETTER_UNSUBSCRIBE] (state) {
    state.isSubscribed = false
  },
  [types.BACK_IN_STOCK_SUBSCRIBE] (state, productSku) {
    state.backInStockWatching.push(productSku)
  },
  [types.BACK_IN_STOCK_UNSUBSCRIBE] (state, productSku) {
    let index = state.backInStockWatching.indexOf(productSku)
    if (index !== -1) {
      state.backInStockWatching.splice(index, 1)
    }
  }
}
