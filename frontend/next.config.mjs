/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@stellar/stellar-sdk', '@stellar/freighter-api'],
  webpack: (config, { isServer, webpack }) => {
    config.externals = [...(config.externals || []), { 'sodium-native': 'js-base64' }];
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        dns: false,
        net: false,
        tls: false,
        child_process: false,
        stream: false,
        http: false,
        https: false,
      };
    }

    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /sodium-native/,
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      })
    );

    return config;
  },
};

export default nextConfig;
