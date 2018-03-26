module.exports = {
  networks: {
    development: {
      host: "159.89.210.224",
      port: 8545,
      from: "0x4e6b0ea30f13ff8a1ad799f70fd18947de575e5d",
      gas: 4700036,
      network_id: "*" // Match any network id
    },
    
    coverage: {
      host: "localhost",
      network_id: "*",
      testrpcOptions: ' -e 10000',
      port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
      gas: 0xfffffffffff, // <-- Use this high gas value
      gasPrice: 0x01      // <-- Use this low gas price
    },
    test: {
      host: "localhost",
      network_id: "*",
      port: 8545,         // <-- If you change this, also set the port option in .solcover.js.
      gas: 4700000, // <-- Use this high gas value
    }
  },

};
