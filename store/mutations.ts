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
  }
}
