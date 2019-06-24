<template>
  <form if="back-in-stock-form" @submit="onSubmit">
    <div class="form-group">
      <input
        v-model="email"
        type="email"
        name="email"
        id="back-in-stock-email"
        class="input"
        :placeholder="$t('Email')"
      >
    </div>
    <div v-if="newsletter && !subscribed" class="form-group">
      <label class="checkbox">
        <input
          v-model="subscribe"
          type="checkbox"
          name="newsletter"
          id="back-in-stock-newsletter"
        >
        <span>{{ $t('Subscribe me for the newsletter.') }}</span>
      </label>
    </div>
    <div class="form-group">
      <button class="button" type="submit">{{ $t('Notify me when available') }}</button>
    </div>
  </form>
</template>

<script>
import rootStore from '@vue-storefront/core/store'

export default {
  name: 'BackInStock',
  props: {
    product: {
      type: Object,
      required: true
    },
    newsletter: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      email: rootStore.state.klaviyo.customer ? rootStore.state.klaviyo.customer['$email'] : null,
      subscribe: false
    }
  },
  computed: {
    subscribed () {
      return rootStore.state.klaviyo.isSubscribed
    }
  },
  methods: {
    onSubmit (e) {
      e.preventDefault()
      rootStore.dispatch('klaviyo/backInStockSubscribe', {
        product: this.product,
        email: this.email,
        subscribeForNewsletter: this.subscribe
      }).then(res => {
        this.$emit('submit')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.form-group + .form-group {
  margin-top: 1rem;
}

.input {
  width: 100%;
  border: 1px solid gray;
  padding: 0.5rem 1rem;
}

.checkbox {
  display: flex;
  align-items: center;

  input {
    margin-right: 0.25rem;
  }
}

.button {
  display: block;
  width: 100%;
  text-align: center;
  border: 1px solid gray;
  background-color: white;
  padding: 0.5rem 1rem;
}
</style>
