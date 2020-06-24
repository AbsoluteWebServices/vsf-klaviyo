# Vue Storefront Klaviyo Module

The Klaviyo integration module for [vue-storefront](https://github.com/DivanteLtd/vue-storefront).

## Installation

By hand (preferer):

```shell
git clone git@github.com:AbsoluteWebServices/vsf-klaviyo.git ./vue-storefront/src/modules/vsf-klaviyo
```

Registration the Klaviyo module. Go to `./vue-storefront/src/modules/client.ts`

```js
...
import { KlaviyoModule } from './vsf-klaviyo';

export function registerClientModules () {
  ...
  registerModule(KlaviyoModule)
}
```

Add settings from local.json to your config file. If you want to use different lists for multistore you need to add all list ids to **multistoreListIds**.

## Usage

Add Subscribe/Unsubscripe components as mixins

```js
...
import { Subscribe } from 'src/modules/vsf-klaviyo/components/Subscribe'

export default {
  ...
  mixins: [Subscribe],
  ...
}
```

### Simple subscribe

```html
<form @submit.prevent="klaviyoSubscribe(onSuccess, onFailure)">
<!-- Your subscribe form -->
</form>
```

### Advanced

`klaviyoSubscribeAdvanced` - allow custom profile properties and custom list ID
```html
<form @submit.prevent="klaviyoSubscribeAdvanced(requestData, onSuccess, onFailure)">
<!-- Your subscribe form -->
</form>
```

Example request data
```js
{
  '$source': 'Source',
  first_name: 'Name',
  last_name: 'Last Name',
  email: 'Email',
  'Custom Property': 'Custom property 1',
  'Custom Property 2': 'Custom property 2',
  listId: '__XXXX__'
}
```

## Klaviyo API extension

Install additional extension for `vue-storefront-api`: [vsf-api-klaviyo](https://github.com/AbsoluteWebServices/vsf-api-klaviyo).
