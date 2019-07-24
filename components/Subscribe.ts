import { required, email } from "vuelidate/lib/validators";

export const Subscribe = {
  name: "KlaviyoSubscribe",
  data() {
    return {
      email: ""
    };
  },
  validations: {
    email: {
      required,
      email
    }
  },
  methods: {
    klaviyoSubscribe(success?: Function, failure?: Function) {
      // argument omitted for validation purposes
      if (!this.$v.$invalid) {
        this.$store
          .dispatch("klaviyo/subscribe", this.email)
          .then(res => {
            if (success) success(res);
          })
          .catch(err => {
            if (failure) failure(err);
          });
      }
    }
  },
  computed: {
    klaviyoSubscribed(): boolean {
      return this.$store.state.klaviyo.isSubscribed;
    }
  }
};
