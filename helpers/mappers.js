import rootStore from '@vue-storefront/core/store'
import { formatProductLink } from '@vue-storefront/core/modules/url/helpers'
import { router } from '@vue-storefront/core/app'

export const mapPersonalDetails = (details) => {
  let customer = {
    '$email': details.emailAddress
  }

  if (details.firstName) {
    customer['$first_name'] = details.firstName
  }

  if (details.lastName) {
    customer['$last_name'] = details.lastName
  }

  return customer
}

export const mapCustomer = (user) => {
  let customer = {
    '$email': user.email
  }

  if (user.firstname) {
    customer['$first_name'] = user.firstname
  }

  if (user.lastname) {
    customer['$last_name'] = user.lastname
  }

  return customer
}

export const mapProduct = (product) => {
  let route = formatProductLink(product, rootStore.state.storeView.storeCode)
  let link = router.resolve(route)
  let categories = []

  if (product.hasOwnProperty('category')) {
    categories = product.category.map(cat => cat.name)
  } else if (product.hasOwnProperty('extension_attributes') &&
    product.extension_attributes.hasOwnProperty('category_links') &&
    !!product.extension_attributes.category_links.length &&
    !!rootStore.state.category.list.length) {
    for (let i = 0; i < rootStore.state.category.list.length; i++) {
      const category = rootStore.state.category.list[i]

      for (let j = 0; j < product.extension_attributes.category_links.length; j++) {
        const productCategory = product.extension_attributes.category_links[j]
        if (productCategory.category_id === category.id) {
          categories.push(category.name)
        }
      }
    }
  }

  return {
    'ProductID': product.id.toString(),
    'SKU': product.sku,
    'ProductName': product.name,
    'ItemPrice': product.price.toString(),
    'Categories': categories,
    'ProductURL': window.location.origin + link.href,
    'ImageURL': window.location.origin + product.image,
    'CompareAtPrice': product.special_price
  }
}

export const mapLineItem = (product) => {
  return {
    ...mapProduct(product),
    'Quantity': product.qty.toString(),
    'RowTotal': product.price * product.qty
  }
}

export const mapCart = (cart) => {
  let userToken = rootStore.getters['user/getUserToken']
  let cartId = cart.cartServerToken
  let link = router.resolve({ name: 'checkout', query: { userToken, cartId } })
  let products = []

  for (let i = 0; i < cart.cartItems.length; i++) {
    const product = cart.cartItems[i]
    products.push(mapLineItem(product))
  }

  return {
    '$event_id': cartId,
    '$value': cart.platformTotals.grand_total,
    'ItemNames': products.map(prod => prod.ProductName),
    'CheckoutURL': window.location.origin + link.href,
    'Items': products
  }
}

export const mapOrder = (order) => {
  let products = []

  for (let i = 0; i < order.products.length; i++) {
    const product = order.products[i]
    products.push(mapLineItem(product))
  }

  let subtotal = 0
  let categories = []
  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    subtotal += product.RowTotal
    for (let j = 0; j < product.Categories.length; j++) {
      const category = product.Categories[j]
      if (categories.indexOf(category) === -1) {
        categories.push(category)
      }
    }
  }

  let result = {
    '$event_id': order.order_id.toString(),
    '$value': subtotal,
    'ItemNames': products.map(prod => prod.ProductName),
    'Categories': categories,
    'Items': products
  }

  if (order.cart) {
    result['$value'] = order.cart.platformTotals.grand_total
    if (order.cart.platformTotals.discount_amount) {
      // result['Discount Code'] = 'Free Shipping'
      result['Discount Value'] = order.cart.platformTotals.discount_amount
    }
  }

  return result
}

export const mapOrderedProduct = (order, product) => {
  return {
    '$event_id': order.id.toString() + '_' + product.id.toString(),
    '$value': product.price * product.qty,
    ...mapLineItem(product)
  }
}
