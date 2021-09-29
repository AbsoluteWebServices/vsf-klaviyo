import { URLSearchParams } from 'url';
import { BackInStockSubscribeParams, Context } from '../types';

export default async (
  { config, client }: Context,
  params: BackInStockSubscribeParams
): Promise<boolean> => {
  const { backInStock, publicKey } = config;

  if (!backInStock || !backInStock.apiUrl || !backInStock.listId || !publicKey) {
    return false;
  }

  const endpoint = `${backInStock.apiUrl}/subscribe`;
  const data = new URLSearchParams();

  data.append('a', publicKey);
  data.append('g', backInStock.listId)
  data.append('email', params.email);
  data.append('product', params.productId);
  data.append('variant', params.variantId || params.productId);
  data.append('platform', backInStock.platform);
  // data.append('store', 3);

  if (params.subscribe) {
    data.append('subscribe_for_newsletter', String(params.subscribe));
  }

  try {
    const response = await client.post(endpoint, data.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (response.status !== 200) {
      throw response.data;
    }

    return response.data.success;
  } catch (err: any) {
    throw err;
  }
}
