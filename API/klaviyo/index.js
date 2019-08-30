import { apiStatus } from '../../../lib/util'
import { Router } from 'express'

module.exports = ({ config, db }) => {
  let klaviyoApi = Router()

  const pickProperListId = (res, storeCode = null) => {
    if (config.storeViews.multistore === true && storeCode !== null) {
      if (!('multistoreListIds' in config.extensions.klaviyo)) {
        apiStatus(res, 'Klaviyo - Provide proper config for multistore!', 500)
      }

      if (!(storeCode in config.extensions.klaviyo.multistoreListIds)) {
        apiStatus(res, 'Klaviyo - Provided storeCode - ' + storeCode + 'does not exist', 500)
      }

      return config.extensions.klaviyo.multistoreListIds[storeCode]
    } else {
      return config.extensions.klaviyo.listId
    }
  }

  /**
   * POST Subscribe to List
   */
  klaviyoApi.post('/subscribe', (req, res) => {
    let userData = req.body

    if (!userData.email) {
      apiStatus(res, 'Invalid e-mail provided!', 500)
      return
    }

    let listId = null

    if (config.storeViews.multistore === true) {
      if (!userData.storeCode) {
        apiStatus(res, 'Provide storeCode!', 500)
        return
      }
      listId = pickProperListId(res, userData.storeCode)
    } else {
      listId = pickProperListId(res)
    }

    let request = require('request')

    request({
      url: config.extensions.klaviyo.apiUrl + '/v2/list/' + listId + '/subscribe',
      method: 'POST',
      headers: { 'api-key': config.extensions.klaviyo.apiKey },
      json: true,
      body: { profiles: [ { email: userData.email } ] }
    }, (error, response, body) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        apiStatus(res, body, 200)
      }
    })
  })

  /**
   * DELETE delete an user
   */
  klaviyoApi.delete('/subscribe', (req, res) => {
    let userData = req.body

    if (!userData.email) {
      apiStatus(res, 'Invalid e-mail provided!', 500)
      return
    }

    let listId = null

    if (config.storeViews.multistore === true) {
      if (!userData.storeCode) {
        apiStatus(res, 'Provide storeCode!', 500)
        return
      }
      listId = pickProperListId(res, userData.storeCode)
    } else {
      listId = pickProperListId(res)
    }

    let request = require('request')

    request({
      url: config.extensions.klaviyo.apiUrl + '/v2/list/' + listId + '/subscribe',
      method: 'DELETE',
      headers: { 'api-key': config.extensions.klaviyo.apiKey },
      json: true,
      body: { emails: [ userData.email ] }
    }, (error, response, body) => {
      if (error) {
        apiStatus(res, error, 500)
      } else {
        apiStatus(res, body, 200)
      }
    })
  })

  return klaviyoApi
}
