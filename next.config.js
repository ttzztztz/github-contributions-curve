module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.node = {
        fs: "empty",
        net: "empty",
        tls: "empty",
        child_process: "empty"
      };
    }

    return config;
  },
};
