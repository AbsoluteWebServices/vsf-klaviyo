import { required, email } from 'vuelidate/lib/validators'

export default {
  name: 'KlaviyoSubscriptionStatus',
  data () {
    return {
      email: '',
      user: {
        isSubscribed: false
      }
    }
  },
  validations: {
    email: {
      required,
      email
    }
  },
  methods: {
    onLoggedIn () {
      this.email = this.$store.state.user.current.email
      this.checkStatus(response => {
        this.user.isSubscribed = response
      })
    },
    checkStatus (success?: Function, failure?: Function) {
      // argument omitted for validation purposes
      if (!this.$v.$invalid) {
        return this.$store.dispatch('klaviyo/status', this.email).then(res => {
          if (success) success(res)
        }).catch(err => {
          if (failure) failure(err)
        })
      }
    }
  },
  beforeMount () {
    // the user might already be logged in, so check the subscription status
    if (this.$store.state.user.current) this.onLoggedIn()
    this.$bus.$on('user-after-loggedin', this.onLoggedIn)
  },
  beforeDestroy () {
    this.$bus.$off('user-after-loggedin', this.onLoggedIn)
  }
}
