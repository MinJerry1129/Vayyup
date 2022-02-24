module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts/', './assets/icons/'],
  dependencies: { 'react-native-video': { platforms: { android: { sourceDir: '../node_modules/react-native-video/android-exoplayer', }, }, }, },
};
