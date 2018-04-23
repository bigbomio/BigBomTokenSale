const Web3 = require('web3');
var contract = require('truffle-contract');

var web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));

var bboTokenSaleAddressOwner = '0xb10ca39DFa4903AE057E8C26E39377cfb4989551';
var tomoCoinAddress = '0x8ba166ae1fbbb2658aba37229161ec2f03786f8f';
var bboTokenSaleAddress = '';
var tomoReceivedAddress = '0x4E6B0EA30F13FF8A1aD799f70fd18947De575e5d';
var tomoArtifacts = require('../abi/tomo.json');
var TomoCoin = contract(tomoArtifacts);
var tomoContract = new web3.eth.Contract(TomoCoin.abi, tomoCoinAddress);

var bboArtifacts = require('../build/contracts/BigbomTokenSecondSale.json');
var TokenSaleAbi = contract(bboArtifacts);
var BBOTokenSale = new web3.eth.Contract(TokenSaleAbi.abi, bboTokenSaleAddress);

console.log("Starting listner ....");
var lastestBlock = 3092417;


var newTransferEvent = tomoContract.events.Transfer({from: lastestBlock, address: tomoReceivedAddress}, function(error, result){
  if (result !== undefined && result != null) {
    var args = result.returnValues;
    args["_txn"] = result.transactionHash;
    lastestBlock = result.blockNumber;
    console.log(result);
    // TODO
    //var tx = BBOTokenSale.erc20Buy( args["from"], args["value"], "TOMO", args["_txn"], {from:bboTokenSaleAddressOwner});
    //console.log(tx);
  }
}).on('changed', function(event){
	    // remove event from local database
	    console.log('event', event);
	}).on('error',function(error){
		console.log('error', error);
	});

function watchNewTransaction(block){
	var newTransferEvent = tomoContract.events.Transfer({from: lastestBlock, address: tomoReceivedAddress}, function(error, result){
	  if (result !== undefined && result != null) {
	    var args = result.returnValues;
	    args["_txn"] = result.transactionHash;
	    lastestBlock = result.blockNumber;
	    console.log(result);
	    // TODO
	    //var tx = BBOTokenSale.erc20Buy( args["from"], args["value"], "TOMO", args["_txn"], {from:bboTokenSaleAddressOwner});
	    //console.log(tx);
	  }
	}).on('changed', function(event){
	    // remove event from local database
	});

}