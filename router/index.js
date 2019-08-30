import Vue from 'vue'

let routes = [
  {
    name: 'klaviyo-checkout',
    path: '/klaviyo/restore-checkout/:token/:cartId',
    beforeEnter: (to, from, next) => {
      const { params } = to

      Vue.prototype.$db.usersCollection.setItem('current-token', params.token)
      Vue.prototype.$db.cartsCollection.setItem('current-cart', [])
      Vue.prototype.$db.cartsCollection.setItem('current-cart-token', params.cartId)

      next({ name: 'checkout' })
    },
    component: null
  }
]

export default routes
