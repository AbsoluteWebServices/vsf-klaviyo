import { Context, TrackParams } from '../types';

export default async (
  { config, client }: Context,
  params: TrackParams
): Promise<boolean> => {
  const { apiUrl, publicKey } = config;

  if (!apiUrl || !publicKey) {
    return false;
  }

  const endpont = `${apiUrl}/track`;
  const data = {
    token: publicKey,
    ...params,
  };

  try {
    const response = await client.post(endpont, data);

    if (response.status !== 200) {
      throw response.data;
    }

    return response.data === 1;
  } catch (err: any) {
    throw err;
  }
}
