const Web3 = require('web3');
var contract = require('truffle-contract');
const HDWalletProvider = require("truffle-hdwallet-provider-privkey");
var privKeys = 'a4441292066b9ca53906d183b2d3d16d34c1328424874219f1de4a5f6417554c';


var web3wss = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8546'));
var web3http = new Web3(new HDWalletProvider(privKeys,'http://localhost:8545'));

var bboTokenSaleReceiveERC20Owner = '0x4E6B0EA30F13FF8A1aD799f70fd18947De575e5d';
var tomoCoinAddress = '0x8ba166ae1fbbb2658aba37229161ec2f03786f8f';
var bboTokenSaleAddress = '0xee0337909218993e6f95be07349cbb729858e537';

var tomoArtifacts = require('../abi/tomo.json');
var TomoCoin = contract(tomoArtifacts);
var tomoContract = new web3http.eth.Contract(TomoCoin.abi, tomoCoinAddress);

var kncArtifacts = require('../abi/knc.json');
var KNCoin = contract(kncArtifacts);
var kncContract = new web3http.eth.Contract(KNCoin.abi, kncCoinAddress);

var bboArtifacts = require('../build/contracts/BigbomTokenSecondSale.json');
var TokenSaleAbi = contract(bboArtifacts);
var BBOTokenSale = new web3wss.eth.Contract(TokenSaleAbi.abi, bboTokenSaleAddress);

console.log("Starting listner ....");
var lastestBlock = 3092417;


var refundEvents = BBOTokenSale.events.Erc20Refund({}, function(error, result){
  if (result !== undefined && result != null) {
    var args = result.returnValues;
    args["_txn"] = result.transactionHash;
    lastestBlock = result.blockNumber;
    console.log(args);
    // check tx already cal by token sale?
    var c = callERC20Contract(args);
    
  }
}).on('changed', function(event){
	    // remove event from local database
	    console.log('event', event);
	}).on('error',function(error){
		console.log('error', error);
	});


function callERC20Contract(args){
    if (args['_erc20Name'] == 'TOMO'){
        return tomoContract.methods.transfer(args['_buyer'], args['_erc20RefundAmount']).send({from:bboTokenSaleReceiveERC20Owner, gasPrice: web3http.utils.toWei('45', 'gwei'), gas: 4000000}).then(function(result){
            console.log('result', result);
        });
    }
    if (args['_erc20Name'] == 'KNC'){
        return kncContract.methods.transfer(args['_buyer'], args['_erc20RefundAmount']).send({from:bboTokenSaleReceiveERC20Owner, gasPrice: web3http.utils.toWei('45', 'gwei'), gas: 4000000}).then(function(result){
            console.log('result', result);
        });
    }
}