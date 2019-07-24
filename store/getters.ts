import KlaviyoState from '../types/KlaviyoState'
import { GetterTree } from 'vuex'

export const getters: GetterTree<KlaviyoState, any> = {
  isWatching: state => sku => {
    return state.backInStockWatching.indexOf(sku) !== -1
  }
}
