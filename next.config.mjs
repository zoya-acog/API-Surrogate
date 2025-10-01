/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      // Add WASM support
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
      }
  
      // Add rule for WASM files
      config.module.rules.push({
        test: /\.wasm$/,
        type: 'asset/resource',
      })
  
      return config
    },
  }
  
  export default nextConfig
  