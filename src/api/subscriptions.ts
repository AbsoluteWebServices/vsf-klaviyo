import { Context, SubscriptionInfo, SubscriptionsParams } from '../types';

export default async (
  { config, client }: Context,
  params: SubscriptionsParams
): Promise<SubscriptionInfo[]> => {
  const { apiUrl, privateKey, listId } = config;

  if (!apiUrl || !privateKey || !listId) {
    return [];
  }

  const endpont = `${apiUrl}/v2/list/${listId}/get-list-subscriptions`;
  const data = {
    api_key: privateKey,
    ...params,
  };

  try {
    const response = await client.post(endpont, data);

    if (response.status !== 200) {
      throw response.data;
    }

    return response.data;
  } catch (err: any) {
    throw err;
  }
}
