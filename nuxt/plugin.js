import { integrationPlugin } from '@absolute-web/vsf-core';

const moduleOptions = JSON.parse('<%= JSON.stringify(options) %>');
const defaultConfig = {};

export default integrationPlugin(({ integration }) => {
  const settings = {
    ...defaultConfig,
    ...moduleOptions,
  };

  integration.configure('klaviyo', settings);
});
