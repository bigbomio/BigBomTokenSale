const HDWalletProvider = require("truffle-hdwallet-provider-privkey");
var privKeys = 'c3f1df2176c5bb432d970ecc4ceae7e7003829970c353cb132a816ed53e48e5f'; // private keys

module.exports = {
  networks: {
    development: {
      provider: () => {
        return new HDWalletProvider(privKeys, "https://ropsten.infura.io/Pc3wAsfTDLKR1nnqzI7h")
      },
      from: "0xb10ca39dfa4903ae057e8c26e39377cfb4989551",
      gas: 4700036,
      network_id: 3 // Match any network id
    },
    tomo: {
      provider: () => {
        return new HDWalletProvider(privKeys, "https://core.tomocoin.io")
      },
      from: "0xb10ca39dfa4903ae057e8c26e39377cfb4989551",
      gas: 4700000, // <-- Use this high gas value
      gasPrice: 20000,
      network_id: "*" // Match any network id
    },
    coverage: {
      host: "localhost",
      network_id: "*",
      testrpcOptions: ' -e 10000',
      port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
      gas: 4700000, // <-- Use this high gas value
      gasPrice: 100      // <-- Use this low gas price
    },
    test: {
      host: "localhost",
      network_id: "*",
      port: 8545,         // <-- If you change this, also set the port option in .solcover.js.
      gas: 4700000, // <-- Use this high gas value
    }
  },

};
