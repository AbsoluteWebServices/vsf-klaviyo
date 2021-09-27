import { Context, SubscribeParams } from '../types';

export default async (
  { config, client }: Context,
  params: SubscribeParams
): Promise<boolean> => {
  const { apiUrl, privateKey, listId } = config;

  if (!apiUrl || !privateKey || !listId) {
    return false;
  }

  const endpont = `${apiUrl}/v2/list/${listId}/subscribe?api_key=${privateKey}`;

  try {
    const response = await client.post(endpont, params);

    if (response.status !== 200) {
      throw response.data;
    }

    return true;
  } catch (err: any) {
    throw err;
  }
}
