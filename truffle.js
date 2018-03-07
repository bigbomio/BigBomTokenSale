module.exports = {
  networks: {
    development: {
      host: "159.89.210.224",
      port: 8545,
      password: "bigbom",
      from: "0x4e6b0ea30f13ff8a1ad799f70fd18947de575e5d",
      gas: 4704624,
      network_id: "*" // Match any network id
    }
  }
};
