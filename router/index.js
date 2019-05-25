import Vue from 'vue'

let routes = [
  {
    name: 'klaviyo-checkout',
    path: '/klaviyo/restore-checkout/:token/:cartId',
    redirect: to => {
      const { params } = to

      Vue.prototype.$db.usersCollection.setItem('current-token', params.token)
      Vue.prototype.$db.cartsCollection.setItem('current-cart', [])
      Vue.prototype.$db.cartsCollection.setItem('current-cart-token', params.cartId)

      return { name: 'checkout' }
    }
  }
]

export default routes
