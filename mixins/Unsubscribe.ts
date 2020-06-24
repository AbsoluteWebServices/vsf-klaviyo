import { required, email } from 'vuelidate/lib/validators'

export default {
  name: 'KlaviyoUnsubscribe',
  data () {
    return {
      email: ''
    }
  },
  validations: {
    email: {
      required,
      email
    }
  },
  methods: {
    unsubscribe () {
      this.$store.dispatch('klaviyo/unsubscribe', this.email).then(res => {
        this.$emit('unsubscribed', res)
      }).catch(err =>
        this.$emit('unsubscription-error', err)
      )
    }
  }
}
