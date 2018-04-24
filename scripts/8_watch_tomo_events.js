const Web3 = require('web3');
var contract = require('truffle-contract');

var web3 = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/_ws'));

var bboTokenSaleAddressOwner = '0xb10ca39DFa4903AE057E8C26E39377cfb4989551';
var tomoCoinAddress = '0x4147407d405913fabcd5d2b6d1b18a4687bf024d';
var bboTokenSaleAddress = '0xa4B423FA6316D8448919cED452b47b2dE8E736cc';
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
    // check tx already cal by token sale?
    BBOTokenSale.getDepositTxMap(args["_txn"], {from:bboTokenSaleAddressOwner}).then(function(depositAmount){
    	// check tx already cal by token sale? 
    	if(depositAmount == 0){
    		// send erc20 too user
    		var tx = BBOTokenSale.erc20Buy( args["from"], args["value"], "TOMO", args["_txn"], {from:bboTokenSaleAddressOwner});
    	}
    });
    
  }
}).on('changed', function(event){
	    // remove event from local database
	    console.log('event', event);
	}).on('error',function(error){
		console.log('error', error);
	});

