import rootStore from '@vue-storefront/core/store'
import { formatProductLink } from '@vue-storefront/core/modules/url/helpers'
import { router } from '@vue-storefront/core/app'

export const mapCustomer = (user) => {
  return {
    '$email': user.email,
    '$first_name': user.firstname,
    '$last_name': user.lastname
  }
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

      if (product.extension_attributes.category_links.indexOf(category.id) !== -1) {
        categories.push(category.name)
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
  let link = router.resolve({ name: 'checkout' })
  let products = []

  for (let i = 0; i < cart.cartItems.length; i++) {
    const product = cart.cartItems[i]
    products.push(mapLineItem(product))
  }

  return {
    '$event_id': cart.cartServerToken,
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

  let categories = []
  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    for (let j = 0; j < product.categories.length; j++) {
      const category = product.categories[j]
      if (categories.indexOf(category) === -1) {
        categories.push(category)
      }
    }
  }

  return {
    '$event_id': order.id.toString(),
    '$value': order.cart.platformTotals.grand_total,
    'ItemNames': products.map(prod => prod.ProductName),
    'Categories': categories,
    // 'Discount Code': 'Free Shipping',
    'Discount Value': order.cart.platformTotals.discount_amount,
    'Items': products
  }
}

export const mapOrderedProduct = (order, product) => {
  return {
    '$event_id': order.id.toString() + '_' + product.id.toString(),
    '$value': product.price * product.qty,
    ...mapLineItem(product)
  }
}
