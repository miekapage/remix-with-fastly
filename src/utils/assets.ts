enum AssetType {
  ico = 'image/x-icon',
  css = 'text/css',
  js = 'text/javascript',
}

const assets = require.context('../../public', true, /\.(css|ico|js)$/);

export default assets.keys().reduce(
  (accumulator, key) => ({
    ...accumulator,
    [key.replace('./', '/')]: {
      source: assets(key),
      type: AssetType[key.split('.').pop()?.toLowerCase()],
    },
  }),
  {}
);
