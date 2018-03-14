var WhiteList = artifacts.require("./BigbomContributorWhiteList.sol");
var TokenSale = artifacts.require("./BigbomTokenSale.sol");
var Token = artifacts.require("./BigBomToken.sol");
var PrivateList = artifacts.require("./BigbomPrivateSaleList.sol");
var Kill = artifacts.require("./mock/Killable.sol");
var Helpers = require('./../helpers.js');

var founderAmount = web3.toWei( 200000000, "ether");
var coreStaffAmount = web3.toWei( 60000000, "ether");
var advisorAmount = web3.toWei( 140000000, "ether");
var reserveAmount = web3.toWei( 330000000, "ether"); 
var bountyAmount = web3.toWei( 40000000, "ether");
var premintedSupply = 1675000000 * 1e18;
var totalSupply = 2000000000 * 1e18;

var converFiney = function(amount){
  return web3.toWei(amount, 'finney');
}
////////////////////////////////////////////////////////////////////////////////

var getBalancePromise = function( account ) {
    return new Promise(function (fulfill, reject){
        web3.eth.getBalance(account,function(err,result){
            if( err ) reject(err);
            else fulfill(result);
        });
    });
};


////////////////////////////////////////////////////////////////////////////////

var buyWithEtherSendingPromise = function( tokenSaleContract, sender, value ) {
    return new Promise(function(fulfill, reject){
            web3.eth.sendTransaction({to: tokenSaleContract.address, from: sender, value: value, gasPrice:50000000000, gas: 150000}, function(error, result){
            if( error ) {
                return reject(error);
            }
            else {
                return fulfill(true);
            }
        });
    });
};

////////////////////////////////////////////////////////////////////////////////


var ETHtoBBO = 20000;

var admin;
var multisig;

var whiteListContract;
var companyTokensContract;
var tokenSaleContract;
var tokenContract;
var privateListContract;
var companyWallet;

var cappedSaleStartTime;
var publicSaleStartTime;
var publicSaleEndTime;



var multisigTokenBalance;
var multisigEthBalance;

var proxyAmount = converFiney(0);

////////////////////////////////////////////////////////////////////////////////

contract('token sale', function(accounts) {

  beforeEach(function(done){
    done();
  });
  afterEach(function(done){
    done();
  });

  it("mine one block to get current time", function() {
    return Helpers.sendPromise( 'evm_mine', [] );
  });

  it("deploy white list", function() {
    return WhiteList.new({from:accounts[3],gas:4700000}).then(function(instance){
        whiteListContract = instance;
        return whiteListContract.listAddresses([accounts[0], accounts[1]],
                                               [1e18, 10e18 ], [10e18, 20e18 ], {from:accounts[2]});
    });
  });

  it("deploy token sale contract", function() {
    var currentTime = web3.eth.getBlock('latest').timestamp;

    publicSaleStartTime = currentTime + 3600; // one hour from now
    publicSaleEndTime = publicSaleStartTime + 15 * 3600;
    publicSaleEndTime7Plus = publicSaleEndTime + 7 * 3600;
    admin = accounts[2];
    multisig = accounts[4];
    
    return Token.new(publicSaleStartTime ,
                                publicSaleEndTime7Plus,
                                admin,
                                founderAmount, 
                                coreStaffAmount,
                                advisorAmount, 
                                reserveAmount, 
                                bountyAmount 
                                  ).then(function(token){
        tokenContract = token;
        console.log('tokenContract Contract: ', tokenContract.address);
        tokenContract.transfer( multisig, premintedSupply );
        
        return PrivateList.new();
    }).then(function(privateList){
        console.log('PrivateList Contract: ', privateList.address);
        privateListContract = privateList;
        tokenContract.freezeAccount(multisig, true);
        tokenContract.setPrivateList(privateList.address); 

        return TokenSale.new( admin,
                                    multisig,
                                    whiteListContract.address,
                                    publicSaleStartTime,
                                    publicSaleEndTime);                     
    }).then(function(result){
        tokenSaleContract = result;
        
        
        
        console.log('TokenSale Contract: ', tokenSaleContract.address);

        return tokenContract.transfer( tokenSaleContract.address,  web3.toWei( 300000000, "ether") );
        
    }).then(function(result){
        return tokenContract.balanceOf(tokenSaleContract.address);
    }).then(function(result){
        assert.equal( result.valueOf(), 3e26, "unexpected contract balance");
        return tokenContract.balanceOf(multisig);
    }).then(function(result){
        assert.equal( result.valueOf(), premintedSupply, "unexpected company balance");
        multisigTokenBalance = result;
        // check eth balance
        return getBalancePromise(multisig);
    }).then(function(result){
        multisigEthBalance = result;
    });
});


 

});
