import config from 'config'
import rootStore from '@vue-storefront/core/store'
import { formatProductLink } from '@vue-storefront/core/modules/url/helpers'
import { localizedDispatcherRoute } from '@vue-storefront/core/lib/multistore'
import { getThumbnailPath, productThumbnailPath } from '@vue-storefront/core/helpers'
import { router } from '@vue-storefront/core/app'
import omit from 'lodash-es/omit'

export const mapAddress = (address) => {
  return {
    '$city': address.city,
    'City': address.city,
    '$region': address.state || (address.region && address.region.region) || address.region || address.region_code || null,
    'State / Region': address.state || (address.region && address.region.region) || address.region || address.region_code || null,
    '$country': address.country || address.country_id,
    'Country': address.country || address.country_id,
    '$zip': address.zipCode || address.postcode,
    'Zip Code': address.zipCode || address.postcode,
    'Address': address.streetAddress || (address.street && address.street[0]) || null,
    'Address 2': address.apartmentNumber || (address.street && address.street[1]) || null,
    'Latitude': address.latitude || null,
    'Longitude': address.longitude || null
  }
}

export const mapCustomer = (user) => {
  let customer = {
    '$email': user.email || user.emailAddress || user['$email'],
    '$id': user.id || undefined,
    '$first_name': user.firstname || user.firstName || user['$first_name'] || undefined,
    '$last_name': user.lastname || user.lastName || user['$last_name'] || undefined,
    '$phone_number': user.telephone || user['$phone_number'] || undefined
  }

  if (user.custom_attributes && user.custom_attributes.length) {
    const phone = user.custom_attributes.find(attribute => attribute.attribute_code === 'phone')

    if (phone) {
      customer['$phone_number'] = phone.value
    }
  }

  if ((!customer.hasOwnProperty('$phone_number') || !customer['$phone_number']) && user.extension_attributes && user.extension_attributes.phone) {
    customer['$phone_number'] = user.extension_attributes.phone
  }

  if (user.address) {
    Object.assign(customer, mapAddress(user.address))
  } else if (user.addresses && user.addresses.length) {
    const address = user.addresses.find(address => address.default) || user.addresses[0]

    Object.assign(customer, mapAddress(address))
  }

  return customer
}

export const mapProduct = (product) => {
  let route

  if (config.seo.useUrlDispatcher && product.path) {
    let routeData
    if ((product.options && product.options.length > 0) || (product.configurable_children && product.configurable_children.length > 0)) {
      routeData = {
        path: product.path,
        params: { childSku: product.sku }
      }
    } else {
      routeData = { path: product.path }
    }
    route = localizedDispatcherRoute(routeData)
  } else {
    route = formatProductLink(product, rootStore.state.storeView.storeCode)
  }

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

  let imageUrl = productThumbnailPath(product)
  if (imageUrl && !imageUrl.includes('://')) {
    imageUrl = getThumbnailPath(
      imageUrl,
      config.products.thumbnails.width,
      config.products.thumbnails.height
    )

    if (imageUrl && !imageUrl.includes('://')) {
      imageUrl = window.location.origin + imageUrl
    }
  }

  const additionalData = omit(product, ['id', 'server_cart_id', 'server_item_id', 'tax_class_id', 'sku', 'name', 'price', 'qty', 'category', 'category_ids', 'extension_attributes', 'image', 'special_price', 'info', 'stock', 'is_in_stock', 'onlineStockCheckid', 'is_returnable', 'totals', 'errors', 'product_option', 'options', 'configurable_children', 'checksum', 'tsk', 'status', 'visibility', 'gift_message_available', 'gift_wrapping_available', 'page_layout'])
  const attributes = rootStore.getters['attribute/attributeListByCode']

  for (const key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      const attribute = attributes[key];

      if (attribute.is_user_defined && additionalData.hasOwnProperty(key) && attribute.hasOwnProperty('options')) {
        // eslint-disable-next-line eqeqeq
        const option = attribute.options.find(a => a.value == additionalData[key])

        if (option) {
          additionalData[key] = option.label
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
    'ImageURL': imageUrl,
    'CompareAtPrice': product.special_price,
    ...additionalData
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
  let refreshToken = rootStore.state.user.refreshToken
  let cartId = cart.cartServerToken
  let link = router.resolve({ name: 'checkout', query: { userToken, refreshToken, cartId } })
  let products = []

  for (let i = 0; i < cart.cartItems.length; i++) {
    const product = cart.cartItems[i]
    products.push(mapLineItem(product))
  }

  return {
    '$event_id': cartId,
    '$value': cart.platformTotals ? cart.platformTotals.grand_total : products.reduce((accumulator, product) => accumulator + product.RowTotal, 0),
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
