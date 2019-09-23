import SubscriptionStatus from '../mixins/SubscriptionStatus'
import Subscribe from '../mixins/Subscribe'
import Unsubscribe from '../mixins/Unsubscribe'

export const Newsletter = {
  name: 'Newsletter',
  mixins: [SubscriptionStatus, Subscribe, Unsubscribe]
}