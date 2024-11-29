import { WebpackOverrideFn } from '@remotion/bundler';

export const webpackOverride: WebpackOverrideFn = (currentConfiguration) => {
  return {
    ...currentConfiguration,
    resolve: {
      ...currentConfiguration.resolve,
      fallback: {
        ...currentConfiguration.resolve?.fallback,
        constants: require.resolve('constants-browserify'),
        path: require.resolve('path-browserify'),
        os: require.resolve('os-browserify/browser'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        util: require.resolve('util/'),
        net: false,
        child_process: false,
        perf_hooks: false,
        fs: false,
        worker_threads: false,
        '@remotion/compositor-win32-x64-msvc': false,
        '@remotion/compositor-darwin-arm64': false,
        '@remotion/compositor-linux-x64-musl': false,
        '@remotion/compositor-linux-x64-gnu': false,
        '@remotion/compositor-linux-arm64-musl': false,
        '@remotion/compositor-linux-arm64-gnu': false,
      },
    },
    plugins: [
      ...(currentConfiguration.plugins ?? []),
      // @ts-ignore
      new (require('webpack').ProvidePlugin)({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
  };
};
