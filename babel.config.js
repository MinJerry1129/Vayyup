module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
          'svg',
        ],
        alias: {
          models: './src/models',
          src: './src',
          screens: './src/screens',
          navigation: './src/navigation',
          components: './src/components',
          'common-components': './src/common-components',
          state: './src/state',
          services: './src/services',
        },
      },
    ],
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
