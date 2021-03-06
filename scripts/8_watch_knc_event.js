const Web3 = require('web3');
var contract = require('truffle-contract');
const HDWalletProvider = require("truffle-hdwallet-provider-privkey");
var privKeys = '';
var privKeyRefund = '';



var web3wss = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8546'));
var web3http = new Web3(new HDWalletProvider(privKeys,'http://localhost:8545'));

var web3httpRefund = new Web3(new HDWalletProvider(privKeyRefund,'http://localhost:8545'));

var bboTokenSaleAddressOwner = '0xb10ca39dfa4903ae057e8c26e39377cfb4989551';
var kncCoinAddress = '0xfde7c12ae8d5e2e6d998d09cf68b21f3e1bbea0d';
var bboTokenSaleAddress = '0xfAdFB2783d7f7cB4Aa737495b786Ac8B23C4719e';
var kncReceivedAddress = '0x4E6B0EA30F13FF8A1aD799f70fd18947De575e5d';

var kncArtifacts = require('../abi/knc.json');
var KncCoin = contract(kncArtifacts);
var kncContract = new web3wss.eth.Contract(KncCoin.abi, kncCoinAddress);
var kncContractRefund = new web3httpRefund.eth.Contract(KncCoin.abi, kncCoinAddress);

var bboArtifacts = require('../build/contracts/BigbomCrowdSale.json');
var TokenSaleAbi = contract(bboArtifacts);
var BBOTokenSale = new web3http.eth.Contract(TokenSaleAbi.abi, bboTokenSaleAddress);

console.log("Starting listner ....");
var lastestBlock = 3092417;


var newTransferEvent = kncContract.events.Transfer({filter:{_to: kncReceivedAddress}}, function(error, result){
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


function refundKNC(args){
    return kncContractRefund.methods.transfer(args["_from"], args["_value"]).send({from:kncReceivedAddress, gasPrice: web3http.utils.toWei('45', 'gwei'), gas: 4000000});
}

function callBBOContract(args){
    return BBOTokenSale.methods.getDepositTxMap(args["_txn"]).call({from:bboTokenSaleAddressOwner, gasPrice: web3http.utils.toWei('45', 'gwei'), gas: 4000000}, function(error, depositAmount){
        console.log('depositAmount', depositAmount);
        if(depositAmount == 0 && args["_value"] > 0){
            return BBOTokenSale.methods.erc20Buy( args["_from"], args["_value"], "KNC", args["_txn"]).send({from:bboTokenSaleAddressOwner, gasPrice: web3http.utils.toWei('45', 'gwei'), gas: 4000000}).then(function(result){
                console.log('result', result);
                return true;
            }, function(err){
                 console.log('err', err);
                if( err.message.search('Transaction ran out of gas') >= 0 )

                    return refundKNC(args);
                else
                    return true;
            });
        }else{
            return false;
        }
    }).then(function(result){
        console.log('result', result);
    }, function(err){
         console.log('err', err);
    });
}