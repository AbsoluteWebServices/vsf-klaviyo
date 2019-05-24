import { Module } from 'vuex'
import { mutations } from './mutations'
import { getters } from './getters'
import { actions } from './actions'
import { state } from './state'
import KlaviyoState from '../types/KlaviyoState'

export const module: Module<KlaviyoState, any> = {
    namespaced: true,
    mutations,
    actions,
    getters,
    state
}
