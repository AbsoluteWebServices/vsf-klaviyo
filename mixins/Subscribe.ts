import { required, email } from 'vuelidate/lib/validators'

export default {
  name: 'KlaviyoSubscribe',
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
    subscribe (success?: Function, failure?: Function) {
      // argument omitted for validation purposes
      if (!this.$v.$invalid) {
        this.$store.dispatch('klaviyo/subscribe', this.email).then(res => {
          if (success) success(res)
        }).catch(err => {
          if (failure) failure(err)
        })
      }
    },
    klaviyoSubscribeAdvanced (RequestData?: Object, success?: Function, failure?: Function) {
      if (!this.$v.$invalid) {
        this.$store.dispatch('klaviyo/subscribeAdvanced', RequestData).then(res => {
          if (success) success(res)
        }).catch(err => {
          if (failure) failure(err)
        })
      }
    }
  }
}
