const Web3 = require('web3');
var contract = require('truffle-contract');
const HDWalletProvider = require("truffle-hdwallet-provider-privkey");
var privKeys = 'c3f1df2176c5bb432d970ecc4ceae7e7003829970c353cb132a816ed53e48e5f';


var web3wss = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/_ws'));
var web3http = new Web3(new HDWalletProvider(privKeys,'https://rinkeby.infura.io/uRdRN3kMxpZgUJ2DXXDP'));

var bboTokenSaleAddressOwner = '0xb10ca39dfa4903ae057e8c26e39377cfb4989551';
var tomoCoinAddress = '0x4147407d405913fabcd5d2b6d1b18a4687bf024d';
var bboTokenSaleAddress = '0xa4B423FA6316D8448919cED452b47b2dE8E736cc';
var tomoReceivedAddress = '0x4E6B0EA30F13FF8A1aD799f70fd18947De575e5d';
var tomoArtifacts = require('../abi/tomo.json');
var TomoCoin = contract(tomoArtifacts);
var tomoContract = new web3wss.eth.Contract(TomoCoin.abi, tomoCoinAddress);

var bboArtifacts = require('../build/contracts/BigbomTokenSecondSale.json');
var TokenSaleAbi = contract(bboArtifacts);
var BBOTokenSale = new web3http.eth.Contract(TokenSaleAbi.abi, bboTokenSaleAddress);

console.log("Starting listner ....");
var lastestBlock = 3092417;


var newTransferEvent = tomoContract.events.Transfer({from: lastestBlock, address: tomoReceivedAddress}, function(error, result){
  if (result !== undefined && result != null) {
    var args = result.returnValues;
    args["_txn"] = result.transactionHash;
    lastestBlock = result.blockNumber;
    console.log(args);
    // check tx already cal by token sale?
    var c = callBBOContract(args);
    
  }
}).on('changed', function(event){
	    // remove event from local database
	    console.log('event', event);
	}).on('error',function(error){
		console.log('error', error);
	});


function callBBOContract(args){
    return BBOTokenSale.methods.getDepositTxMap(args["_txn"]).call({from:bboTokenSaleAddressOwner, gasPrice: web3http.utils.toWei('45', 'gwei'), gas: 4000000}, function(error, depositAmount){
        console.log('depositAmount', depositAmount);
        if(depositAmount == 0 && args["value"] > 0){
            return BBOTokenSale.methods.erc20Buy( args["from"], args["value"], "TOMO", args["_txn"]).send({from:bboTokenSaleAddressOwner, gasPrice: web3http.utils.toWei('45', 'gwei'), gas: 4000000});
        }else{
            return false;
        }
    }).then(function(result){
        console.log('result', result);
    });
}