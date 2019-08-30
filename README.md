# Vue Storefront Klaviyo Extension

The Klaviyo integration module for [vue-storefront](https://github.com/DivanteLtd/vue-storefront).

## Installation

By hand (preferer):

```shell
git clone git@github.com:AbsoluteWebServices/vsf-klaviyo.git ./vue-storefront/src/modules/
```

Registration the Klaviyo module. Go to `./vue-storefront/src/modules/index.ts`

```js
...
import { Klaviyo } from './vsf-klaviyo';

export const registerModules: VueStorefrontModule[] = [
  ...
  Klaviyo
]
```

Add following settings to your config file. If you want to use different lists for multistore you need to add all list ids to **multistoreListIds**.

```json
  "klaviyo": {
    "public_key": "__YOUR_PUBLIC_KEY__",
    "endpoint": {
      "api": "https://a.klaviyo.com/api",
      "subscribe": "http://localhost:8080/api/ext/klaviyo/subscribe",
      "backInStock": "https://a.klaviyo.com/onsite/components/back-in-stock/subscribe"
    },
    "listId": "__NEWSLETTER_LIST_ID__",
    "multistoreListIds": {
      "es": "__ES_LIST_ID__",
      "eu": "__EU_LIST_ID__",
      "it": "__IT_LIST_ID__",
      ...
    },
    "platform": "magento_two"
  },
```

Add Subscribe/Unsubscripe components as mixins

```
...
import { Subscribe } from 'src/modules/vsf-klaviyo/components/Subscribe'

export default {
  ...
  mixins: [Subscribe],
  ...
}
```

```html
<form @submit.prevent="klaviyoSubscribe(onSuccess, onFailure)">
<!-- Your subscribe form -->
</form>
```

## Klaviyo API extension

Install additional extension for `vue-storefront-api`:

```shell
cp -f ./vue-storefront/src/modules/vsf-klaviyo/API/klaviyo ./vue-storefront-api/src/api/extensions/
```

Add the config to your api config. If you want to use different lists for multistore you need to add all list ids to **multistoreListIds**.

```json
  "extensions":{
    "klaviyo": {
      "apiKey": "__YOUR_PRIVATE_KEY__",
      "apiUrl": "https://a.klaviyo.com/api",
      "listId": "__NEWSLETTER_LIST_ID__",
      "multistoreListIds": {
        "es": "__ES_LIST_ID__",
        "eu": "__EU_LIST_ID__",
        "it": "__IT_LIST_ID__",
        ...
      }
    },
    ...
  },
  "registeredExtensions": [
    "klaviyo",
    ...
  ],
```