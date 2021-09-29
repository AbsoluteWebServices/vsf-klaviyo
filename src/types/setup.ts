import { AxiosInstance } from 'axios';

export interface ClientInstance extends AxiosInstance {
}

export interface ClientConfig {
  apiUrl: string;
  publicKey: string;
  privateKey?: string;
  listId?: string;
  backInStock?: {
    apiUrl: string;
    listId: string;
    platform: string;
  }
}

export interface Config extends ClientConfig {
  client?: ClientInstance;
}
