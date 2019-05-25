export const Unsubscribe = {
  name: 'KlaviyoUnsubscribe',
  methods: {
    klaviyoUnsubscribe () {
      this.$store.dispatch('klaviyo/unsubscribe', this.email).then(res => {
        this.$emit('unsubscribed', res)
      }).catch(err => 
        this.$emit('unsubscription-error', err)
      )
    } 
  },
  computed: {
    klaviyoSubscribed () {
      return this.$store.state.klaviyo.isSubscribed
    }
  }
}
  