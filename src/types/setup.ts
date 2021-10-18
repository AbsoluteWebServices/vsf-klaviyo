export interface ClientInstance {
  post(url: string, body: any, options?: any): Promise<any>;
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
