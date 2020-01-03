module.exports = {
  presets: [
    '@babel/env',
    '@babel/preset-react',
    'react-app',
    ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/proposal-class-properties',
    '@babel/proposal-object-rest-spread',
  ],
};
