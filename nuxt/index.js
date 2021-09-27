import path from 'path';

export default function (moduleOptions) {
  this.extendBuild((config) => {
    // eslint-disable-next-line no-param-reassign
    config.resolve.alias['@absolute-web/vsf-klaviyo$'] = require.resolve('@absolute-web/vsf-klaviyo');
  });

  const { head } = this.options

  if (moduleOptions.appendScript && moduleOptions.publicKey && head) {
    const scripts = head.script
    scripts.push({
      src: `https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${moduleOptions.publicKey}`,
      async: true,
    })
  }

  this.addPlugin({
    src: path.resolve(__dirname, './plugin.js'),
    options: moduleOptions
  });
}
