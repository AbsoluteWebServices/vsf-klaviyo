import { apiStatus } from '../../../lib/util'
import { Router } from 'express'

module.exports = ({ config, db }) => {
  let klaviyoApi = Router()

  /**
   * POST Subscribe to List
   */
  klaviyoApi.post('/subscribe', (req, res) => {
    let userData = req.body
    if (!userData.email) {
      apiStatus(res, 'Invalid e-mail provided!', 500)
      return
    }

    let request = require('request')
    request({
      url: config.extensions.klaviyo.apiUrl + '/v2/list/' + config.extensions.klaviyo.listId + '/subscribe',
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

    let request = require('request')
    request({
      url: config.extensions.klaviyo.apiUrl + '/v2/list/' + config.extensions.klaviyo.listId + '/subscribe',
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
